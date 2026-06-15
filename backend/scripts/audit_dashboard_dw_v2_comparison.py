import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
LEGACY_JSON_PATH = BASE_DIR / "frontend" / "src" / "data" / "legacy" / "maintenanceCostData.json"
DW_V2_JSON_PATH = BASE_DIR / "frontend" / "src" / "data" / "generated" / "maintenanceCostData.dw_v2.json"
QUALITY_DIR = BASE_DIR / "data" / "quality"
LOG_DIR = BASE_DIR / "backend" / "logs"

REPORT_PATH = QUALITY_DIR / "dashboard_dw_v2_comparison_report.txt"
LOG_PATH = LOG_DIR / "dashboard_dw_v2_comparison.log"

CRITICAL_FIELDS = [
    "Nombre_Sociedad",
    "Centro_de_Negocio",
    "Tipo_Trabajador",
    "Contrato_Trabajador",
    "RUT_Trabajador",
    "Nombre_Trabajador",
    "Cargo",
    "Total_Haberes",
    "Haberes_Imponibles",
    "AFC_Empresa",
    "Mutual",
    "SIS",
    "Seguro_Social",
    "Expectativa_de_Vida",
    "Asignación_Familiar",
    "Total_Costo",
    "Empresa_Corta",
]

NUMERIC_FIELDS = [
    "Total_Haberes",
    "Haberes_Imponibles",
    "AFC_Empresa",
    "Mutual",
    "SIS",
    "Seguro_Social",
    "Expectativa_de_Vida",
    "Asignación_Familiar",
    "Total_Costo",
]

DIMENSION_FIELDS = [
    "RUT_Trabajador",
    "Nombre_Sociedad",
    "Centro_de_Negocio",
]

PERIOD_CANDIDATES = ["Periodo", "periodo", "Period", "period"]


