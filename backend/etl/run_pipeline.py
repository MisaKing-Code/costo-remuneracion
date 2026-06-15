import logging

from backend.config.settings import BACKEND_LOGS_DIR, DATA_LOGS_DIR
from backend.etl.extract.extract_dotacion import extract_dotacion
from backend.etl.extract.extract_remuneraciones import extract_remuneraciones
from backend.etl.load.load_processed import load_processed
from backend.etl.transform.transform_dotacion import transform_dotacion
from backend.etl.transform.transform_remuneraciones import transform_remuneraciones
from backend.etl.validate.validate_dotacion import validate_dotacion
from backend.etl.validate.validate_remuneraciones import validate_remuneraciones


def configure_logging():
    BACKEND_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    DATA_LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = BACKEND_LOGS_DIR / "etl_pipeline.log"
    data_log_file = DATA_LOGS_DIR / "etl_pipeline.log"

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[
            logging.FileHandler(log_file, encoding="utf-8"),
            logging.FileHandler(data_log_file, encoding="utf-8"),
            logging.StreamHandler(),
        ],
    )


def run_pipeline():
    configure_logging()
    logger = logging.getLogger(__name__)
    logger.info("Inicio pipeline ETL corporativo")

    try:
        raw_remuneraciones = extract_remuneraciones()
        raw_dotacion = extract_dotacion()

        transformed_remuneraciones = transform_remuneraciones(raw_remuneraciones)
        transformed_dotacion = transform_dotacion(raw_dotacion)

        valid_remuneraciones, remuneraciones_report = validate_remuneraciones(transformed_remuneraciones)
        valid_dotacion, dotacion_report = validate_dotacion(transformed_dotacion)

        load_processed(valid_remuneraciones, valid_dotacion)

        logger.info("Reporte remuneraciones: %s", remuneraciones_report)
        logger.info("Reporte dotacion: %s", dotacion_report)
        logger.info("Pipeline ETL finalizado correctamente")
        return {
            "remuneraciones": remuneraciones_report,
            "dotacion": dotacion_report,
        }
    except Exception:
        logger.exception("Error ejecutando pipeline ETL")
        raise


if __name__ == "__main__":
    run_pipeline()

