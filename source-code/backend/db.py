import os
import psycopg
from dotenv import load_dotenv

load_dotenv()

def init_db(app):
    """Initialize the PostgreSQL database and table"""
    app.config["POSTGRES_HOST"] = os.getenv("POSTGRES_HOST", "localhost")
    app.config["POSTGRES_USER"] = os.getenv("POSTGRES_USER", "calc_user")
    app.config["POSTGRES_PASSWORD"] = os.getenv("POSTGRES_PASSWORD", "securepassword")
    app.config["POSTGRES_DB"] = os.getenv("POSTGRES_DB", "calc_db")
    app.config["POSTGRES_PORT"] = int(os.getenv("POSTGRES_PORT", 5432))

    try:
        with get_connection(app) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS calculations (
                        id SERIAL PRIMARY KEY,
                        operand1 FLOAT NOT NULL,
                        operand2 FLOAT NOT NULL,
                        operation VARCHAR(10) NOT NULL,
                        result FLOAT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
            conn.commit()
        app.logger.info("Database table initialized successfully")
    except Exception as e:
        app.logger.error(f"Error creating table: {e}")
        raise

def get_connection(app):
    """Return a psycopg connection"""
    dsn = (
        f"postgresql://{app.config['POSTGRES_USER']}:{app.config['POSTGRES_PASSWORD']}"
        f"@{app.config['POSTGRES_HOST']}:{app.config['POSTGRES_PORT']}/{app.config['POSTGRES_DB']}"
    )
    return psycopg.connect(dsn)
