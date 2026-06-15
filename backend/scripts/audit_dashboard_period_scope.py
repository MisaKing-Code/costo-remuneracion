import json
import logging
import re
from datetime import datetime
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
DATASET_PATH = BASE_DIR / "frontend" / "src" / "data" / "generated" / "maintenanceCostData.dw_v2.json"
QUALITY_DIR = BASE_DIR / "data" / "quality"
LOG_DIR = BASE_DIR / "backend" / "logs"

REPORT_PATH = QUALITY_DIR / "dashboard_period_scope_audit_report.txt"
LOG_PATH = LOG_DIR / "dashboard_period_scope_audit.log"

PERIOD_PATTERN = re.compile(r"^\d{4}-\d{2}$")


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


def load_dataset():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"No existe archivo requerido: {DATASET_PATH}")

    payload = json.loads(DATASET_PATH.read_text(encoding="utf-8-sig"))
    records = payload.get("records")
    if not isinstance(records, list):
        raise ValueError("El dataset no contiene records como lista.")

    df = pd.DataFrame(records)
    logging.info("Dataset cargado: %s (%s registros)", DATASET_PATH, len(df))
    return df


def sum_money(df, field):
    if field not in df.columns:
        return 0
    return int(pd.to_numeric(df[field], errors="coerce").fillna(0).sum())


def unique_count(df, field):
    if field not in df.columns:
        return 0
    return int(df[field].dropna().astype(str).nunique())


def collect_metrics(df):
    return {
        "records": int(len(df)),
        "workers": unique_count(df, "RUT_Trabajador"),
        "total_cost": sum_money(df, "Total_Costo"),
        "business_centers": unique_count(df, "Centro_de_Negocio"),
        "companies": unique_count(df, "Nombre_Sociedad"),
    }


def validate_period_scope(df):
    errors = []
    warnings = []

    if "Periodo" not in df.columns:
        errors.append("El dataset no contiene campo Periodo.")
        return [], None, pd.DataFrame(), errors, warnings

    period_series = df["Periodo"]
    missing_period = int(period_series.isna().sum() + period_series.astype(str).str.strip().eq("").sum())
    if missing_period:
        errors.append(f"Hay {missing_period} registros sin Periodo.")

    periods = sorted(period_series.dropna().astype(str).str.strip().unique().tolist())
    invalid_periods = [period for period in periods if not PERIOD_PATTERN.match(period)]
    if invalid_periods:
        errors.append("Periodos con formato invalido: " + ", ".join(invalid_periods))

    last_period = periods[-1] if periods else None
    if not last_period:
        errors.append("No se detecto ultimo periodo.")
        return periods, last_period, pd.DataFrame(), errors, warnings

    last_period_df = df[df["Periodo"].astype(str).str.strip() == last_period].copy()
    if last_period_df.empty:
        errors.append(f"El ultimo periodo detectado ({last_period}) no tiene registros.")

    total_metrics = collect_metrics(df)
    last_period_metrics = collect_metrics(last_period_df)
    if last_period_metrics["records"] > total_metrics["records"]:
        errors.append("Los registros del ultimo periodo superan el total acumulado.")
    if last_period_metrics["total_cost"] > total_metrics["total_cost"]:
        errors.append("El Total_Costo del ultimo periodo supera el total acumulado.")

    if len(periods) == 1:
        warnings.append("Solo existe un periodo disponible; el filtro inicial no reduce universo frente al acumulado.")
    elif last_period_metrics["records"] == total_metrics["records"]:
        warnings.append("El ultimo periodo tiene la misma cantidad de registros que el total acumulado.")

    return periods, last_period, last_period_df, errors, warnings


def percent(part, total):
    if not total:
        return "0.0%"
    return f"{(part / total) * 100:.1f}%"


