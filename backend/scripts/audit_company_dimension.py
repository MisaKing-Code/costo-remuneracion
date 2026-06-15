import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
DIM_COMPANY_PATH = BASE_DIR / "data" / "datawarehouse" / "v2" / "dimensions" / "dim_company.csv"
DIM_SOCIEDAD_PATH = BASE_DIR / "data" / "datawarehouse" / "v2" / "dimensions" / "dim_sociedad.csv"
DASHBOARD_DATASET_PATH = BASE_DIR / "frontend" / "src" / "data" / "generated" / "maintenanceCostData.dw_v2.json"
QUALITY_DIR = BASE_DIR / "data" / "quality"
LOG_DIR = BASE_DIR / "backend" / "logs"

REPORT_PATH = QUALITY_DIR / "company_dimension_audit_report.txt"
LOG_PATH = LOG_DIR / "company_dimension_audit.log"

REQUIRED_COLUMNS = [
    "company_id",
    "sociedad_id",
    "source_sociedad_code",
    "rut_sociedad",
    "legal_name",
    "display_name",
    "short_name",
    "business_group",
    "is_active",
    "homologation_status",
    "created_at",
    "updated_at",
]

VALID_HOMOLOGATION_STATUS = {"pending", "approved", "rejected"}
VALID_BOOLEAN_VALUES = {"true", "false", "1", "0", "yes", "no", "y", "n", "si", "no"}


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


def read_csv(path):
    if not path.exists():
        raise FileNotFoundError(f"No existe archivo requerido: {path}")

    df = pd.read_csv(path, encoding="utf-8-sig", keep_default_na=False)
    logging.info("Archivo leido: %s (%s filas)", path, len(df))
    return df


def read_dashboard_records(path):
    if not path.exists():
        raise FileNotFoundError(f"No existe archivo requerido: {path}")

    payload = json.loads(path.read_text(encoding="utf-8-sig"))
    records = payload.get("records")
    if not isinstance(records, list):
        raise ValueError("El dataset dashboard no contiene records como lista.")

    df = pd.DataFrame(records)
    logging.info("Dataset dashboard leido: %s (%s filas)", path, len(df))
    return df


def blank_mask(series):
    return series.isna() | series.astype(str).str.strip().eq("")


def validate_required_columns(df, errors):
    missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]
    if missing:
        errors.append("dim_company no contiene columnas obligatorias: " + ", ".join(missing))


def validate_unique(df, field, errors):
    if field not in df.columns:
        return
    duplicated = df[df[field].duplicated(keep=False)]
    if not duplicated.empty:
        values = sorted(duplicated[field].astype(str).unique().tolist())
        errors.append(f"{field} contiene valores duplicados: {', '.join(values)}")


def validate_sociedad_coverage(company_df, sociedad_df, dashboard_df, errors):
    if {"sociedad_id", "source_sociedad_code"} - set(company_df.columns):
        return

    dim_sociedad_ids = set(sociedad_df["sociedad_id"].astype(str))
    company_sociedad_ids = set(company_df["sociedad_id"].astype(str))
    missing_from_company = sorted(dim_sociedad_ids - company_sociedad_ids)
    if missing_from_company:
        errors.append("Sociedades de dim_sociedad ausentes en dim_company: " + ", ".join(missing_from_company))

    sociedad_codes = set(sociedad_df["sociedad"].astype(str))
    company_codes = set(company_df["source_sociedad_code"].astype(str))
    missing_codes = sorted(sociedad_codes - company_codes)
    if missing_codes:
        errors.append("Codigos de dim_sociedad ausentes en dim_company: " + ", ".join(missing_codes))

    if "Nombre_Sociedad" in dashboard_df.columns:
        dashboard_companies = set(dashboard_df["Nombre_Sociedad"].dropna().astype(str))
        display_names = set(company_df["display_name"].astype(str)) if "display_name" in company_df.columns else set()
        short_names = set(company_df["short_name"].astype(str)) if "short_name" in company_df.columns else set()
        accepted_names = company_codes | display_names | short_names
        missing_dashboard_companies = sorted(dashboard_companies - accepted_names)
        if missing_dashboard_companies:
            errors.append(
                "Sociedades usadas en dashboard ausentes en dim_company: " + ", ".join(missing_dashboard_companies)
            )
    else:
        errors.append("Dataset dashboard no contiene campo Nombre_Sociedad.")


def validate_status_and_boolean(df, errors):
    if "homologation_status" in df.columns:
        invalid = sorted(
            set(df["homologation_status"].astype(str).str.strip().str.lower()) - VALID_HOMOLOGATION_STATUS - {""}
        )
        if invalid:
            errors.append("homologation_status invalido: " + ", ".join(invalid))

    if "is_active" in df.columns:
        invalid_bool = sorted(set(df["is_active"].astype(str).str.strip().str.lower()) - VALID_BOOLEAN_VALUES - {""})
        if invalid_bool:
            errors.append("is_active no interpretable como booleano: " + ", ".join(invalid_bool))


