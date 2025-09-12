import os
import pytest
from app import app
from unittest.mock import patch, MagicMock

@pytest.fixture(autouse=True)
def clear_db_env():
    # ensure tests don't pick up a real DATABASE_URL from the environment
    orig = os.environ.pop("DATABASE_URL", None)
    yield
    if orig is not None:
        os.environ["DATABASE_URL"] = orig

def test_health_endpoint():
    client = app.test_client()
    r = client.get("/healthz")
    assert r.status_code == 200
    assert r.json["status"] in ("alive",)

def test_ready_no_db_config():
    # Mock the get_connection function to raise an exception
    with patch('app.get_connection') as mock_get_connection:
        mock_get_connection.side_effect = Exception("Database connection failed")
        
        client = app.test_client()
        r = client.get("/ready")
        
        assert r.status_code == 503
        assert "not ready" in r.json.get("status", "").lower()

def test_ready_with_db_config():
    # Mock a successful database connection
    with patch('app.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_get_connection.return_value = mock_conn
        
        client = app.test_client()
        r = client.get("/ready")
        
        # Verify the connection was closed
        mock_conn.close.assert_called_once()
        
        # This should pass with a successful mock connection
        assert r.status_code == 200
        assert r.json.get("status") == "ready"