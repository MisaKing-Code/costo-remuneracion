import argparse
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
TEMPLATE_PATH = BASE_DIR / "data" / "governance" / "company_homologation_template.csv"
DIM_COMPANY_PATH = BASE_DIR / "data" / "datawarehouse" / "v2" / "dimensions" / "dim_company.csv"
SNAPSHOT_DIR = BASE_DIR / "data" / "datawarehouse" / "v2" / "snapshots"
QUALITY_DIR = BASE_DIR / "data" / "quality"
LOG_DIR = BASE_DIR / "backend" / "logs"

REPORT_PATH = QUALITY_DIR / "company_homologation_sync_report.txt"
LOG_PATH = LOG_DIR / "company_homologation_sync.log"

VALID_STATUSES = {"pending", "approved", "rejected"}
KEY_COLUMNS = ["company_id", "sociedad_id", "source_sociedad_code"]
SYNC_COLUMNS = [
    "rut_sociedad",
    "legal_name",
    "display_name",
    "short_name",
    "business_group",
    "homologation_status",
]
APPROVAL_COLUMNS = ["approval_owner", "approval_date", "notes"]
REQUIRED_TEMPLATE_COLUMNS = [*KEY_COLUMNS, *SYNC_COLUMNS, *APPROVAL_COLUMNS]
REQUIRED_DIM_COMPANY_COLUMNS = [
    *KEY_COLUMNS,
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
APPROVED_REQUIRED_COLUMNS = [
    "rut_sociedad",
    "legal_name",
    "display_name",
    "short_name",
    "approval_owner",
    "approval_date",
]


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


def blank(value):
    return str(value).strip() == ""


def validate_columns(name, df, required_columns, errors):
    missing = [column for column in required_columns if column not in df.columns]
    if missing:
        errors.append(f"{name} no contiene columnas obligatorias: {', '.join(missing)}")


def validate_unique(name, df, field, errors):
    if field not in df.columns:
        return
    duplicates = df[df[field].duplicated(keep=False)]
    if not duplicates.empty:
        values = sorted(duplicates[field].astype(str).unique().tolist())
        errors.append(f"{name}.{field} contiene duplicados: {', '.join(values)}")


def validate_template(template, dim_company, errors, warnings):
    validate_columns("template", template, REQUIRED_TEMPLATE_COLUMNS, errors)
    validate_columns("dim_company", dim_company, REQUIRED_DIM_COMPANY_COLUMNS, errors)
    if errors:
        return

    for field in KEY_COLUMNS:
        validate_unique("template", template, field, errors)
        validate_unique("dim_company", dim_company, field, errors)

    template_ids = set(template["company_id"].astype(str))
    dim_ids = set(dim_company["company_id"].astype(str))

    new_ids = sorted(template_ids - dim_ids)
    if new_ids:
        errors.append("Template contiene company_id no existentes en dim_company: " + ", ".join(new_ids))

    missing_ids = sorted(dim_ids - template_ids)
    if missing_ids:
        errors.append("Template no contiene company_id existentes en dim_company: " + ", ".join(missing_ids))

    dim_by_id = dim_company.set_index("company_id")
    for _, row in template.iterrows():
        company_id = str(row["company_id"])
        if company_id not in dim_by_id.index:
            continue

        current = dim_by_id.loc[company_id]
        for field in ["sociedad_id", "source_sociedad_code"]:
            if str(row[field]).strip() != str(current[field]).strip():
                errors.append(
                    f"{company_id}: {field} no coincide. template={row[field]} dim_company={current[field]}"
                )

        status = str(row["homologation_status"]).strip().lower()
        if status not in VALID_STATUSES:
            errors.append(f"{company_id}: homologation_status invalido: {row['homologation_status']}")
            continue

        if status == "approved":
            missing_approved = [field for field in APPROVED_REQUIRED_COLUMNS if blank(row[field])]
            if missing_approved:
                errors.append(f"{company_id}: approved requiere campos: {', '.join(missing_approved)}")

        if status == "pending":
            pending_empty = [field for field in ["rut_sociedad", "legal_name"] if blank(row[field])]
            if pending_empty:
                warnings.append(f"{company_id}: pending con campos incompletos: {', '.join(pending_empty)}")


def detect_changes(template, dim_company):
    changes = []
    dim_by_id = dim_company.set_index("company_id")
    for _, row in template.iterrows():
        company_id = str(row["company_id"])
        if company_id not in dim_by_id.index:
            continue
        current = dim_by_id.loc[company_id]
        for field in SYNC_COLUMNS:
            old = str(current[field]).strip()
            new = str(row[field]).strip()
            if old != new:
                changes.append(
                    {
                        "company_id": company_id,
                        "field": field,
                        "old": old,
                        "new": new,
                    }
                )
    return changes


def apply_changes(template, dim_company):
    now = datetime.now().replace(microsecond=0).isoformat()
    result = dim_company.copy()
    template_by_id = template.set_index("company_id")

    for index, row in result.iterrows():
        company_id = row["company_id"]
        source = template_by_id.loc[company_id]
        changed = False
        for field in SYNC_COLUMNS:
            new_value = str(source[field]).strip()
            if str(result.at[index, field]).strip() != new_value:
                result.at[index, field] = new_value
                changed = True
        if changed:
            result.at[index, "updated_at"] = now

    return result


def create_snapshot():
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    snapshot_path = SNAPSHOT_DIR / f"dim_company_{timestamp}.csv"
    snapshot_path.write_text(DIM_COMPANY_PATH.read_text(encoding="utf-8-sig"), encoding="utf-8")
    logging.info("Snapshot creado: %s", snapshot_path)
    return snapshot_path


def write_report(mode, template, dim_company, changes, errors, warnings, applied, snapshot_path=None):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    lines = [
        "Reporte sincronizacion homologacion de companias",
        f"Generado: {datetime.now().replace(microsecond=0).isoformat()}",
        f"Modo: {mode}",
        "",
        "Archivos:",
        f"- Template: {TEMPLATE_PATH.relative_to(BASE_DIR)}",
        f"- dim_company: {DIM_COMPANY_PATH.relative_to(BASE_DIR)}",
        "",
        "Resumen:",
        f"- Registros template: {len(template)}",
        f"- Registros dim_company: {len(dim_company)}",
        f"- Cambios detectados: {len(changes)}",
        f"- Cambios aplicados: {'si' if applied else 'no'}",
    ]

    if snapshot_path:
        lines.append(f"- Snapshot: {snapshot_path.relative_to(BASE_DIR)}")

    lines.extend(["", "Cambios detectados:"])
    if changes:
        for change in changes:
            lines.append(
                f"- {change['company_id']} {change['field']}: "
                f"'{change['old']}' -> '{change['new']}'"
            )
    else:
        lines.append("- Sin cambios.")

    lines.extend(["", "Errores:"])
    if errors:
        lines.extend(f"- {error}" for error in errors)
    else:
        lines.append("- Sin errores.")

    lines.extend(["", "Advertencias:"])
    if warnings:
        lines.extend(f"- {warning}" for warning in warnings)
    else:
        lines.append("- Sin advertencias.")

    lines.extend(
        [
            "",
            "Resultado:",
            "ERROR: no aplicar cambios hasta resolver errores." if errors else "OK: sincronizacion validada.",
        ]
    )

    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")
    logging.info("Reporte generado: %s", REPORT_PATH)


def run(mode):
    template = read_csv(TEMPLATE_PATH)
    dim_company = read_csv(DIM_COMPANY_PATH)
    errors = []
    warnings = []

    validate_template(template, dim_company, errors, warnings)
    changes = detect_changes(template, dim_company) if not errors else []
    applied = False
    snapshot_path = None

    if mode == "apply":
        if errors:
            logging.error("No se aplican cambios por errores de validacion")
        else:
            snapshot_path = create_snapshot()
            updated = apply_changes(template, dim_company)
            updated.to_csv(DIM_COMPANY_PATH, index=False, encoding="utf-8")
            applied = True
            logging.info("dim_company actualizado: %s", DIM_COMPANY_PATH)

    write_report(mode, template, dim_company, changes, errors, warnings, applied, snapshot_path)
    return changes, errors, warnings, applied


def parse_args():
    parser = argparse.ArgumentParser(description="Sincroniza homologacion de companias hacia dim_company.")
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--dry-run", action="store_true", help="Valida y reporta cambios sin modificar dim_company.")
    mode.add_argument("--apply", action="store_true", help="Aplica cambios validos a dim_company.")
    return parser.parse_args()


def main():
    configure_logging()
    args = parse_args()
    mode = "apply" if args.apply else "dry-run"
    logging.info("Iniciando sync company homologation en modo %s", mode)
    changes, errors, warnings, applied = run(mode)
    logging.info("Cambios detectados: %s", len(changes))
    if errors:
        logging.error("Errores: %s", " | ".join(errors))
    if warnings:
        logging.warning("Advertencias: %s", " | ".join(warnings))
    logging.info("Cambios aplicados: %s", applied)
    logging.info("Proceso finalizado")


if __name__ == "__main__":
    main()
