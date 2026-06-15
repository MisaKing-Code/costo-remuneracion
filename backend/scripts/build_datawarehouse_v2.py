import hashlib
import json
import logging
import re
from datetime import datetime
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
PROCESSED_DIR = BASE_DIR / "data" / "processed"
DW_ROOT = BASE_DIR / "data" / "datawarehouse" / "v2"
FACTS_DIR = DW_ROOT / "facts"
DIMENSIONS_DIR = DW_ROOT / "dimensions"
METADATA_DIR = DW_ROOT / "metadata"
LOG_DIR = BASE_DIR / "backend" / "logs"
LOG_PATH = LOG_DIR / "build_datawarehouse_v2.log"

INPUT_FILES = {
    "fact_remuneraciones": "fact_remuneraciones.csv",
    "fact_dotacion": "fact_dotacion.csv",
    "dim_periodo": "dim_periodo.csv",
    "dim_trabajador": "dim_trabajador.csv",
    "dim_sociedad": "dim_sociedad.csv",
    "dim_centro_negocio": "dim_centro_negocio.csv",
    "dim_contrato": "dim_contrato.csv",
}

MONTH_NAMES = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre",
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


def read_csv(name):
    path = PROCESSED_DIR / INPUT_FILES[name]
    if not path.exists():
        raise FileNotFoundError(f"No existe archivo requerido: {path}")
    df = pd.read_csv(path, encoding="utf-8-sig")
    logging.info("Leido %s: %s filas", path, len(df))
    return df


def normalize_text(value):
    if pd.isna(value):
        return ""
    return re.sub(r"\s+", " ", str(value).strip().upper())


def slug(value):
    text = normalize_text(value)
    text = (
        text.replace("Á", "A")
        .replace("É", "E")
        .replace("Í", "I")
        .replace("Ó", "O")
        .replace("Ú", "U")
        .replace("Ü", "U")
        .replace("Ñ", "N")
    )
    text = re.sub(r"[^A-Z0-9]+", "_", text).strip("_")
    return text or "SIN_DATO"


def short_hash(*values):
    raw = "|".join(normalize_text(value) for value in values)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:10].upper()


def key(prefix, *values):
    return f"{prefix}_{slug(values[0])}_{short_hash(*values)}"


def trabajador_id(rut):
    return f"TRAB_{slug(rut)}"


def sociedad_id(sociedad):
    return f"SOC_{slug(sociedad)}"


def periodo_id(periodo):
    return f"PER_{slug(str(periodo).replace('-', ''))}"


def centro_negocio_id(value):
    return key("CEN", value)


def cargo_id(value):
    return key("CAR", value)


def contrato_id(value):
    return key("CON", value)


def estado_laboral_id(value):
    return key("EST", value)


def make_dirs():
    FACTS_DIR.mkdir(parents=True, exist_ok=True)
    DIMENSIONS_DIR.mkdir(parents=True, exist_ok=True)
    METADATA_DIR.mkdir(parents=True, exist_ok=True)


