from functools import lru_cache
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Fraud Shield API"
    VERSION: str = "0.1.0"

    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "sachin10@mysql"
    MYSQL_HOST: str = "localhost"
    MYSQL_PORT: int = 3306
    MYSQL_DB: str = "FraudShield DB"

    @property
    def DATABASE_URL(self) -> str:
        return (
            f"mysql+pymysql://{self.MYSQL_USER}:{self.MYSQL_PASSWORD}"
            f"@{self.MYSQL_HOST}:{self.MYSQL_PORT}/{self.MYSQL_DB}"
        )

    BASE_DIR: str = os.path.dirname(os.path.dirname(__file__))
    ML_DIR: str = os.path.join(BASE_DIR, "ml")

    MODEL_PATH: str = os.path.join(ML_DIR, "model_if.pkl")
    SCALER_PATH: str = os.path.join(ML_DIR, "scaler.pkl")
    TYPE_ENCODER_PATH: str = os.path.join(ML_DIR, "type_encoder.pkl")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings():
    return Settings()
