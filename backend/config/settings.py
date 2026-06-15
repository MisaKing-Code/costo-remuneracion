from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = BASE_DIR / "backend"
DATA_DIR = BASE_DIR / "data"

RAW_DIR = DATA_DIR / "raw"
STAGING_DIR = DATA_DIR / "staging"
PROCESSED_DIR = DATA_DIR / "processed"
QUALITY_DIR = DATA_DIR / "quality"
ARCHIVE_DIR = DATA_DIR / "archive"
METADATA_DIR = DATA_DIR / "metadata"
DATA_LOGS_DIR = DATA_DIR / "logs"
BACKEND_LOGS_DIR = BACKEND_DIR / "logs"

VALID_SOCIEDADES = ("LCM", "LTDA", "SPA", "SPA_CC", "SPA_MC")
VALID_DATASETS = ("remuneraciones", "dotacion")

ETL_CONFIG = {
    "remuneraciones": {
        "raw_dir": RAW_DIR / "remuneraciones",
        "header_row": 7,
        "sheet_name": 0,
        "file_pattern": "*.xlsx",
    },
    "dotacion": {
        "raw_dir": RAW_DIR / "dotacion",
        "header_row": 8,
        "sheet_name": "Dotación",
        "file_pattern": "*.xlsx",
    },
}

REMUNERACIONES_COLUMNS = (
    "CENTRO DE NEGOCIO",
    "AÑO",
    "MES",
    "RUT",
    "NOMBRE",
    "APELLIDO PATERNO",
    "APELLIDO MATERNO",
    "TOTAL HABERES",
    "DE ELLOS HABERES IMPONIBLES",
    "AFC EMPRESA",
    "MUTUAL",
    "SIS",
    "TRABAJO PESADO",
    "COBERTURA SUSPENSION",
    "SEGURO SOCIAL",
    "COTIZACION EXPECTATIVA DE VIDA",
    "TOTAL ASIGNACION FAMILIAR",
    "TOTAL COSTO",
)

DOTACION_COLUMNS = (
    "Rut",
    "Nombre",
    "Apellido Paterno",
    "Apellido Materno",
    "Centro de Negocio",
    "Cargo",
    "Tipo Contratacion",
    "Tipo Trabajador",
    "Fecha Inicio Contrato",
)