def build_dim_periodo(source):
    dim = source[["periodo", "ano", "mes"]].drop_duplicates().copy()
    dim["periodo_id"] = dim["periodo"].map(periodo_id)
    dim["ano"] = pd.to_numeric(dim["ano"], errors="coerce").astype("Int64")
    dim["mes"] = pd.to_numeric(dim["mes"], errors="coerce").astype("Int64")
    dim["nombre_mes"] = dim["mes"].map(MONTH_NAMES)
    dim["trimestre"] = ((dim["mes"] - 1) // 3 + 1).astype("Int64")
    dim["semestre"] = ((dim["mes"] - 1) // 6 + 1).astype("Int64")
    return dim[["periodo_id", "periodo", "ano", "mes", "nombre_mes", "trimestre", "semestre"]].sort_values("periodo")


def build_dim_trabajador(dim_trabajador, fact_dotacion, fact_remuneraciones):
    columns = ["rut", "nombre", "apellido_paterno", "apellido_materno"]
    frames = [
        dim_trabajador[columns],
        fact_dotacion[columns],
        fact_remuneraciones[columns],
    ]
    dim = pd.concat(frames, ignore_index=True).dropna(subset=["rut"]).drop_duplicates(subset=["rut"]).copy()
    dim["trabajador_id"] = dim["rut"].map(trabajador_id)
    return dim[["trabajador_id", *columns]].sort_values("rut")


def build_dim_sociedad(source):
    dim = source[["sociedad"]].dropna().drop_duplicates().copy()
    dim["sociedad_id"] = dim["sociedad"].map(sociedad_id)
    return dim[["sociedad_id", "sociedad"]].sort_values("sociedad")


def build_dim_centro_negocio(source):
    dim = source[["centro_negocio"]].dropna().drop_duplicates().copy()
    dim["centro_negocio_id"] = dim["centro_negocio"].map(centro_negocio_id)
    return dim[["centro_negocio_id", "centro_negocio"]].sort_values("centro_negocio")


def build_dim_cargo(fact_dotacion, dim_contrato_source):
    frames = []
    if "cargo" in fact_dotacion.columns:
        frames.append(fact_dotacion[["cargo"]])
    if "cargo" in dim_contrato_source.columns:
        frames.append(dim_contrato_source[["cargo"]])
    dim = pd.concat(frames, ignore_index=True).dropna().drop_duplicates().copy()
    dim["cargo_id"] = dim["cargo"].map(cargo_id)
    return dim[["cargo_id", "cargo"]].sort_values("cargo")


def build_dim_contrato(fact_dotacion, dim_contrato_source):
    frames = []
    if "tipo_contratacion" in fact_dotacion.columns:
        frames.append(fact_dotacion[["tipo_contratacion"]])
    if "tipo_contratacion" in dim_contrato_source.columns:
        frames.append(dim_contrato_source[["tipo_contratacion"]])
    dim = pd.concat(frames, ignore_index=True).dropna().drop_duplicates().copy()
    dim["contrato_id"] = dim["tipo_contratacion"].map(contrato_id)
    return dim[["contrato_id", "tipo_contratacion"]].sort_values("tipo_contratacion")


def build_dim_estado_laboral(fact_dotacion, dim_contrato_source):
    frames = []
    if "tipo_trabajador" in fact_dotacion.columns:
        frames.append(fact_dotacion[["tipo_trabajador"]])
    if "tipo_trabajador" in dim_contrato_source.columns:
        frames.append(dim_contrato_source[["tipo_trabajador"]])
    dim = pd.concat(frames, ignore_index=True).dropna().drop_duplicates().copy()
    dim["estado_laboral_id"] = dim["tipo_trabajador"].map(estado_laboral_id)
    return dim[["estado_laboral_id", "tipo_trabajador"]].sort_values("tipo_trabajador")


def calculate_antiguedad_meses(df):
    start = pd.to_datetime(df["fecha_inicio_contrato"], errors="coerce")
    period = pd.to_datetime(df["periodo"].astype(str) + "-01", errors="coerce")
    months = (period.dt.year - start.dt.year) * 12 + (period.dt.month - start.dt.month)
    return months.clip(lower=0).astype("Int64")


def build_fact_remuneraciones(source):
    fact = source.copy()
    fact["fact_remuneracion_id"] = (
        "FRM_"
        + fact["periodo"].astype(str).map(slug)
        + "_"
        + fact["rut"].astype(str).map(slug)
        + "_"
        + fact["sociedad"].astype(str).map(slug)
    )
    fact["periodo_id"] = fact["periodo"].map(periodo_id)
    fact["trabajador_id"] = fact["rut"].map(trabajador_id)
    fact["sociedad_id"] = fact["sociedad"].map(sociedad_id)
    fact["centro_negocio_id"] = fact["centro_negocio"].map(centro_negocio_id)
    fact = fact.rename(columns={"de_ellos_haberes_imponibles": "haberes_imponibles"})

    columns = [
        "fact_remuneracion_id",
        "periodo_id",
        "trabajador_id",
        "sociedad_id",
        "centro_negocio_id",
        "periodo",
        "rut",
        "sociedad",
        "ano",
        "mes",
        "total_haberes",
        "haberes_imponibles",
        "afc_empresa",
        "mutual",
        "sis",
        "trabajo_pesado",
        "cobertura_suspension",
        "seguro_social",
        "cotizacion_expectativa_de_vida",
        "total_asignacion_familiar",
        "total_costo",
        "source_file",
    ]
    return fact[columns].sort_values(["periodo", "sociedad", "rut"])


def build_fact_dotacion(source):
    fact = source.copy()
    fact["fact_dotacion_id"] = (
        "FDT_"
        + fact["periodo"].astype(str).map(slug)
        + "_"
        + fact["rut"].astype(str).map(slug)
        + "_"
        + fact["sociedad"].astype(str).map(slug)
    )
    fact["periodo_id"] = fact["periodo"].map(periodo_id)
    fact["trabajador_id"] = fact["rut"].map(trabajador_id)
    fact["sociedad_id"] = fact["sociedad"].map(sociedad_id)
    fact["centro_negocio_id"] = fact["centro_negocio"].map(centro_negocio_id)
    fact["cargo_id"] = fact["cargo"].map(cargo_id)
    fact["contrato_id"] = fact["tipo_contratacion"].map(contrato_id)
    fact["estado_laboral_id"] = fact["tipo_trabajador"].map(estado_laboral_id)
    fact["antiguedad_meses"] = calculate_antiguedad_meses(fact)
    fact["headcount"] = 1

    columns = [
        "fact_dotacion_id",
        "periodo_id",
        "trabajador_id",
        "sociedad_id",
        "centro_negocio_id",
        "cargo_id",
        "contrato_id",
        "estado_laboral_id",
        "periodo",
        "rut",
        "sociedad",
        "fecha_inicio_contrato",
        "antiguedad_meses",
        "headcount",
        "source_file",
    ]
    return fact[columns].sort_values(["periodo", "sociedad", "rut"])


def validate_unique(df, id_column, dataset_name):
    if df[id_column].isna().any():
        raise ValueError(f"{dataset_name}: {id_column} contiene nulos")
    duplicated = df[id_column].duplicated().sum()
    if duplicated:
        raise ValueError(f"{dataset_name}: {id_column} tiene {duplicated} duplicados")


def validate_fact_keys(df, key_columns, dataset_name):
    null_counts = df[key_columns].isna().sum()
    failed = null_counts[null_counts > 0]
    if not failed.empty:
        raise ValueError(f"{dataset_name}: claves nulas detectadas {failed.to_dict()}")


def write_csv(df, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(path, index=False, encoding="utf-8-sig")
    logging.info("Generado %s: %s filas", path, len(df))


def build_schema(datasets):
    return {
        "schema_version": "2.0",
        "generated_at": datetime.now().replace(microsecond=0).isoformat(),
        "source_layer": "data/processed",
        "output_layer": "data/datawarehouse/v2",
        "datasets": {
            name: {
                "rows": int(len(df)),
                "columns": list(df.columns),
            }
            for name, df in datasets.items()
        },
        "technical_rules": {
            "stable_keys": "Deterministic IDs derived from natural keys and normalized text hashes.",
            "fact_dotacion_mensual.headcount": 1,
            "antiguedad_meses": "Calculated from fecha_inicio_contrato to first day of periodo.",
        },
    }


def build_lineage(output_paths):
    rows = []
    for output_name, output_path in output_paths.items():
        if output_name.startswith("fact_"):
            source_files = "fact_remuneraciones.csv" if "remuneraciones" in output_name else "fact_dotacion.csv"
        elif output_name == "dim_periodo":
            source_files = "dim_periodo.csv"
        elif output_name == "dim_trabajador":
            source_files = "dim_trabajador.csv;fact_dotacion.csv;fact_remuneraciones.csv"
        elif output_name == "dim_sociedad":
            source_files = "dim_sociedad.csv"
        elif output_name == "dim_centro_negocio":
            source_files = "dim_centro_negocio.csv"
        elif output_name in ("dim_cargo", "dim_contrato", "dim_estado_laboral"):
            source_files = "fact_dotacion.csv;dim_contrato.csv"
        else:
            source_files = ""

        rows.append(
            {
                "dataset": output_name,
                "source_layer": "data/processed",
                "source_files": source_files,
                "output_path": str(output_path.relative_to(BASE_DIR)),
                "generated_at": datetime.now().replace(microsecond=0).isoformat(),
            }
        )
    return pd.DataFrame(rows)


def main():
    configure_logging()
    logging.info("Inicio build Data Warehouse V2")
    make_dirs()

    fact_remuneraciones_v1 = read_csv("fact_remuneraciones")
    fact_dotacion_v1 = read_csv("fact_dotacion")
    dim_periodo_v1 = read_csv("dim_periodo")
    dim_trabajador_v1 = read_csv("dim_trabajador")
    dim_sociedad_v1 = read_csv("dim_sociedad")
    dim_centro_negocio_v1 = read_csv("dim_centro_negocio")
    dim_contrato_v1 = read_csv("dim_contrato")

    datasets = {
        "dim_periodo": build_dim_periodo(dim_periodo_v1),
        "dim_trabajador": build_dim_trabajador(dim_trabajador_v1, fact_dotacion_v1, fact_remuneraciones_v1),
        "dim_sociedad": build_dim_sociedad(dim_sociedad_v1),
        "dim_centro_negocio": build_dim_centro_negocio(dim_centro_negocio_v1),
        "dim_cargo": build_dim_cargo(fact_dotacion_v1, dim_contrato_v1),
        "dim_contrato": build_dim_contrato(fact_dotacion_v1, dim_contrato_v1),
        "dim_estado_laboral": build_dim_estado_laboral(fact_dotacion_v1, dim_contrato_v1),
        "fact_remuneraciones_mensual": build_fact_remuneraciones(fact_remuneraciones_v1),
        "fact_dotacion_mensual": build_fact_dotacion(fact_dotacion_v1),
    }

    dimension_ids = {
        "dim_periodo": "periodo_id",
        "dim_trabajador": "trabajador_id",
        "dim_sociedad": "sociedad_id",
        "dim_centro_negocio": "centro_negocio_id",
        "dim_cargo": "cargo_id",
        "dim_contrato": "contrato_id",
        "dim_estado_laboral": "estado_laboral_id",
    }
    for dataset_name, id_column in dimension_ids.items():
        validate_unique(datasets[dataset_name], id_column, dataset_name)

    validate_fact_keys(
        datasets["fact_remuneraciones_mensual"],
        ["fact_remuneracion_id", "periodo_id", "trabajador_id", "sociedad_id", "centro_negocio_id"],
        "fact_remuneraciones_mensual",
    )
    validate_fact_keys(
        datasets["fact_dotacion_mensual"],
        [
            "fact_dotacion_id",
            "periodo_id",
            "trabajador_id",
            "sociedad_id",
            "centro_negocio_id",
            "cargo_id",
            "contrato_id",
            "estado_laboral_id",
        ],
        "fact_dotacion_mensual",
    )

    output_paths = {
        "dim_periodo": DIMENSIONS_DIR / "dim_periodo.csv",
        "dim_trabajador": DIMENSIONS_DIR / "dim_trabajador.csv",
        "dim_sociedad": DIMENSIONS_DIR / "dim_sociedad.csv",
        "dim_centro_negocio": DIMENSIONS_DIR / "dim_centro_negocio.csv",
        "dim_cargo": DIMENSIONS_DIR / "dim_cargo.csv",
        "dim_contrato": DIMENSIONS_DIR / "dim_contrato.csv",
        "dim_estado_laboral": DIMENSIONS_DIR / "dim_estado_laboral.csv",
        "fact_remuneraciones_mensual": FACTS_DIR / "fact_remuneraciones_mensual.csv",
        "fact_dotacion_mensual": FACTS_DIR / "fact_dotacion_mensual.csv",
    }

    for dataset_name, path in output_paths.items():
        write_csv(datasets[dataset_name], path)

    schema = build_schema(datasets)
    schema_path = METADATA_DIR / "dw_v2_schema.json"
    schema_path.write_text(json.dumps(schema, ensure_ascii=False, indent=2), encoding="utf-8")
    logging.info("Generado %s", schema_path)

    lineage = build_lineage(output_paths)
    lineage_path = METADATA_DIR / "data_lineage.csv"
    write_csv(lineage, lineage_path)

    print("Data Warehouse V2 generado correctamente.")
    for dataset_name, df in datasets.items():
        print(f"{dataset_name}: {len(df)} filas")
    print(f"schema: {schema_path}")
    print(f"lineage: {lineage_path}")
    print(f"log: {LOG_PATH}")
    logging.info("Build Data Warehouse V2 finalizado correctamente")


if __name__ == "__main__":
    main()
