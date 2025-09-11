import os
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

load_dotenv()

def init_db(app):
    app.config["POSTGRES_HOST"] = os.getenv("POSTGRES_HOST", "localhost")
    app.config["POSTGRES_USER"] = os.getenv("POSTGRES_USER", "calc_user")
    app.config["POSTGRES_PASSWORD"] = os.getenv("POSTGRES_PASSWORD", "securepassword")
    app.config["POSTGRES_DB"] = os.getenv("POSTGRES_DB", "calc_db")
    app.config["POSTGRES_PORT"] = os.getenv("POSTGRES_PORT", "5432")

    # Create table if it doesn't exist
    try:
        conn = get_connection(app)
        cur = conn.cursor()
        cur.execute(
            """
            CREATE TABLE IF NOT EXISTS calculations (
                id SERIAL PRIMARY KEY,
                operand1 FLOAT NOT NULL,
                operand2 FLOAT NOT NULL,
                operation VARCHAR(10) NOT NULL,
                result FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()
        cur.close()
        conn.close()
        app.logger.info("Database table initialized successfully")
    except Exception as e:
        app.logger.error(f"Error creating table: {str(e)}")
        raise e

def get_connection(app):
    return psycopg2.connect(
        host=app.config["POSTGRES_HOST"],
        user=app.config["POSTGRES_USER"],
        password=app.config["POSTGRES_PASSWORD"],
        database=app.config["POSTGRES_DB"],
        port=app.config["POSTGRES_PORT"]
    )