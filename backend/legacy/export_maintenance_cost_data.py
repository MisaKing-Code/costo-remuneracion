from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "data"
EXPECTED_EXCEL_FILE = "Base_Maestra_Mantención.xlsx"
EXPECTED_EXCEL_PATH = DATA_DIR / EXPECTED_EXCEL_FILE
EXPECTED_SHEET_NAME = "Costo_Mantención"
OUTPUT_PATH = ROOT / "frontend" / "src" / "data" / "maintenanceCostData.json"
QUALITY_REPORT_PATH = DATA_DIR / "data_quality_report.json"
QUALITY_HISTORY_PATH = DATA_DIR / "data_quality_history.json"
QUALITY_HISTORY_MAX_ENTRIES = 500

QUALITY_STATUS_EXCELLENT = "EXCELLENT"
QUALITY_STATUS_ACCEPTABLE = "ACCEPTABLE"
QUALITY_STATUS_REJECTED = "REJECTED"

MONEY_COLUMNS = [
    "Total_Haberes",
    "Haberes_Imponibles",
    "AFC_Empresa",
    "Mutual",
    "SIS",
    "Seguro_Social",
    "Expectativa_de_Vida",
    "Asignación_Familiar",
    "Total_Costo",
]

TEXT_COLUMNS = [
    "RUT_Sociedad",
    "Nombre_Sociedad",
    "RUT_Trabajador",
    "Nombre_Trabajador",
    "Centro_de_Negocio",
    "Cargo",
    "Tipo_Trabajador",
    "Contrato_Trabajador",
]

REQUIRED_COLUMNS = [
    "RUT_Sociedad",
    "Nombre_Sociedad",
    "RUT_Trabajador",
    "Nombre_Trabajador",
    "Centro_de_Negocio",
    "Cargo",
    "Tipo_Trabajador",
    "Contrato_Trabajador",
    "Total_Haberes",
    "Haberes_Imponibles",
    "AFC_Empresa",
    "Mutual",
    "SIS",
    "Seguro_Social",
    "Expectativa_de_Vida",
    "Asignación_Familiar",
    "Total_Costo",
]

CRITICAL_FIELDS = [
    "RUT_Trabajador",
    "Nombre_Trabajador",
    "Nombre_Sociedad",
    "Cargo",
    "Total_Costo",
]


class QualityCollector:
    def __init__(self) -> None:
        self.critical_errors: list[str] = []
        self.warnings: list[str] = []
        self.informational: list[str] = []

    def add_critical_error(self, message: str) -> None:
        self.critical_errors.append(message)

    def add_warning(self, message: str) -> None:
        self.warnings.append(message)

    def add_information(self, message: str) -> None:
        self.informational.append(message)

    def messages(self) -> list[str]:
        return [
            *[f"CRITICAL: {message}" for message in self.critical_errors],
            *[f"WARNING: {message}" for message in self.warnings],
            *[f"INFO: {message}" for message in self.informational],
        ]


def determine_quality_status(collector: QualityCollector) -> str:
    if collector.critical_errors:
        return QUALITY_STATUS_REJECTED

    if collector.warnings:
        return QUALITY_STATUS_ACCEPTABLE

    return QUALITY_STATUS_EXCELLENT


def build_quality_report(
    collector: QualityCollector,
    source_file: str,
    source_sheet: str,
    record_count: int,
    generated_at: str,
) -> dict:
    return {
        "status": determine_quality_status(collector),
        "criticalErrors": len(collector.critical_errors),
        "warnings": len(collector.warnings),
        "informational": len(collector.informational),
        "sourceFile": source_file,
        "sourceSheet": source_sheet,
        "recordCount": record_count,
        "generatedAt": generated_at,
        "messages": collector.messages(),
    }


def build_quality_history_entry(report: dict) -> dict:
    return {
        "generatedAt": report["generatedAt"],
        "status": report["status"],
        "criticalErrors": report["criticalErrors"],
        "warnings": report["warnings"],
        "informational": report["informational"],
        "recordCount": report["recordCount"],
    }


