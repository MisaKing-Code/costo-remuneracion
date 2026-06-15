import logging
import re

import pandas as pd

from backend.config.settings import DOTACION_COLUMNS, ETL_CONFIG, VALID_SOCIEDADES


LOGGER = logging.getLogger(__name__)


def _derive_sociedad(file_name):
    stem = file_name.upper()
    for sociedad in sorted(VALID_SOCIEDADES, key=len, reverse=True):
        if stem.startswith(f"{sociedad}_"):
            return sociedad
    return None


def _derive_period_from_path(path):
    parts = path.parts
    year = None
    month = None

    for index, part in enumerate(parts):
        if re.fullmatch(r"\d{4}", part) and index + 1 < len(parts):
            next_part = parts[index + 1]
            if re.fullmatch(r"\d{1,2}", next_part):
                year = int(part)
                month = int(next_part)

    if year is None or month is None:
        match = re.search(r"_(\d{2})(\d{4})$", path.stem)
        if match:
            month = int(match.group(1))
            year = int(match.group(2))

    if year is None or month is None:
        return None, None, None

    return year, month, f"{year:04d}-{month:02d}"


def _read_file(path):
    config = ETL_CONFIG["dotacion"]
    sociedad = _derive_sociedad(path.name)
    year, month, periodo = _derive_period_from_path(path)

    if sociedad is None:
        LOGGER.warning("Sociedad no reconocida en archivo: %s", path)

    df = pd.read_excel(
        path,
        sheet_name=config["sheet_name"],
        header=config["header_row"],
        engine="openpyxl",
    )
    df = df.replace(r"^\s*$", pd.NA, regex=True).dropna(how="all")
    df = df.loc[:, [column for column in df.columns if not str(column).startswith("Unnamed")]]
    df["sociedad"] = sociedad
    df["periodo"] = periodo
    df["source_year"] = year
    df["source_month"] = month
    df["source_file"] = str(path)
    return df


def extract_dotacion():
    config = ETL_CONFIG["dotacion"]
    raw_dir = config["raw_dir"]
    frames = []

    for path in sorted(raw_dir.rglob(config["file_pattern"])):
        if path.name.startswith("~$"):
            continue
        LOGGER.info("Extrayendo dotacion: %s", path)
        frame = _read_file(path)
        missing = [column for column in DOTACION_COLUMNS if column not in frame.columns]
        if missing:
            LOGGER.warning("Columnas faltantes en %s: %s", path.name, missing)
        frames.append(frame)

    if not frames:
        LOGGER.warning("No se encontraron archivos de dotacion en %s", raw_dir)
        return pd.DataFrame()

    return pd.concat(frames, ignore_index=True)
