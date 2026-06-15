import pandas as pd

from backend.etl.transform.common import (
    convert_numeric_columns,
    ensure_period,
    normalize_rut,
    normalize_text_columns,
    snake_case_columns,
)


NUMERIC_COLUMNS = (
    "ano",
    "mes",
    "total_haberes",
    "de_ellos_haberes_imponibles",
    "afc_empresa",
    "mutual",
    "sis",
    "trabajo_pesado",
    "cobertura_suspension",
    "seguro_social",
    "cotizacion_expectativa_de_vida",
    "total_asignacion_familiar",
    "total_costo",
)

TEXT_COLUMNS = (
    "centro_de_negocio",
    "nombre",
    "apellido_paterno",
    "apellido_materno",
    "sociedad",
)

RENAME_COLUMNS = {
    "centro_de_negocio": "centro_negocio",
}


def transform_remuneraciones(df):
    if df.empty:
        return df.copy()

    output = snake_case_columns(df)
    output = output.rename(columns=RENAME_COLUMNS)
    output = ensure_period(output)

    if "rut" in output.columns:
        output["rut"] = output["rut"].map(normalize_rut)

    output = normalize_text_columns(output, [RENAME_COLUMNS.get(column, column) for column in TEXT_COLUMNS])
    output = convert_numeric_columns(output, NUMERIC_COLUMNS)

    if "ano" in output.columns:
        output["ano"] = pd.to_numeric(output["ano"], errors="coerce").astype("Int64")
    if "mes" in output.columns:
        output["mes"] = pd.to_numeric(output["mes"], errors="coerce").astype("Int64")

    return output

