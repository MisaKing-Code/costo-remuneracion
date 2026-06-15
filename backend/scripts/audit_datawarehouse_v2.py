import json
import logging
from datetime import datetime
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
DW_ROOT = BASE_DIR / "data" / "datawarehouse" / "v2"
QUALITY_DIR = BASE_DIR / "data" / "quality"
LOG_DIR = BASE_DIR / "backend" / "logs"

REPORT_PATH = QUALITY_DIR / "datawarehouse_v2_audit_report.txt"
LOG_PATH = LOG_DIR / "datawarehouse_v2_audit.log"

DIMENSION_FILES = {
    "dim_periodo": "dimensions/dim_periodo.csv",
    "dim_trabajador": "dimensions/dim_trabajador.csv",
    "dim_sociedad": "dimensions/dim_sociedad.csv",
    "dim_centro_negocio": "dimensions/dim_centro_negocio.csv",
    "dim_cargo": "dimensions/dim_cargo.csv",
    "dim_contrato": "dimensions/dim_contrato.csv",
    "dim_estado_laboral": "dimensions/dim_estado_laboral.csv",
}

FACT_FILES = {
    "fact_remuneraciones_mensual": "facts/fact_remuneraciones_mensual.csv",
    "fact_dotacion_mensual": "facts/fact_dotacion_mensual.csv",
}

METADATA_FILES = {
    "dw_v2_schema": "metadata/dw_v2_schema.json",
    "data_lineage": "metadata/data_lineage.csv",
}

EXPECTED_DATASETS = {
    **DIMENSION_FILES,
    **FACT_FILES,
    **METADATA_FILES,
}

DIMENSION_KEYS = {
    "periodo_id": "dim_periodo",
    "trabajador_id": "dim_trabajador",
    "sociedad_id": "dim_sociedad",
    "centro_negocio_id": "dim_centro_negocio",
    "cargo_id": "dim_cargo",
    "contrato_id": "dim_contrato",
    "estado_laboral_id": "dim_estado_laboral",
}

FACT_REFERENCES = {
    "fact_remuneraciones_mensual": ["periodo_id", "trabajador_id", "sociedad_id", "centro_negocio_id"],
    "fact_dotacion_mensual": [
        "periodo_id",
        "trabajador_id",
        "sociedad_id",
        "centro_negocio_id",
        "cargo_id",
        "contrato_id",
        "estado_laboral_id",
    ],
}

REQUIRED_FIELDS = {
    "fact_remuneraciones_mensual": ["total_haberes", "total_costo"],
    "fact_dotacion_mensual": ["headcount", "antiguedad_meses"],
}