def load_quality_history() -> list[dict]:
    if not QUALITY_HISTORY_PATH.exists():
        return []

    try:
        history = json.loads(QUALITY_HISTORY_PATH.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        print(
            "ADVERTENCIA: data_quality_history.json inválido. "
            "Se reiniciará el historial de calidad."
        )
        return []

    if not isinstance(history, list):
        print(
            "ADVERTENCIA: data_quality_history.json no contiene una lista. "
            "Se reiniciará el historial de calidad."
        )
        return []

    return history


def append_quality_history(report: dict) -> None:
    try:
        history = load_quality_history()
        history.append(build_quality_history_entry(report))
        history = history[-QUALITY_HISTORY_MAX_ENTRIES:]

        QUALITY_HISTORY_PATH.parent.mkdir(parents=True, exist_ok=True)
        QUALITY_HISTORY_PATH.write_text(
            json.dumps(history, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
    except Exception as error:
        print(
            "ADVERTENCIA: no se pudo actualizar data_quality_history.json. "
            f"La exportación continuará. Detalle: {error}"
        )


def write_quality_report(
    collector: QualityCollector,
    source_file: str = EXPECTED_EXCEL_FILE,
    source_sheet: str = EXPECTED_SHEET_NAME,
    record_count: int = 0,
    generated_at: str | None = None,
) -> dict:
    generated_at = generated_at or datetime.now().replace(microsecond=0).isoformat()
    report = build_quality_report(
        collector=collector,
        source_file=source_file,
        source_sheet=source_sheet,
        record_count=record_count,
        generated_at=generated_at,
    )
    QUALITY_REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    QUALITY_REPORT_PATH.write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return report


def write_quality_outputs(
    collector: QualityCollector,
    source_file: str = EXPECTED_EXCEL_FILE,
    source_sheet: str = EXPECTED_SHEET_NAME,
    record_count: int = 0,
    generated_at: str | None = None,
) -> dict:
    report = write_quality_report(
        collector=collector,
        source_file=source_file,
        source_sheet=source_sheet,
        record_count=record_count,
        generated_at=generated_at,
    )
    append_quality_history(report)
    return report


def short_company(name: str) -> str:
    value = re.sub(r"Empresa de Transportes ", "", name, flags=re.I)
    value = re.sub(r"Sociedad de transportes ", "", value, flags=re.I)
    value = re.sub(r"LTDA|SPA", "", value, flags=re.I).strip(" -")
    return value or name


def resolve_excel_path(collector: QualityCollector | None = None) -> Path:
    excel_files = sorted(DATA_DIR.glob("*.xlsx"), key=lambda path: path.name.lower())
    found_files = ", ".join(path.name for path in excel_files) or "ninguno"

    if len(excel_files) > 1:
        raise ValueError(
            "Se encontraron múltiples archivos .xlsx en data/. "
            f"Archivos encontrados: {found_files}. "
            f"Archivo esperado: {EXPECTED_EXCEL_FILE}. "
            "Deja solo la fuente oficial en la carpeta o revisa la operación antes de exportar."
        )

    if not EXPECTED_EXCEL_PATH.exists():
        raise FileNotFoundError(
            f"No se encontró el archivo Excel oficial obligatorio en: {EXPECTED_EXCEL_PATH}. "
            f"Archivos encontrados: {found_files}. "
            f"Archivo esperado: {EXPECTED_EXCEL_FILE}. "
            "No se debe procesar otro Excel automáticamente."
        )

    if excel_files and excel_files[0].name != EXPECTED_EXCEL_FILE:
        raise ValueError(
            "El archivo .xlsx presente en data/ no corresponde a la fuente oficial. "
            f"Archivos encontrados: {found_files}. "
            f"Archivo esperado: {EXPECTED_EXCEL_FILE}. "
            "Deja solo la fuente oficial en la carpeta o revisa la operación antes de exportar."
        )

    return EXPECTED_EXCEL_PATH


def validate_unique_columns(columns: list[str], collector: QualityCollector | None = None) -> None:
    column_counts = pd.Series(columns).value_counts()
    duplicated_columns = column_counts[column_counts > 1]

    if not duplicated_columns.empty:
        duplicated_summary = ", ".join(
            f"{column} ({count})" for column, count in duplicated_columns.items()
        )
        raise ValueError(
            "VR-003 Columnas duplicadas detectadas. "
            f"Columnas duplicadas: {duplicated_summary}. "
            "Proceso cancelado para evitar sobrescritura o lectura ambigua de datos."
        )


def validate_required_columns(columns: list[str], collector: QualityCollector | None = None) -> None:
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in columns]
    if missing_columns:
        raise ValueError(
            "El Excel no contiene todas las columnas obligatorias. "
            f"Columnas faltantes: {', '.join(missing_columns)}. "
            f"Columnas disponibles: {', '.join(columns)}. "
            "Proceso cancelado para evitar datos inconsistentes."
        )


def format_problem_examples(df: pd.DataFrame) -> str:
    example_fields = ["RUT_Trabajador", "Nombre_Trabajador", "Nombre_Sociedad", "Cargo", "Total_Costo"]
    examples = df.head(5)[example_fields].to_dict(orient="records")
    return json.dumps(examples, ensure_ascii=False)


def format_warning_examples(df: pd.DataFrame, fields: list[str]) -> str:
    available_fields = [field for field in fields if field in df.columns]
    examples = df.head(5)[available_fields].to_dict(orient="records")
    return json.dumps(examples, ensure_ascii=False)


def collect_quality_warnings(df: pd.DataFrame) -> list[str]:
    warnings = []

    for column in MONEY_COLUMNS:
        if column not in df.columns:
            continue

        negative_mask = df[column] < 0
        if negative_mask.any():
            affected_rows = df[negative_mask]
            warnings.append(
                f"VR-018 Valores negativos detectados en {column}. "
                f"Filas afectadas: {len(affected_rows)}. "
                f"Ejemplos: {format_warning_examples(affected_rows, ['RUT_Trabajador', 'Nombre_Trabajador', column])}"
            )

    rut_values = df["RUT_Trabajador"].fillna("").astype(str).str.strip()
    valid_rut_mask = ~rut_values.isin(["", "Sin dato"])
    duplicate_mask = valid_rut_mask & rut_values.duplicated(keep=False)
    if duplicate_mask.any():
        affected_rows = df[duplicate_mask]
        duplicate_count = int(rut_values[duplicate_mask].nunique())
        warnings.append(
            "VR-020 Registros duplicados detectados por RUT_Trabajador. "
            f"Trabajadores duplicados: {duplicate_count}. "
            f"Filas afectadas: {len(affected_rows)}. "
            f"Ejemplos: {format_warning_examples(affected_rows, ['RUT_Trabajador', 'Nombre_Trabajador', 'Nombre_Sociedad', 'Cargo', 'Total_Costo'])}"
        )

    return warnings


def print_quality_warnings(warnings: list[str]) -> None:
    for warning in warnings:
        print(f"ADVERTENCIA: {warning}")


def validate_critical_data(df: pd.DataFrame, collector: QualityCollector | None = None) -> None:
    errors = []

    for field in CRITICAL_FIELDS:
        empty_mask = df[field].isna() | df[field].astype(str).str.strip().isin(["", "Sin dato"])
        if empty_mask.any():
            affected_rows = df[empty_mask]
            errors.append(
                f"Campo crítico vacío: {field}. "
                f"Filas afectadas: {len(affected_rows)}. "
                f"Ejemplos: {format_problem_examples(affected_rows)}"
            )

    invalid_total_mask = df["Total_Costo"] <= 0
    if invalid_total_mask.any():
        affected_rows = df[invalid_total_mask]
        errors.append(
            "Total_Costo inválido: debe ser mayor a 0. "
            f"Filas afectadas: {len(affected_rows)}. "
            f"Ejemplos: {format_problem_examples(affected_rows)}"
        )

    if errors:
        if collector:
            for error in errors:
                collector.add_critical_error(error)
        raise ValueError(
            "Se detectaron errores en datos críticos. "
            + " ".join(errors)
            + " Exportación cancelada para evitar generar datos inconsistentes."
        )


def load_maintenance_sheet(collector: QualityCollector | None = None) -> tuple[pd.DataFrame, str, str]:
    excel_path = resolve_excel_path(collector)
    workbook = pd.ExcelFile(excel_path)
    if EXPECTED_SHEET_NAME not in workbook.sheet_names:
        found_sheets = ", ".join(workbook.sheet_names) or "ninguna"
        raise ValueError(
            "No se encontró la hoja oficial requerida. "
            f"Hoja esperada: {EXPECTED_SHEET_NAME}. "
            f"Hojas encontradas: {found_sheets}. "
            "Proceso cancelado para evitar exportar datos incorrectos."
        )

    sheet_name = EXPECTED_SHEET_NAME
    raw = pd.read_excel(excel_path, sheet_name=sheet_name, header=None)
    raw = raw.dropna(how="all").dropna(axis=1, how="all")

    header_matches = raw.apply(
        lambda row: row.astype(str).str.strip().eq("RUT_Sociedad").any(),
        axis=1,
    )
    if not header_matches.any():
        raise ValueError("No se pudo detectar la fila de encabezados.")

    header_index = header_matches.idxmax()
    columns = [str(column).strip().replace(" ", "_") for column in raw.loc[header_index]]
    validate_unique_columns(columns, collector)
    validate_required_columns(columns, collector)

    df = raw.loc[header_index + 1 :].copy()
    df.columns = columns
    df = df.dropna(how="all")
    df = df[df["RUT_Trabajador"].astype(str).str.strip().str.lower() != "total"]

    for column in MONEY_COLUMNS:
        if column in df.columns:
            df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0).round(0).astype(int)

    quality_warnings = collect_quality_warnings(df)
    if collector:
        for warning in quality_warnings:
            collector.add_warning(warning)
    print_quality_warnings(quality_warnings)
    validate_critical_data(df, collector)

    df = df[df["Nombre_Trabajador"].notna()]

    for column in TEXT_COLUMNS:
        if column in df.columns:
            df[column] = df[column].fillna("Sin dato").astype(str).str.strip()

    df["Empresa_Corta"] = df["Nombre_Sociedad"].apply(short_company)
    return df.reset_index(drop=True), sheet_name, excel_path.name


def main() -> None:
    collector = QualityCollector()
    generated_at = datetime.now().replace(microsecond=0).isoformat()

    try:
        df, sheet_name, source_file = load_maintenance_sheet(collector)
    except Exception as error:
        if not collector.critical_errors:
            collector.add_critical_error(str(error))
        write_quality_outputs(collector, generated_at=generated_at)
        print(f"Reporte de calidad generado: {QUALITY_REPORT_PATH}")
        raise

    record_count = int(len(df))
    write_quality_outputs(
        collector,
        source_file=source_file,
        source_sheet=sheet_name,
        record_count=record_count,
        generated_at=generated_at,
    )
    payload = {
        "metadata": {
            "sourceFile": EXPECTED_EXCEL_FILE,
            "sheet": sheet_name,
            "period": "Período vigente",
            "workerCount": int(df["RUT_Trabajador"].nunique()),
            "companyCount": int(df["Nombre_Sociedad"].nunique()),
            "totalCost": int(df["Total_Costo"].sum()),
            "columns": list(df.columns),
            "generatedAt": generated_at,
            "schemaVersion": "1.0",
            "sourceSheet": EXPECTED_SHEET_NAME,
            "recordCount": record_count,
        },
        "records": df.to_dict(orient="records"),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Reporte de calidad generado: {QUALITY_REPORT_PATH}")
    print(f"Datos exportados: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
