import logging

import pandas as pd

from backend.config.settings import QUALITY_DIR


LOGGER = logging.getLogger(__name__)
REQUIRED_COLUMNS = ("rut", "sociedad", "periodo", "centro_negocio")


def _blank_mask(series):
    return series.isna() | (series.astype("string").str.strip() == "")


def validate_dotacion(df):
    QUALITY_DIR.mkdir(parents=True, exist_ok=True)
    if df.empty:
        return df.copy(), {"dataset": "dotacion", "rows": 0, "invalid_rows": 0}

    output = df.copy()
    issues = pd.DataFrame(index=output.index)

    for column in REQUIRED_COLUMNS:
        if column not in output.columns:
            output[column] = pd.NA
        issues[f"{column}_obligatorio"] = _blank_mask(output[column])

    issues["duplicado_periodo_rut_sociedad"] = output.duplicated(
        subset=["periodo", "rut", "sociedad"],
        keep=False,
    )

    invalid_mask = issues.any(axis=1)
    invalid = output.loc[invalid_mask].copy()
    if invalid.empty:
        invalid["validation_errors"] = pd.Series(dtype="string")
    else:
        invalid["validation_errors"] = issues.loc[invalid_mask].apply(
            lambda row: "|".join(row.index[row].tolist()),
            axis=1,
        )

    invalid.to_csv(QUALITY_DIR / "dotacion_invalid_rows.csv", index=False, encoding="utf-8-sig")

    summary = pd.DataFrame(
        [
            {"rule": column, "failed_rows": int(issues[column].sum())}
            for column in issues.columns
        ]
    )
    summary.to_csv(QUALITY_DIR / "dotacion_validation_summary.csv", index=False, encoding="utf-8-sig")

    LOGGER.info("Validacion dotacion: %s filas invalidas de %s", int(invalid_mask.sum()), len(output))
    return output.loc[~invalid_mask].copy(), {
        "dataset": "dotacion",
        "rows": int(len(output)),
        "valid_rows": int((~invalid_mask).sum()),
        "invalid_rows": int(invalid_mask.sum()),
    }
