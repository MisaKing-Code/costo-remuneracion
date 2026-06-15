import logging
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
PROCESSED_DIR = BASE_DIR / "data" / "processed"
QUALITY_DIR = BASE_DIR / "data" / "quality"
LOG_DIR = BASE_DIR / "backend" / "logs"

REPORT_PATH = QUALITY_DIR / "datawarehouse_audit_report.txt"
LOG_PATH = LOG_DIR / "datawarehouse_audit.log"

VALID_SOCIEDADES = {"LCM", "LTDA", "SPA", "SPA_CC", "SPA_MC"}

EXPECTED_FILES = {
    "fact_remuneraciones": "fact_remuneraciones.csv",
    "fact_dotacion": "fact_dotacion.csv",
    "dim_trabajador": "dim_trabajador.csv",
    "dim_sociedad": "dim_sociedad.csv",
    "dim_centro_negocio": "dim_centro_negocio.csv",
    "dim_contrato": "dim_contrato.csv",
    "dim_periodo": "dim_periodo.csv",
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


def add_section(lines, title):
    lines.append("")
    lines.append(f"=== {title} ===")


def format_number(value):
    if pd.isna(value):
        return "0"
    if isinstance(value, (float, np.floating)):
        return f"{value:,.2f}"
    return f"{int(value):,}"


def read_datasets(lines, errors):
    datasets = {}
    add_section(lines, "Verificacion de archivos")

    for dataset_name, file_name in EXPECTED_FILES.items():
        path = PROCESSED_DIR / file_name
        if not path.exists():
            message = f"FALTA: {file_name}"
            lines.append(message)
            errors.append(message)
            logging.error(message)
            continue

        try:
            datasets[dataset_name] = pd.read_csv(path, encoding="utf-8-sig")
            lines.append(f"OK: {file_name}")
            logging.info("Archivo cargado: %s", path)
        except Exception as exc:
            message = f"ERROR leyendo {file_name}: {exc}"
            lines.append(message)
            errors.append(message)
            logging.exception(message)

    return datasets


def append_dataset_structure(lines, datasets):
    add_section(lines, "Estructura de datasets")

    for dataset_name in EXPECTED_FILES:
        df = datasets.get(dataset_name)
        add_section(lines, dataset_name)

        if df is None:
            lines.append("Dataset no disponible.")
            continue

        lines.append(f"Filas: {len(df)}")
        lines.append(f"Columnas: {len(df.columns)}")
        lines.append("")
        lines.append("Columnas:")
        for column in df.columns:
            lines.append(f"- {column}")

        lines.append("")
        lines.append("Nulos:")
        null_counts = df.isna().sum()
        for column, null_count in null_counts.items():
            lines.append(f"{column}: {int(null_count)}")


def append_remuneraciones_metrics(lines, datasets):
    add_section(lines, "Metricas de negocio - Remuneraciones")
    df = datasets.get("fact_remuneraciones")

    if df is None:
        lines.append("fact_remuneraciones no disponible.")
        return

    total_costo = pd.to_numeric(df.get("total_costo", pd.Series(dtype="float64")), errors="coerce").sum()
    total_haberes = pd.to_numeric(df.get("total_haberes", pd.Series(dtype="float64")), errors="coerce").sum()
    unique_workers = df["rut"].dropna().nunique() if "rut" in df.columns else 0
    average_worker_cost = total_costo / unique_workers if unique_workers else 0

    lines.append(f"Total costo empresa: {format_number(total_costo)}")
    lines.append(f"Total haberes: {format_number(total_haberes)}")
    lines.append(f"Promedio costo trabajador: {format_number(average_worker_cost)}")
    lines.append(f"Trabajadores unicos: {format_number(unique_workers)}")

    lines.append("")
    lines.append("Registros por periodo:")
    append_counts(lines, df, "periodo")

    lines.append("")
    lines.append("Registros por sociedad:")
    append_counts(lines, df, "sociedad")


def append_dotacion_metrics(lines, datasets):
    add_section(lines, "Metricas de negocio - Dotacion")
    df = datasets.get("fact_dotacion")

    if df is None:
        lines.append("fact_dotacion no disponible.")
        return

    unique_workers = df["rut"].dropna().nunique() if "rut" in df.columns else 0
    lines.append(f"Trabajadores unicos: {format_number(unique_workers)}")

    lines.append("")
    lines.append("Registros por periodo:")
    append_counts(lines, df, "periodo")

    lines.append("")
    lines.append("Registros por sociedad:")
    append_counts(lines, df, "sociedad")


def append_counts(lines, df, column):
    if column not in df.columns:
        lines.append(f"{column}: columna no disponible")
        return

    counts = df[column].fillna("SIN_DATO").value_counts().sort_index()
    for value, count in counts.items():
        lines.append(f"{value}: {int(count)}")


def append_cross_checks(lines, datasets, observations):
    add_section(lines, "Cruce entre datasets")
    remuneraciones = datasets.get("fact_remuneraciones")
    dotacion = datasets.get("fact_dotacion")

    if remuneraciones is None or dotacion is None:
        lines.append("Cruce no disponible: falta fact_remuneraciones o fact_dotacion.")
        observations.append("No fue posible ejecutar el cruce de trabajadores por datasets faltantes.")
        return

    rem_workers = set(remuneraciones.get("rut", pd.Series(dtype="object")).dropna().astype(str))
    dot_workers = set(dotacion.get("rut", pd.Series(dtype="object")).dropna().astype(str))

    only_rem = sorted(rem_workers - dot_workers)
    only_dot = sorted(dot_workers - rem_workers)

    lines.append(f"Trabajadores en remuneraciones pero no en dotacion: {len(only_rem)}")
    append_examples(lines, only_rem)

    lines.append("")
    lines.append(f"Trabajadores en dotacion pero sin remuneraciones: {len(only_dot)}")
    append_examples(lines, only_dot)

    if only_rem:
        observations.append("Existen trabajadores con remuneraciones sin registro equivalente en dotacion.")
    if only_dot:
        observations.append("Existen trabajadores en dotacion sin registro equivalente en remuneraciones.")


def append_examples(lines, values, limit=10):
    if not values:
        lines.append("Ejemplos: sin diferencias.")
        return

    examples = values[:limit]
    lines.append(f"Ejemplos: {', '.join(examples)}")


def append_corporate_validations(lines, datasets, errors, observations):
    add_section(lines, "Validaciones corporativas")

    validate_total_costo(lines, datasets, errors)
    validate_required_column(lines, datasets, "rut", errors)
    validate_sociedades(lines, datasets, errors)
    validate_periodos(lines, datasets, errors)

    if not errors:
        observations.append("No se detectaron errores corporativos criticos.")


def validate_total_costo(lines, datasets, errors):
    df = datasets.get("fact_remuneraciones")
    if df is None:
        lines.append("total_costo >= 0: no evaluado, falta fact_remuneraciones.")
        return

    if "total_costo" not in df.columns:
        message = "total_costo >= 0: ERROR, columna no disponible."
        lines.append(message)
        errors.append(message)
        return

    total_costo = pd.to_numeric(df["total_costo"], errors="coerce")
    invalid = int((total_costo < 0).sum())
    message = f"total_costo >= 0: {invalid} registros invalidos"
    lines.append(message)
    if invalid:
        errors.append(message)


def validate_required_column(lines, datasets, column, errors):
    for dataset_name in ("fact_remuneraciones", "fact_dotacion", "dim_trabajador"):
        df = datasets.get(dataset_name)
        if df is None:
            continue
        if column not in df.columns:
            message = f"{dataset_name}.{column} no nulo: ERROR, columna no disponible."
            lines.append(message)
            errors.append(message)
            continue
        invalid = int((df[column].isna() | (df[column].astype("string").str.strip() == "")).sum())
        message = f"{dataset_name}.{column} no nulo: {invalid} registros invalidos"
        lines.append(message)
        if invalid:
            errors.append(message)


def validate_sociedades(lines, datasets, errors):
    for dataset_name, df in datasets.items():
        if "sociedad" not in df.columns:
            continue

        values = df["sociedad"].dropna().astype(str).str.strip()
        invalid_values = sorted(set(values) - VALID_SOCIEDADES)
        nulls = int((df["sociedad"].isna() | (df["sociedad"].astype("string").str.strip() == "")).sum())

        message = f"{dataset_name}.sociedad valida: {len(invalid_values)} valores invalidos, {nulls} nulos"
        lines.append(message)
        if invalid_values:
            lines.append(f"Valores invalidos: {', '.join(invalid_values[:10])}")
        if invalid_values or nulls:
            errors.append(message)


def validate_periodos(lines, datasets, errors):
    for dataset_name, df in datasets.items():
        if "periodo" not in df.columns:
            continue

        values = df["periodo"].astype("string").str.strip()
        parsed = pd.to_datetime(values + "-01", errors="coerce")
        nulls = int((df["periodo"].isna() | (values == "")).sum())
        invalid = int(parsed.isna().sum())

        message = f"{dataset_name}.periodo valido: {invalid} registros invalidos, {nulls} nulos"
        lines.append(message)
        if invalid or nulls:
            errors.append(message)


def append_executive_summary(lines, datasets, errors, observations):
    add_section(lines, "Resumen ejecutivo")

    available = len(datasets)
    expected = len(EXPECTED_FILES)
    status = "APROBADO" if not errors and available == expected else "CON OBSERVACIONES"

    lines.append(f"Estado auditoria: {status}")
    lines.append(f"Datasets disponibles: {available} de {expected}")
    lines.append(f"Errores detectados: {len(errors)}")
    lines.append(f"Observaciones: {len(observations)}")

    if observations:
        lines.append("")
        lines.append("Observaciones:")
        for observation in observations:
            lines.append(f"- {observation}")

    if errors:
        lines.append("")
        lines.append("Errores:")
        for error in errors:
            lines.append(f"- {error}")


def build_report():
    lines = []
    errors = []
    observations = []

    lines.append("AUDITORIA DATA WAREHOUSE - COSTO REMUNERACIONES CORPORATIVO")
    lines.append(f"Fecha ejecucion: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    datasets = read_datasets(lines, errors)
    append_dataset_structure(lines, datasets)
    append_remuneraciones_metrics(lines, datasets)
    append_dotacion_metrics(lines, datasets)
    append_cross_checks(lines, datasets, observations)
    append_corporate_validations(lines, datasets, errors, observations)
    append_executive_summary(lines, datasets, errors, observations)

    return "\n".join(lines), errors, observations, datasets


def save_report(report):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(report, encoding="utf-8")
    logging.info("Reporte de auditoria generado: %s", REPORT_PATH)


def main():
    configure_logging()
    logging.info("Inicio auditoria Data Warehouse")

    report, errors, observations, datasets = build_report()
    save_report(report)

    print(report)
    print("")
    print("Resumen ejecutivo:")
    print(f"- Datasets disponibles: {len(datasets)} de {len(EXPECTED_FILES)}")
    print(f"- Errores detectados: {len(errors)}")
    print(f"- Observaciones: {len(observations)}")
    print(f"- Reporte: {REPORT_PATH}")

    logging.info("Auditoria finalizada con %s errores y %s observaciones", len(errors), len(observations))


if __name__ == "__main__":
    main()

