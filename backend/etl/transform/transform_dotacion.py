import pandas as pd

from backend.etl.transform.common import (
    ensure_period,
    normalize_rut,
    normalize_text_columns,
    snake_case_columns,
)


TEXT_COLUMNS = (
    "nombre",
    "apellido_paterno",
    "apellido_materno",
    "centro_negocio",
    "cargo",
    "tipo_contratacion",
    "tipo_trabajador",
    "sociedad",
)

RENAME_COLUMNS = {
    "centro_de_negocio": "centro_negocio",
}


def transform_dotacion(df):
    if df.empty:
        return df.copy()

    output = snake_case_columns(df)
    output = output.rename(columns=RENAME_COLUMNS)
    output = ensure_period(output)

    if "rut" in output.columns:
        footer_mask = output["rut"].astype("string").str.strip().str.upper().isin(["TOTAL", "TOTALES"])
        output = output.loc[~footer_mask].copy()
        output["rut"] = output["rut"].map(normalize_rut)

    output = normalize_text_columns(output, TEXT_COLUMNS)

    if "fecha_inicio_contrato" in output.columns:
        output["fecha_inicio_contrato"] = pd.to_datetime(
            output["fecha_inicio_contrato"],
            errors="coerce",
            dayfirst=True,
        ).dt.date

    if "source_year" in output.columns:
        output["source_year"] = pd.to_numeric(output["source_year"], errors="coerce").astype("Int64")
    if "source_month" in output.columns:
        output["source_month"] = pd.to_numeric(output["source_month"], errors="coerce").astype("Int64")

    return output
