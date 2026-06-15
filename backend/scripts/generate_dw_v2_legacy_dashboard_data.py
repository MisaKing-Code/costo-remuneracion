import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
DW_ROOT = BASE_DIR / "data" / "datawarehouse" / "v2"
FACTS_DIR = DW_ROOT / "facts"
DIMENSIONS_DIR = DW_ROOT / "dimensions"
QUALITY_DIR = BASE_DIR / "data" / "quality"
LOG_DIR = BASE_DIR / "backend" / "logs"
OUTPUT_DIR = BASE_DIR / "frontend" / "src" / "data" / "generated"

OUTPUT_PATH = OUTPUT_DIR / "maintenanceCostData.dw_v2.json"
REPORT_PATH = QUALITY_DIR / "dw_v2_legacy_dashboard_data_report.txt"
LOG_PATH = LOG_DIR / "generate_dw_v2_legacy_dashboard_data.log"

JOIN_KEY = ["periodo_id", "trabajador_id", "sociedad_id", "centro_negocio_id"]

LEGACY_COLUMNS = [
    "RUT_Sociedad",
    "Nombre_Sociedad",
    "RUT_Trabajador",
    "Nombre_Trabajador",
    "Centro_de_Negocio",
    "Cargo",
    "Tipo_Trabajador",
    "Contrato_Trabajador",
    "Periodo",
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

DATASET_FILES = {
    "fact_remuneraciones": FACTS_DIR / "fact_remuneraciones_mensual.csv",
    "fact_dotacion": FACTS_DIR / "fact_dotacion_mensual.csv",
    "dim_trabajador": DIMENSIONS_DIR / "dim_trabajador.csv",
    "dim_sociedad": DIMENSIONS_DIR / "dim_sociedad.csv",
    "dim_centro_negocio": DIMENSIONS_DIR / "dim_centro_negocio.csv",
    "dim_cargo": DIMENSIONS_DIR / "dim_cargo.csv",
    "dim_contrato": DIMENSIONS_DIR / "dim_contrato.csv",
    "dim_estado_laboral": DIMENSIONS_DIR / "dim_estado_laboral.csv",
}

REQUIRED_COLUMNS = {
    "fact_remuneraciones": [
        *JOIN_KEY,
        "periodo",
        "rut",
        "sociedad",
        "total_haberes",
        "haberes_imponibles",
        "afc_empresa",
        "mutual",
        "sis",
        "seguro_social",
        "cotizacion_expectativa_de_vida",
        "total_asignacion_familiar",
        "total_costo",
    ],
    "fact_dotacion": [
        *JOIN_KEY,
        "cargo_id",
        "contrato_id",
        "estado_laboral_id",
    ],
    "dim_trabajador": ["trabajador_id", "rut", "nombre", "apellido_paterno", "apellido_materno"],
    "dim_sociedad": ["sociedad_id", "sociedad"],
    "dim_centro_negocio": ["centro_negocio_id", "centro_negocio"],
    "dim_cargo": ["cargo_id", "cargo"],
    "dim_contrato": ["contrato_id", "tipo_contratacion"],
    "dim_estado_laboral": ["estado_laboral_id", "tipo_trabajador"],
}

MONEY_FIELD_MAP = {
    "Total_Haberes": "total_haberes",
    "Haberes_Imponibles": "haberes_imponibles",
    "AFC_Empresa": "afc_empresa",
    "Mutual": "mutual",
    "SIS": "sis",
    "Seguro_Social": "seguro_social",
    "Expectativa_de_Vida": "cotizacion_expectativa_de_vida",
    "Asignación_Familiar": "total_asignacion_familiar",
    "Total_Costo": "total_costo",
}


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


def read_csv_dataset(name, path):
    if not path.exists():
        raise FileNotFoundError(f"No existe archivo requerido: {path}")

    df = pd.read_csv(path, encoding="utf-8-sig")
    logging.info("Leido %s: %s filas", path, len(df))
    return df


def validate_columns(name, df):
    missing = [column for column in REQUIRED_COLUMNS[name] if column not in df.columns]
    if missing:
        raise ValueError(f"{name} no contiene columnas obligatorias: {', '.join(missing)}")


def load_datasets():
    datasets = {}
    for name, path in DATASET_FILES.items():
        datasets[name] = read_csv_dataset(name, path)
        validate_columns(name, datasets[name])
    return datasets


def normalize_text(value, fallback="Sin dato"):
    if pd.isna(value):
        return fallback

    text = " ".join(str(value).strip().split())
    return text if text else fallback


def title_text(value, fallback="Sin dato"):
    text = normalize_text(value, fallback="")
    if not text:
        return fallback

    return text.title()


def build_worker_name(row):
    parts = [
        normalize_text(row.get("nombre"), fallback=""),
        normalize_text(row.get("apellido_paterno"), fallback=""),
        normalize_text(row.get("apellido_materno"), fallback=""),
    ]
    full_name = " ".join(part for part in parts if part)
    return title_text(full_name)


def coerce_money(series):
    return pd.to_numeric(series, errors="coerce").fillna(0).round(0).astype(int)


def validate_grain(df, dataset_name, errors):
    duplicates = int(df.duplicated(subset=JOIN_KEY, keep=False).sum())
    if duplicates:
        errors.append(f"{dataset_name}: {duplicates} filas duplicadas por clave {', '.join(JOIN_KEY)}")
    return duplicates


def merge_sources(datasets, warnings, errors):
    remuneraciones = datasets["fact_remuneraciones"].copy()
    dotacion = datasets["fact_dotacion"].copy()

    validate_grain(remuneraciones, "fact_remuneraciones", errors)
    validate_grain(dotacion, "fact_dotacion", errors)
    if errors:
        raise ValueError("; ".join(errors))

    dotacion_attrs = dotacion[[*JOIN_KEY, "cargo_id", "contrato_id", "estado_laboral_id"]].copy()
    merged = remuneraciones.merge(dotacion_attrs, how="left", on=JOIN_KEY, indicator="dotacion_match")

    missing_dotacion = int((merged["dotacion_match"] == "left_only").sum())
    if missing_dotacion:
        warnings.append(f"{missing_dotacion} filas de remuneraciones sin match en dotacion.")
    merged = merged.drop(columns=["dotacion_match"])

    rem_keys = set(remuneraciones[JOIN_KEY].astype(str).agg("|".join, axis=1))
    dot_keys = dotacion[JOIN_KEY].astype(str).agg("|".join, axis=1)
    dotacion_without_remuneracion = int((~dot_keys.isin(rem_keys)).sum())
    if dotacion_without_remuneracion:
        warnings.append(f"{dotacion_without_remuneracion} filas de dotacion no tienen remuneracion equivalente.")

    merged = merged.merge(datasets["dim_trabajador"], how="left", on="trabajador_id", suffixes=("", "_trabajador"))
    merged = merged.merge(datasets["dim_sociedad"], how="left", on="sociedad_id", suffixes=("", "_dimension"))
    merged = merged.merge(datasets["dim_centro_negocio"], how="left", on="centro_negocio_id")
    merged = merged.merge(datasets["dim_cargo"], how="left", on="cargo_id")
    merged = merged.merge(datasets["dim_contrato"], how="left", on="contrato_id")
    merged = merged.merge(datasets["dim_estado_laboral"], how="left", on="estado_laboral_id")

    return merged


def build_legacy_records(merged, warnings):
    output = pd.DataFrame(index=merged.index)
    source_sociedad = merged["sociedad_dimension"].where(merged["sociedad_dimension"].notna(), merged["sociedad"])

    output["RUT_Sociedad"] = "Sin dato"
    output["Nombre_Sociedad"] = source_sociedad.map(lambda value: normalize_text(value))
    output["RUT_Trabajador"] = merged["rut_trabajador"].where(merged["rut_trabajador"].notna(), merged["rut"]).map(
        lambda value: normalize_text(value)
    )
    output["Nombre_Trabajador"] = merged.apply(build_worker_name, axis=1)
    output["Centro_de_Negocio"] = merged["centro_negocio"].map(lambda value: title_text(value))
    output["Cargo"] = merged["cargo"].map(lambda value: title_text(value))
    output["Tipo_Trabajador"] = merged["tipo_trabajador"].map(lambda value: title_text(value))
    output["Contrato_Trabajador"] = merged["tipo_contratacion"].map(lambda value: title_text(value))
    output["Periodo"] = merged["periodo"].map(lambda value: normalize_text(value))

    for legacy_field, source_field in MONEY_FIELD_MAP.items():
        output[legacy_field] = coerce_money(merged[source_field])

    output["Empresa_Corta"] = output["Nombre_Sociedad"].map(lambda value: normalize_text(value).replace("_", " "))

    fallback_counts = {
        "RUT_Sociedad": int(len(output)),
        "Nombre_Sociedad": int(len(output)),
        "Empresa_Corta": int(len(output)),
        "Cargo": int((output["Cargo"] == "Sin dato").sum()),
        "Tipo_Trabajador": int((output["Tipo_Trabajador"] == "Sin dato").sum()),
        "Contrato_Trabajador": int((output["Contrato_Trabajador"] == "Sin dato").sum()),
    }

    if fallback_counts["RUT_Sociedad"]:
        warnings.append(f"Fallback RUT_Sociedad='Sin dato' aplicado a {fallback_counts['RUT_Sociedad']} registros.")
    if fallback_counts["Nombre_Sociedad"]:
        warnings.append(
            "Fallback Nombre_Sociedad usando codigo de sociedad DW V2 aplicado a "
            f"{fallback_counts['Nombre_Sociedad']} registros."
        )
    if fallback_counts["Empresa_Corta"]:
        warnings.append(
            "Fallback Empresa_Corta derivado desde Nombre_Sociedad aplicado a "
            f"{fallback_counts['Empresa_Corta']} registros."
        )

    output = output[LEGACY_COLUMNS].sort_values(
        ["Nombre_Sociedad", "Centro_de_Negocio", "Nombre_Trabajador", "RUT_Trabajador"],
        kind="mergesort",
    )

    return output, fallback_counts


def validate_output(output):
    missing_columns = [column for column in LEGACY_COLUMNS if column not in output.columns]
    if missing_columns:
        raise ValueError(f"Salida sin columnas legacy obligatorias: {', '.join(missing_columns)}")

    if output.empty:
        raise ValueError("La salida no contiene registros.")

    null_required = [
        column
        for column in ["RUT_Trabajador", "Nombre_Trabajador", "Nombre_Sociedad", "Centro_de_Negocio", "Total_Costo"]
        if output[column].isna().any()
    ]
    if null_required:
        raise ValueError(f"Salida con nulos en campos criticos: {', '.join(null_required)}")


def build_metadata(output):
    periods = sorted(output.attrs.get("periods", []))
    period_label = "Sin periodo"
    if len(periods) == 1:
        period_label = periods[0]
    elif len(periods) > 1:
        period_label = f"{periods[0]} a {periods[-1]}"

    return {
        "sourceFile": "data/datawarehouse/v2",
        "sheet": "DW_V2",
        "period": period_label,
        "workerCount": int(output["RUT_Trabajador"].nunique()),
        "companyCount": int(output["Nombre_Sociedad"].nunique()),
        "totalCost": int(output["Total_Costo"].sum()),
        "columns": LEGACY_COLUMNS,
        "generatedAt": datetime.now().replace(microsecond=0).isoformat(),
        "schemaVersion": "legacy-from-dw-v2.1",
        "sourceSheet": "fact_remuneraciones_mensual",
        "recordCount": int(len(output)),
    }


def write_json(output, metadata):
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    payload = {
        "metadata": metadata,
        "records": output.to_dict(orient="records"),
    }
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    logging.info("JSON generado: %s", OUTPUT_PATH)


def write_report(metadata, fallback_counts, warnings, errors):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    lines = [
        "Reporte adapter DW V2 -> contrato legacy dashboard",
        f"Generado: {datetime.now().replace(microsecond=0).isoformat()}",
        "",
        "Archivos de entrada:",
    ]
    for name, path in DATASET_FILES.items():
        lines.append(f"- {name}: {path.relative_to(BASE_DIR)}")

    lines.extend(
        [
            "",
            "Archivo de salida:",
            f"- {OUTPUT_PATH.relative_to(BASE_DIR)}",
            "",
            "Metadata de salida:",
            f"- Registros: {metadata['recordCount']}",
            f"- Trabajadores unicos: {metadata['workerCount']}",
            f"- Empresas unicas: {metadata['companyCount']}",
            f"- Periodo: {metadata['period']}",
            f"- Total costo: {metadata['totalCost']}",
            "",
            "Campos generados:",
            "- " + ", ".join(LEGACY_COLUMNS),
            "",
            "Fallbacks aplicados:",
        ]
    )
    for field, count in fallback_counts.items():
        lines.append(f"- {field}: {count}")

    lines.append("")
    lines.append("Advertencias:")
    if warnings:
        lines.extend(f"- {warning}" for warning in warnings)
    else:
        lines.append("- Sin advertencias.")

    lines.append("")
    lines.append("Errores:")
    if errors:
        lines.extend(f"- {error}" for error in errors)
    else:
        lines.append("- Sin errores.")

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    logging.info("Reporte generado: %s", REPORT_PATH)


def generate():
    warnings = []
    errors = []
    datasets = load_datasets()
    merged = merge_sources(datasets, warnings, errors)
    output, fallback_counts = build_legacy_records(merged, warnings)
    output.attrs["periods"] = sorted(datasets["fact_remuneraciones"]["periodo"].dropna().astype(str).unique().tolist())
    validate_output(output)
    metadata = build_metadata(output)
    write_json(output, metadata)
    write_report(metadata, fallback_counts, warnings, errors)
    return metadata, fallback_counts, warnings, errors


def main():
    configure_logging()
    logging.info("Iniciando generacion de JSON legacy desde DW V2")
    metadata, fallback_counts, warnings, errors = generate()
    logging.info("Registros generados: %s", metadata["recordCount"])
    logging.info("Fallbacks aplicados: %s", fallback_counts)
    if warnings:
        logging.warning("Advertencias: %s", " | ".join(warnings))
    if errors:
        logging.error("Errores: %s", " | ".join(errors))
    logging.info("Proceso finalizado")


if __name__ == "__main__":
    main()
