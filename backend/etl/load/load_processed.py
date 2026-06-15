import logging

import pandas as pd

from backend.config.settings import PROCESSED_DIR, VALID_SOCIEDADES


LOGGER = logging.getLogger(__name__)


def _write_csv(df, file_name):
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
    path = PROCESSED_DIR / file_name
    df.to_csv(path, index=False, encoding="utf-8-sig")
    LOGGER.info("Dataset generado: %s (%s filas)", path, len(df))


def _select_existing(df, columns):
    return df[[column for column in columns if column in df.columns]].copy()


def _build_dim_trabajador(remuneraciones, dotacion):
    columns = ("rut", "nombre", "apellido_paterno", "apellido_materno")
    frames = []
    for frame in (dotacion, remuneraciones):
        selected = _select_existing(frame, columns)
        if not selected.empty:
            frames.append(selected)
    if not frames:
        return pd.DataFrame(columns=columns)
    return pd.concat(frames, ignore_index=True).dropna(subset=["rut"]).drop_duplicates(subset=["rut"])


def _build_dim_sociedad(remuneraciones, dotacion):
    sociedades = set(VALID_SOCIEDADES)
    for frame in (remuneraciones, dotacion):
        if "sociedad" in frame.columns:
            sociedades.update(frame["sociedad"].dropna().astype(str).unique())
    return pd.DataFrame({"sociedad": sorted(sociedades)})


def _build_dim_centro_negocio(remuneraciones, dotacion):
    frames = []
    for frame in (remuneraciones, dotacion):
        if "centro_negocio" in frame.columns:
            frames.append(frame[["centro_negocio"]])
    if not frames:
        return pd.DataFrame(columns=["centro_negocio"])
    return pd.concat(frames, ignore_index=True).dropna().drop_duplicates().sort_values("centro_negocio")


def _build_dim_contrato(dotacion):
    columns = ("tipo_contratacion", "tipo_trabajador", "cargo")
    selected = _select_existing(dotacion, columns)
    if selected.empty:
        return pd.DataFrame(columns=columns)
    return selected.drop_duplicates().sort_values([column for column in columns if column in selected.columns])


def _build_dim_periodo(remuneraciones, dotacion):
    periods = []
    for frame in (remuneraciones, dotacion):
        if "periodo" in frame.columns:
            periods.extend(frame["periodo"].dropna().astype(str).unique().tolist())
    dim = pd.DataFrame({"periodo": sorted(set(periods))})
    if dim.empty:
        dim["ano"] = pd.Series(dtype="Int64")
        dim["mes"] = pd.Series(dtype="Int64")
        return dim
    split = dim["periodo"].str.split("-", expand=True)
    dim["ano"] = pd.to_numeric(split[0], errors="coerce").astype("Int64")
    dim["mes"] = pd.to_numeric(split[1], errors="coerce").astype("Int64")
    return dim


def load_processed(remuneraciones, dotacion):
    fact_remuneraciones = remuneraciones.copy()
    fact_dotacion = dotacion.copy()

    _write_csv(fact_remuneraciones, "fact_remuneraciones.csv")
    _write_csv(fact_dotacion, "fact_dotacion.csv")
    _write_csv(_build_dim_trabajador(fact_remuneraciones, fact_dotacion), "dim_trabajador.csv")
    _write_csv(_build_dim_sociedad(fact_remuneraciones, fact_dotacion), "dim_sociedad.csv")
    _write_csv(_build_dim_centro_negocio(fact_remuneraciones, fact_dotacion), "dim_centro_negocio.csv")
    _write_csv(_build_dim_contrato(fact_dotacion), "dim_contrato.csv")
    _write_csv(_build_dim_periodo(fact_remuneraciones, fact_dotacion), "dim_periodo.csv")