def configure_logging():
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[
            logging.FileHandler(LOG_PATH, encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )


def load_json_dataset(path):
    if not path.exists():
        raise FileNotFoundError(f"No existe archivo requerido: {path}")

    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    records = payload.get("records")
    metadata = payload.get("metadata", {})

    if not isinstance(records, list):
        raise ValueError(f"{path} no contiene records como lista.")
    if not isinstance(metadata, dict):
        raise ValueError(f"{path} no contiene metadata como objeto.")

    df = pd.DataFrame(records)
    logging.info("Dataset cargado: %s (%s registros)", path, len(df))
    return {"path": path, "metadata": metadata, "df": df}


def numeric_sum(df, field):
    if field not in df.columns:
        return None
    return int(pd.to_numeric(df[field], errors="coerce").fillna(0).sum())


def unique_count(df, field):
    if field not in df.columns:
        return None
    return int(df[field].dropna().astype(str).nunique())


def period_range(df, metadata):
    for field in PERIOD_CANDIDATES:
        if field in df.columns:
            values = sorted(df[field].dropna().astype(str).unique().tolist())
            if values:
                return values[0], values[-1], field

    metadata_period = metadata.get("period")
    if metadata_period:
        return str(metadata_period), str(metadata_period), "metadata.period"

    return None, None, None


def infer_type(df, field):
    if field not in df.columns:
        return "MISSING"

    series = df[field].dropna()
    if series.empty:
        return "empty"

    if pd.api.types.is_numeric_dtype(series):
        return str(series.dtype)

    numeric = pd.to_numeric(series, errors="coerce")
    if numeric.notna().all():
        return "numeric-compatible"

    return "text"


def null_count(df, field):
    if field not in df.columns:
        return None

    series = df[field]
    blank_mask = series.astype(str).str.strip().isin(["", "nan", "NaN", "None"])
    return int(series.isna().sum() + blank_mask.sum())


def build_metrics(dataset):
    df = dataset["df"]
    metadata = dataset["metadata"]
    min_period, max_period, period_source = period_range(df, metadata)

    return {
        "records": int(len(df)),
        "unique_workers": unique_count(df, "RUT_Trabajador"),
        "unique_companies": unique_count(df, "Nombre_Sociedad"),
        "unique_business_centers": unique_count(df, "Centro_de_Negocio"),
        "total_haberes": numeric_sum(df, "Total_Haberes"),
        "total_cost": numeric_sum(df, "Total_Costo"),
        "min_period": min_period,
        "max_period": max_period,
        "period_source": period_source,
    }


def format_value(value):
    if value is None:
        return "N/D"
    return str(value)


def diff_number(left, right):
    if left is None or right is None:
        return "N/D"
    return str(right - left)


def compare_fields(legacy_df, dw_v2_df):
    legacy_fields = set(legacy_df.columns)
    dw_v2_fields = set(dw_v2_df.columns)
    return {
        "both": sorted(legacy_fields & dw_v2_fields),
        "legacy_only": sorted(legacy_fields - dw_v2_fields),
        "dw_v2_only": sorted(dw_v2_fields - legacy_fields),
    }


def collect_nulls(df):
    return {field: null_count(df, field) for field in CRITICAL_FIELDS}


def collect_types(df):
    return {field: infer_type(df, field) for field in CRITICAL_FIELDS}


def collect_critical_differences(legacy_metrics, dw_v2_metrics, fields, legacy_nulls, dw_v2_nulls, legacy_types, dw_v2_types):
    differences = []

    if fields["legacy_only"]:
        differences.append("DW V2 no contiene campos presentes en legacy: " + ", ".join(fields["legacy_only"]))
    if fields["dw_v2_only"]:
        differences.append("DW V2 contiene campos adicionales: " + ", ".join(fields["dw_v2_only"]))

    for field in CRITICAL_FIELDS:
        if field not in fields["both"]:
            differences.append(f"Campo critico no presente en ambos datasets: {field}")

    for field in CRITICAL_FIELDS:
        dw_null_count = dw_v2_nulls.get(field)
        if dw_null_count:
            differences.append(f"DW V2 tiene {dw_null_count} nulos/blancos en campo critico {field}.")

    for field in NUMERIC_FIELDS:
        if legacy_types.get(field) not in ("int64", "float64", "numeric-compatible") and legacy_types.get(field) != "MISSING":
            differences.append(f"Legacy tiene tipo no numerico en {field}: {legacy_types.get(field)}")
        if dw_v2_types.get(field) not in ("int64", "float64", "numeric-compatible") and dw_v2_types.get(field) != "MISSING":
            differences.append(f"DW V2 tiene tipo no numerico en {field}: {dw_v2_types.get(field)}")

    if legacy_metrics["records"] != dw_v2_metrics["records"]:
        differences.append(
            f"Diferencia de universo: legacy tiene {legacy_metrics['records']} registros y DW V2 tiene {dw_v2_metrics['records']}."
        )
    if legacy_metrics["unique_business_centers"] != dw_v2_metrics["unique_business_centers"]:
        differences.append(
            "Diferencia de centros de negocio unicos: "
            f"legacy={legacy_metrics['unique_business_centers']} vs DW V2={dw_v2_metrics['unique_business_centers']}."
        )
    if legacy_metrics["total_cost"] != dw_v2_metrics["total_cost"]:
        differences.append(
            f"Diferencia de Total_Costo: legacy={legacy_metrics['total_cost']} vs DW V2={dw_v2_metrics['total_cost']}."
        )

    return differences


def merge_recommendation(critical_differences):
    blockers = [
        item
        for item in critical_differences
        if item.startswith("Campo critico")
        or "nulos/blancos" in item
        or item.startswith("DW V2 tiene tipo no numerico")
    ]

    universe_differences = [
        item
        for item in critical_differences
        if item.startswith("Diferencia de universo")
        or item.startswith("Diferencia de centros")
        or item.startswith("Diferencia de Total_Costo")
    ]

    if blockers:
        return "NO APTO para merge sin corregir campos criticos, nulos o tipos."
    if universe_differences:
        return "APTO CON OBSERVACIONES solo si el cambio de universo legacy -> DW V2 esta aprobado por negocio."
    return "APTO para merge desde la perspectiva de contrato y metricas comparadas."


def write_report(legacy, dw_v2, legacy_metrics, dw_v2_metrics, fields, legacy_nulls, dw_v2_nulls, legacy_types, dw_v2_types, critical_differences):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    recommendation = merge_recommendation(critical_differences)

    lines = [
        "Auditoria comparativa dashboard legacy vs DW V2",
        f"Generado: {datetime.now().replace(microsecond=0).isoformat()}",
        "",
        "Archivos comparados:",
        f"- Legacy: {legacy['path'].relative_to(BASE_DIR)}",
        f"- DW V2: {dw_v2['path'].relative_to(BASE_DIR)}",
        "",
        "=== Resumen comparativo ===",
        "Metrica | Legacy | DW V2 | Diferencia DW V2 - Legacy",
        "--- | ---: | ---: | ---:",
    ]

    metric_rows = [
        ("Cantidad de registros", "records"),
        ("Trabajadores unicos", "unique_workers"),
        ("Empresas unicas", "unique_companies"),
        ("Centros de negocio unicos", "unique_business_centers"),
        ("Total haberes", "total_haberes"),
        ("Total costo", "total_cost"),
    ]
    for label, key in metric_rows:
        lines.append(
            f"{label} | {format_value(legacy_metrics[key])} | {format_value(dw_v2_metrics[key])} | "
            f"{diff_number(legacy_metrics[key], dw_v2_metrics[key])}"
        )

    lines.extend(
        [
            "",
            "Periodos:",
            f"- Legacy minimo: {format_value(legacy_metrics['min_period'])}",
            f"- Legacy maximo: {format_value(legacy_metrics['max_period'])}",
            f"- Legacy fuente periodo: {format_value(legacy_metrics['period_source'])}",
            f"- DW V2 minimo: {format_value(dw_v2_metrics['min_period'])}",
            f"- DW V2 maximo: {format_value(dw_v2_metrics['max_period'])}",
            f"- DW V2 fuente periodo: {format_value(dw_v2_metrics['period_source'])}",
            "",
            "=== Campos ===",
            f"Campos presentes en ambos ({len(fields['both'])}): {', '.join(fields['both']) or 'Ninguno'}",
            f"Campos solo en legacy ({len(fields['legacy_only'])}): {', '.join(fields['legacy_only']) or 'Ninguno'}",
            f"Campos solo en DW V2 ({len(fields['dw_v2_only'])}): {', '.join(fields['dw_v2_only']) or 'Ninguno'}",
            "",
            "=== Nulos por campos criticos ===",
            "Campo | Legacy | DW V2",
            "--- | ---: | ---:",
        ]
    )
    for field in CRITICAL_FIELDS:
        lines.append(f"{field} | {format_value(legacy_nulls[field])} | {format_value(dw_v2_nulls[field])}")

    lines.extend(
        [
            "",
            "=== Tipos de datos de campos criticos ===",
            "Campo | Legacy | DW V2",
            "--- | --- | ---",
        ]
    )
    for field in CRITICAL_FIELDS:
        lines.append(f"{field} | {legacy_types[field]} | {dw_v2_types[field]}")

    lines.extend(
        [
            "",
            "=== Diferencias criticas ===",
        ]
    )
    if critical_differences:
        lines.extend(f"- {item}" for item in critical_differences)
    else:
        lines.append("- No se detectaron diferencias criticas.")

    lines.extend(
        [
            "",
            "=== Recomendacion ===",
            recommendation,
        ]
    )

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    logging.info("Reporte generado: %s", REPORT_PATH)
    return recommendation


def run_audit():
    legacy = load_json_dataset(LEGACY_JSON_PATH)
    dw_v2 = load_json_dataset(DW_V2_JSON_PATH)

    legacy_metrics = build_metrics(legacy)
    dw_v2_metrics = build_metrics(dw_v2)
    fields = compare_fields(legacy["df"], dw_v2["df"])
    legacy_nulls = collect_nulls(legacy["df"])
    dw_v2_nulls = collect_nulls(dw_v2["df"])
    legacy_types = collect_types(legacy["df"])
    dw_v2_types = collect_types(dw_v2["df"])
    critical_differences = collect_critical_differences(
        legacy_metrics,
        dw_v2_metrics,
        fields,
        legacy_nulls,
        dw_v2_nulls,
        legacy_types,
        dw_v2_types,
    )

    recommendation = write_report(
        legacy,
        dw_v2,
        legacy_metrics,
        dw_v2_metrics,
        fields,
        legacy_nulls,
        dw_v2_nulls,
        legacy_types,
        dw_v2_types,
        critical_differences,
    )
    return legacy_metrics, dw_v2_metrics, critical_differences, recommendation


def main():
    configure_logging()
    logging.info("Iniciando auditoria comparativa dashboard legacy vs DW V2")
    legacy_metrics, dw_v2_metrics, critical_differences, recommendation = run_audit()
    logging.info("Legacy registros=%s total_costo=%s", legacy_metrics["records"], legacy_metrics["total_cost"])
    logging.info("DW V2 registros=%s total_costo=%s", dw_v2_metrics["records"], dw_v2_metrics["total_cost"])
    if critical_differences:
        logging.warning("Diferencias criticas: %s", " | ".join(critical_differences))
    logging.info("Recomendacion: %s", recommendation)
    logging.info("Auditoria finalizada")


if __name__ == "__main__":
    main()
