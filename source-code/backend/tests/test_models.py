import pytest
from models import CalculationModel
from unittest.mock import patch, MagicMock
from datetime import datetime

@pytest.fixture
def mock_app():
    app = MagicMock()
    app.config = {
        "POSTGRES_HOST": "localhost",
        "POSTGRES_USER": "test_user",
        "POSTGRES_PASSWORD": "test_password",
        "POSTGRES_DB": "test_db",
        "POSTGRES_PORT": "5432"
    }
    return app

def test_create_valid_operation(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = [1]
        
        result = CalculationModel.create(mock_app, 1, 2, "add", 3)
        assert result["id"] == 1
        assert mock_conn.commit.called
        assert mock_cursor.execute.called
        mock_conn.close.assert_called_once()

def test_create_invalid_operation(mock_app):
    with pytest.raises(ValueError):
        CalculationModel.create(mock_app, 1, 2, "power", 3)

def test_get_history_valid_limit(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.fetchall.return_value = [
            (1, 1, 2, "add", 3, datetime(2023, 1, 1, 0, 0, 0))
        ]
        
        history = CalculationModel.get_history(mock_app, 5)
        assert len(history) == 1
        assert mock_cursor.execute.called
        mock_conn.close.assert_called_once()

def test_get_by_id_found(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = (1, 1, 2, "add", 3, datetime(2023, 1, 1, 0, 0, 0))
        
        calculation = CalculationModel.get_by_id(mock_app, 1)
        assert calculation is not None
        assert calculation["id"] == 1
        mock_conn.close.assert_called_once()

def test_get_by_id_not_found(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.fetchone.return_value = None
        
        calculation = CalculationModel.get_by_id(mock_app, 999)
        assert calculation is None
        mock_conn.close.assert_called_once()

def test_update_success(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.rowcount = 1
        
        updated = CalculationModel.update(mock_app, 1, 5, 3, "add", 8)
        assert updated == {"id": 1, "operand1": 5, "operand2": 3, "operation": "add", "result": 8}
        assert mock_conn.commit.called
        mock_conn.close.assert_called_once()

def test_update_not_found(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.rowcount = 0
        
        updated = CalculationModel.update(mock_app, 999, 5, 3, "add", 8)
        assert updated is None
        mock_conn.commit.called
        mock_conn.close.assert_called_once()

def test_delete_success(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.rowcount = 1
        
        deleted = CalculationModel.delete(mock_app, 1)
        assert deleted is True
        assert mock_conn.commit.called
        mock_conn.close.assert_called_once()

def test_delete_failure(mock_app):
    with patch('models.get_connection') as mock_get_connection:
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_get_connection.return_value = mock_conn
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.rowcount = 0
        
        deleted = CalculationModel.delete(mock_app, 999)
        assert deleted is False
        assert mock_conn.commit.called
        mock_conn.close.assert_called_once()