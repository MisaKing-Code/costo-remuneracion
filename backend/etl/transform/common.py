import re

import pandas as pd


ACCENT_MAP = str.maketrans(
    {
        "Á": "A",
        "É": "E",
        "Í": "I",
        "Ó": "O",
        "Ú": "U",
        "Ü": "U",
        "Ñ": "N",
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ü": "u",
        "ñ": "n",
    }
)


def to_snake_case(value):
    text = str(value).strip().translate(ACCENT_MAP).lower()
    text = re.sub(r"[^a-z0-9]+", "_", text)
    return re.sub(r"_+", "_", text).strip("_")


def snake_case_columns(df):
    output = df.copy()
    output.columns = [to_snake_case(column) for column in output.columns]
    return output


def normalize_text(value):
    if pd.isna(value):
        return pd.NA
    text = str(value).strip()
    text = re.sub(r"\s+", " ", text)
    if not text:
        return pd.NA
    return text.upper()


def normalize_rut(value):
    if pd.isna(value):
        return pd.NA
    text = str(value).strip().upper()
    text = re.sub(r"[^0-9K]", "", text)
    if len(text) < 2:
        return pd.NA
    return f"{text[:-1]}-{text[-1]}"


def ensure_period(df):
    output = df.copy()
    if "periodo" not in output.columns:
        output["periodo"] = pd.NA

    derived = pd.Series(pd.NA, index=output.index, dtype="object")
    if "ano" in output.columns and "mes" in output.columns:
        year = pd.to_numeric(output["ano"], errors="coerce")
        month = pd.to_numeric(output["mes"], errors="coerce")
        valid = year.notna() & month.notna()
        derived.loc[valid] = [
            f"{int(year_value):04d}-{int(month_value):02d}"
            for year_value, month_value in zip(year.loc[valid], month.loc[valid])
        ]

    output["periodo"] = output["periodo"].fillna(derived)
    return output


def convert_numeric_columns(df, columns):
    output = df.copy()
    for column in columns:
        if column in output.columns:
            output[column] = pd.to_numeric(output[column], errors="coerce").fillna(0)
    return output


def normalize_text_columns(df, columns):
    output = df.copy()
    for column in columns:
        if column in output.columns:
            output[column] = output[column].map(normalize_text)
    return output