def validate_required_text(df, errors):
    for field in ["display_name", "short_name"]:
        if field not in df.columns:
            continue
        missing_count = int(blank_mask(df[field]).sum())
        if missing_count:
            errors.append(f"{field} contiene {missing_count} valores vacios.")


def collect_warnings(df):
    warnings = []

    if "rut_sociedad" in df.columns:
        pending_rut = int(blank_mask(df["rut_sociedad"]).sum())
        if pending_rut:
            warnings.append(f"rut_sociedad pendiente en {pending_rut} registros.")

    if "legal_name" in df.columns:
        pending_legal_name = int(blank_mask(df["legal_name"]).sum())
        if pending_legal_name:
            warnings.append(f"legal_name pendiente en {pending_legal_name} registros.")

    pending_status = 0
    if "homologation_status" in df.columns:
        pending_status = int((df["homologation_status"].astype(str).str.lower() == "pending").sum())
        if pending_status:
            warnings.append(f"homologation_status pending en {pending_status} registros.")

    return warnings


def build_recommendations(errors, warnings):
    recommendations = []

    if errors:
        recommendations.append("Corregir errores criticos antes de usar dim_company como fuente oficial.")
    else:
        recommendations.append("dim_company es apta tecnicamente como fuente de etiquetas actuales del dashboard.")

    if any("rut_sociedad pendiente" in warning for warning in warnings):
        recommendations.append("Completar rut_sociedad con fuente corporativa oficial.")
    if any("legal_name pendiente" in warning for warning in warnings):
        recommendations.append("Completar legal_name antes de aprobar la homologacion.")
    if any("homologation_status pending" in warning for warning in warnings):
        recommendations.append("Cambiar homologation_status a approved solo tras validacion de negocio.")

    return recommendations


def write_report(company_df, sociedad_df, dashboard_df, errors, warnings, recommendations):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)

    dashboard_companies = []
    if "Nombre_Sociedad" in dashboard_df.columns:
        dashboard_companies = sorted(dashboard_df["Nombre_Sociedad"].dropna().astype(str).unique().tolist())

    lines = [
        "Auditoria dim_company",
        f"Generado: {datetime.now().replace(microsecond=0).isoformat()}",
        "",
        "Archivos analizados:",
        f"- {DIM_COMPANY_PATH.relative_to(BASE_DIR)}",
        f"- {DIM_SOCIEDAD_PATH.relative_to(BASE_DIR)}",
        f"- {DASHBOARD_DATASET_PATH.relative_to(BASE_DIR)}",
        "",
        "Resumen:",
        f"- Registros dim_company: {len(company_df)}",
        f"- Registros dim_sociedad: {len(sociedad_df)}",
        f"- Registros dashboard: {len(dashboard_df)}",
        "- Sociedades dashboard: " + (", ".join(dashboard_companies) if dashboard_companies else "N/D"),
        "",
        "Columnas dim_company:",
        "- " + ", ".join(company_df.columns),
        "",
        "Estado de auditoria:",
        "ERROR" if errors else "OK",
        "",
        "Errores criticos:",
    ]

    if errors:
        lines.extend(f"- {error}" for error in errors)
    else:
        lines.append("- Sin errores criticos.")

    lines.append("")
    lines.append("Advertencias:")
    if warnings:
        lines.extend(f"- {warning}" for warning in warnings)
    else:
        lines.append("- Sin advertencias.")

    lines.append("")
    lines.append("Recomendaciones:")
    lines.extend(f"- {recommendation}" for recommendation in recommendations)

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    logging.info("Reporte generado: %s", REPORT_PATH)


def run_audit():
    errors = []
    company_df = read_csv(DIM_COMPANY_PATH)
    sociedad_df = read_csv(DIM_SOCIEDAD_PATH)
    dashboard_df = read_dashboard_records(DASHBOARD_DATASET_PATH)

    validate_required_columns(company_df, errors)
    for field in ["company_id", "sociedad_id", "source_sociedad_code"]:
        validate_unique(company_df, field, errors)
    validate_sociedad_coverage(company_df, sociedad_df, dashboard_df, errors)
    validate_status_and_boolean(company_df, errors)
    validate_required_text(company_df, errors)

    warnings = collect_warnings(company_df)
    recommendations = build_recommendations(errors, warnings)
    write_report(company_df, sociedad_df, dashboard_df, errors, warnings, recommendations)
    return errors, warnings, recommendations


def main():
    configure_logging()
    logging.info("Iniciando auditoria de dim_company")
    errors, warnings, recommendations = run_audit()
    if errors:
        logging.error("Errores criticos: %s", " | ".join(errors))
    if warnings:
        logging.warning("Advertencias: %s", " | ".join(warnings))
    logging.info("Recomendaciones: %s", " | ".join(recommendations))
    logging.info("Auditoria finalizada")


if __name__ == "__main__":
    main()