def recommendation(errors, total_metrics, last_period_metrics):
    if errors:
        return "NO APTO: corregir errores de Periodo antes de confiar en el filtro inicial."

    if last_period_metrics["records"] < total_metrics["records"]:
        return "APTO: el filtro inicial por ultimo periodo reduce el universo frente al acumulado completo."

    return "APTO CON OBSERVACIONES: el periodo inicial es valido, pero no reduce el universo actual."


def write_report(periods, last_period, total_metrics, last_period_metrics, errors, warnings):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    rec = recommendation(errors, total_metrics, last_period_metrics)

    lines = [
        "Auditoria de alcance inicial por Periodo",
        f"Generado: {datetime.now().replace(microsecond=0).isoformat()}",
        "",
        "Dataset:",
        f"- {DATASET_PATH.relative_to(BASE_DIR)}",
        "",
        "Periodos disponibles:",
        "- " + (", ".join(periods) if periods else "Sin periodos"),
        f"Ultimo periodo detectado: {last_period or 'N/D'}",
        "",
        "=== Comparacion total vs ultimo periodo ===",
        "Metrica | Total acumulado | Ultimo periodo | Participacion ultimo periodo",
        "--- | ---: | ---: | ---:",
        (
            f"Registros | {total_metrics['records']} | {last_period_metrics['records']} | "
            f"{percent(last_period_metrics['records'], total_metrics['records'])}"
        ),
        (
            f"Trabajadores unicos | {total_metrics['workers']} | {last_period_metrics['workers']} | "
            f"{percent(last_period_metrics['workers'], total_metrics['workers'])}"
        ),
        (
            f"Total costo | {total_metrics['total_cost']} | {last_period_metrics['total_cost']} | "
            f"{percent(last_period_metrics['total_cost'], total_metrics['total_cost'])}"
        ),
        (
            f"Centros de negocio | {total_metrics['business_centers']} | {last_period_metrics['business_centers']} | "
            f"{percent(last_period_metrics['business_centers'], total_metrics['business_centers'])}"
        ),
        (
            f"Empresas | {total_metrics['companies']} | {last_period_metrics['companies']} | "
            f"{percent(last_period_metrics['companies'], total_metrics['companies'])}"
        ),
        "",
        "=== Validaciones ===",
    ]

    if errors:
        lines.extend(f"ERROR: {error}" for error in errors)
    else:
        lines.append("OK: todos los registros tienen Periodo.")
        lines.append("OK: el ultimo periodo existe.")
        lines.append("OK: el ultimo periodo tiene registros.")
        lines.append("OK: el ultimo periodo no supera el total acumulado.")
        lines.append("OK: el formato de Periodo es YYYY-MM.")

    lines.append("")
    lines.append("=== Advertencias ===")
    if warnings:
        lines.extend(f"- {warning}" for warning in warnings)
    else:
        lines.append("- Sin advertencias.")

    lines.extend(["", "=== Recomendacion ===", rec])

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    logging.info("Reporte generado: %s", REPORT_PATH)
    return rec


def run_audit():
    df = load_dataset()
    periods, last_period, last_period_df, errors, warnings = validate_period_scope(df)
    total_metrics = collect_metrics(df)
    last_period_metrics = collect_metrics(last_period_df)
    rec = write_report(periods, last_period, total_metrics, last_period_metrics, errors, warnings)
    return periods, last_period, total_metrics, last_period_metrics, errors, warnings, rec


def main():
    configure_logging()
    logging.info("Iniciando auditoria de alcance por Periodo")
    periods, last_period, total_metrics, last_period_metrics, errors, warnings, rec = run_audit()
    logging.info("Periodos disponibles: %s", ", ".join(periods))
    logging.info("Ultimo periodo: %s", last_period)
    logging.info("Registros total=%s ultimo_periodo=%s", total_metrics["records"], last_period_metrics["records"])
    if errors:
        logging.error("Errores: %s", " | ".join(errors))
    if warnings:
        logging.warning("Advertencias: %s", " | ".join(warnings))
    logging.info("Recomendacion: %s", rec)
    logging.info("Auditoria finalizada")


if __name__ == "__main__":
    main()