GRAIN_COLUMNS = {
    "fact_remuneraciones_mensual": ["trabajador_id", "periodo_id", "sociedad_id", "centro_negocio_id"],
    "fact_dotacion_mensual": ["trabajador_id", "periodo_id", "sociedad_id", "centro_negocio_id"],
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


def read_csv_dataset(dataset_name, relative_path, lines, errors):
    path = DW_ROOT / relative_path
    if not path.exists():
        message = f"FALTA: {relative_path}"
        lines.append(message)
        errors.append(message)
        logging.error(message)
        return None

    try:
        df = pd.read_csv(path, encoding="utf-8-sig")
        lines.append(f"OK: {relative_path} ({len(df)} filas)")
        logging.info("Archivo cargado: %s", path)
        return df
    except Exception as exc:
        message = f"ERROR leyendo {relative_path}: {exc}"
        lines.append(message)
        errors.append(message)
        logging.exception(message)
        return None


def read_json_metadata(relative_path, lines, errors):
    path = DW_ROOT / relative_path
    if not path.exists():
        message = f"FALTA: {relative_path}"
        lines.append(message)
        errors.append(message)
        logging.error(message)
        return None

    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
        lines.append(f"OK: {relative_path}")
        logging.info("Metadata JSON cargada: %s", path)
        return payload
    except Exception as exc:
        message = f"ERROR leyendo {relative_path}: {exc}"
        lines.append(message)
        errors.append(message)
        logging.exception(message)
        return None


def load_datasets(lines, errors):
    datasets = {}
    metadata = {}

    add_section(lines, "Existencia de archivos")
    for dataset_name, relative_path in DIMENSION_FILES.items():
        datasets[dataset_name] = read_csv_dataset(dataset_name, relative_path, lines, errors)
    for dataset_name, relative_path in FACT_FILES.items():
        datasets[dataset_name] = read_csv_dataset(dataset_name, relative_path, lines, errors)

    metadata["dw_v2_schema"] = read_json_metadata(METADATA_FILES["dw_v2_schema"], lines, errors)
    metadata["data_lineage"] = read_csv_dataset("data_lineage", METADATA_FILES["data_lineage"], lines, errors)

    return datasets, metadata


def append_structure(lines, datasets):
    add_section(lines, "Estructura de datasets")
    for dataset_name in [*DIMENSION_FILES.keys(), *FACT_FILES.keys()]:
        df = datasets.get(dataset_name)
        lines.append("")
        lines.append(f"{dataset_name}:")
        if df is None:
            lines.append("Dataset no disponible.")
            continue
        lines.append(f"Filas: {len(df)}")
        lines.append(f"Columnas: {len(df.columns)}")
        lines.append("Campos: " + ", ".join(df.columns))


def validate_referential_integrity(lines, datasets, errors, observations):
    add_section(lines, "Integridad referencial")

    for fact_name, key_columns in FACT_REFERENCES.items():
        fact = datasets.get(fact_name)
        if fact is None:
            observations.append(f"No se evaluo integridad referencial de {fact_name} por dataset faltante.")
            lines.append(f"{fact_name}: no evaluado.")
            continue

        lines.append("")
        lines.append(f"{fact_name}:")
        for key_column in key_columns:
            dimension_name = DIMENSION_KEYS[key_column]
            dimension = datasets.get(dimension_name)
            if key_column not in fact.columns:
                message = f"{fact_name}.{key_column}: columna no disponible"
                lines.append(message)
                errors.append(message)
                continue
            if dimension is None or key_column not in dimension.columns:
                message = f"{fact_name}.{key_column}: dimension {dimension_name} no disponible"
                lines.append(message)
                errors.append(message)
                continue

            fact_values = fact[key_column].dropna().astype(str)
            dimension_values = set(dimension[key_column].dropna().astype(str))
            orphan_mask = ~fact_values.isin(dimension_values)
            orphan_count = int(orphan_mask.sum())
            lines.append(f"{key_column}: {orphan_count} registros huerfanos")
            if orphan_count:
                examples = fact_values[orphan_mask].drop_duplicates().head(10).tolist()
                lines.append(f"Ejemplos: {', '.join(examples)}")
                errors.append(f"{fact_name}.{key_column}: {orphan_count} registros huerfanos")


def validate_required_nulls(lines, datasets, errors):
    add_section(lines, "Validacion de nulos obligatorios")

    for dataset_name, fields in REQUIRED_FIELDS.items():
        df = datasets.get(dataset_name)
        lines.append("")
        lines.append(f"{dataset_name}:")
        if df is None:
            lines.append("No evaluado.")
            continue

        for field in fields:
            if field not in df.columns:
                message = f"{dataset_name}.{field}: columna no disponible"
                lines.append(message)
                errors.append(message)
                continue
            nulls = int(df[field].isna().sum())
            lines.append(f"{field}: {nulls} nulos")
            if nulls:
                errors.append(f"{dataset_name}.{field}: {nulls} nulos")


def validate_grain(lines, datasets, errors):
    add_section(lines, "Validacion de grano")

    for dataset_name, columns in GRAIN_COLUMNS.items():
        df = datasets.get(dataset_name)
        if df is None:
            lines.append(f"{dataset_name}: no evaluado.")
            continue

        missing_columns = [column for column in columns if column not in df.columns]
        if missing_columns:
            message = f"{dataset_name}: columnas de grano faltantes: {', '.join(missing_columns)}"
            lines.append(message)
            errors.append(message)
            continue

        duplicated_mask = df.duplicated(subset=columns, keep=False)
        duplicate_rows = int(duplicated_mask.sum())
        duplicate_keys = int(df.loc[duplicated_mask, columns].drop_duplicates().shape[0])
        lines.append(f"{dataset_name}: {duplicate_rows} filas duplicadas, {duplicate_keys} claves duplicadas")
        if duplicate_rows:
            errors.append(f"{dataset_name}: {duplicate_rows} filas duplicadas por grano")


def validate_business_rules(lines, datasets, errors, observations):
    add_section(lines, "Validaciones de negocio")

    fact_remuneraciones = datasets.get("fact_remuneraciones_mensual")
    if fact_remuneraciones is not None:
        validate_non_negative_metric(lines, errors, fact_remuneraciones, "fact_remuneraciones_mensual", "total_costo")
        validate_non_negative_metric(lines, errors, fact_remuneraciones, "fact_remuneraciones_mensual", "total_haberes")
    else:
        observations.append("No se evaluaron metricas de remuneraciones por dataset faltante.")

    fact_dotacion = datasets.get("fact_dotacion_mensual")
    if fact_dotacion is not None:
        validate_headcount(lines, errors, fact_dotacion)
        validate_non_negative_metric(lines, errors, fact_dotacion, "fact_dotacion_mensual", "antiguedad_meses")
    else:
        observations.append("No se evaluaron metricas de dotacion por dataset faltante.")


def validate_non_negative_metric(lines, errors, df, dataset_name, field):
    if field not in df.columns:
        message = f"{dataset_name}.{field}: columna no disponible"
        lines.append(message)
        errors.append(message)
        return

    values = pd.to_numeric(df[field], errors="coerce")
    nulls = int(values.isna().sum())
    negatives = int((values < 0).sum())
    min_value = values.min()
    max_value = values.max()
    lines.append(f"{dataset_name}.{field}: nulos={nulls}, negativos={negatives}, min={min_value}, max={max_value}")
    if nulls or negatives:
        errors.append(f"{dataset_name}.{field}: nulos={nulls}, negativos={negatives}")


def validate_headcount(lines, errors, df):
    if "headcount" not in df.columns:
        message = "fact_dotacion_mensual.headcount: columna no disponible"
        lines.append(message)
        errors.append(message)
        return

    values = pd.to_numeric(df["headcount"], errors="coerce")
    invalid = int((values != 1).sum())
    nulls = int(values.isna().sum())
    min_value = values.min()
    max_value = values.max()
    lines.append(f"fact_dotacion_mensual.headcount: invalidos={invalid}, nulos={nulls}, min={min_value}, max={max_value}")
    if invalid or nulls:
        errors.append(f"fact_dotacion_mensual.headcount: invalidos={invalid}, nulos={nulls}")


def validate_metadata(lines, metadata, errors):
    add_section(lines, "Metadata")

    schema = metadata.get("dw_v2_schema")
    if schema is None:
        lines.append("dw_v2_schema.json: no disponible")
    else:
        datasets = schema.get("datasets", {})
        expected = [*DIMENSION_FILES.keys(), *FACT_FILES.keys()]
        missing = sorted(set(expected) - set(datasets.keys()))
        lines.append(f"dw_v2_schema.json: datasets descritos={len(datasets)}, faltantes={len(missing)}")
        if missing:
            lines.append("Faltantes: " + ", ".join(missing))
            errors.append(f"dw_v2_schema.json: datasets faltantes {', '.join(missing)}")

    lineage = metadata.get("data_lineage")
    if lineage is None:
        lines.append("data_lineage.csv: no disponible")
        return

    lines.append(f"data_lineage.csv: registros={len(lineage)}")
    if len(lineage) == 0:
        errors.append("data_lineage.csv: sin registros")

    required_columns = {"dataset", "source_layer", "source_files", "output_path", "generated_at"}
    missing_columns = sorted(required_columns - set(lineage.columns))
    if missing_columns:
        lines.append("data_lineage.csv columnas faltantes: " + ", ".join(missing_columns))
        errors.append("data_lineage.csv: columnas faltantes " + ", ".join(missing_columns))
        return

    expected_datasets = [*DIMENSION_FILES.keys(), *FACT_FILES.keys()]
    missing_datasets = sorted(set(expected_datasets) - set(lineage["dataset"].astype(str)))
    empty_sources = int(lineage["source_files"].isna().sum() + (lineage["source_files"].astype(str).str.strip() == "").sum())
    empty_outputs = int(lineage["output_path"].isna().sum() + (lineage["output_path"].astype(str).str.strip() == "").sum())

    lines.append(f"data_lineage.csv datasets faltantes={len(missing_datasets)}")
    lines.append(f"data_lineage.csv origenes vacios={empty_sources}")
    lines.append(f"data_lineage.csv destinos vacios={empty_outputs}")
    if missing_datasets:
        errors.append("data_lineage.csv: datasets faltantes " + ", ".join(missing_datasets))
    if empty_sources or empty_outputs:
        errors.append(f"data_lineage.csv: origenes vacios={empty_sources}, destinos vacios={empty_outputs}")


def determine_status(errors, observations):
    if errors:
        return "RECHAZADO"
    if observations:
        return "APROBADO CON OBSERVACIONES"
    return "APROBADO"


def append_summary(lines, errors, observations):
    add_section(lines, "Resumen ejecutivo")
    status = determine_status(errors, observations)
    lines.append(f"Estado auditoria: {status}")
    lines.append(f"Hallazgos criticos: {len(errors)}")
    lines.append(f"Hallazgos menores: {len(observations)}")

    if errors:
        lines.append("")
        lines.append("Hallazgos criticos:")
        for error in errors:
            lines.append(f"- {error}")

    if observations:
        lines.append("")
        lines.append("Hallazgos menores:")
        for observation in observations:
            lines.append(f"- {observation}")

    return status


def build_report():
    lines = [
        "AUDITORIA DATA WAREHOUSE V2 - COSTO REMUNERACIONES CORPORATIVO",
        f"Fecha ejecucion: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        f"Ruta auditada: {DW_ROOT}",
    ]
    errors = []
    observations = []

    datasets, metadata = load_datasets(lines, errors)
    append_structure(lines, datasets)
    validate_referential_integrity(lines, datasets, errors, observations)
    validate_required_nulls(lines, datasets, errors)
    validate_grain(lines, datasets, errors)
    validate_business_rules(lines, datasets, errors, observations)
    validate_metadata(lines, metadata, errors)
    status = append_summary(lines, errors, observations)

    return "\n".join(lines), status, errors, observations


def save_report(report):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(report, encoding="utf-8")
    logging.info("Reporte DW V2 generado: %s", REPORT_PATH)


def main():
    configure_logging()
    logging.info("Inicio auditoria Data Warehouse V2")

    report, status, errors, observations = build_report()
    save_report(report)

    print(report)
    print("")
    print("Resumen consola:")
    print(f"- Estado: {status}")
    print(f"- Hallazgos criticos: {len(errors)}")
    print(f"- Hallazgos menores: {len(observations)}")
    print(f"- Reporte: {REPORT_PATH}")
    print(f"- Log: {LOG_PATH}")

    logging.info(
        "Auditoria Data Warehouse V2 finalizada. Estado=%s, criticos=%s, menores=%s",
        status,
        len(errors),
        len(observations),
    )


if __name__ == "__main__":
    main()
