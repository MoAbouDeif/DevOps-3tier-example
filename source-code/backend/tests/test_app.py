import pytest
import sys
import os

# Add the parent directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock database before importing app
from unittest.mock import patch, MagicMock

# Mock the database connection
with patch('db.init_db'), patch('db.get_connection'):
    from app import app
    from models import CalculationModel  # Add this import

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

# --- /calculate endpoint ---

def test_calculate_add(client, monkeypatch):
    monkeypatch.setattr(CalculationModel, "create", lambda *a, **kw: 1)
    resp = client.post("/calculate", json={"a": 5, "b": 3, "operation": "add"})
    assert resp.status_code == 200
    assert resp.get_json()["result"] == 8
    assert resp.get_json()["id"] == 1

def test_calculate_missing_params(client):
    resp = client.post("/calculate", json={})
    assert resp.status_code == 400

def test_calculate_invalid_numbers(client):
    resp = client.post("/calculate", json={"a": "x", "b": 2, "operation": "add"})
    assert resp.status_code == 400

def test_calculate_invalid_operation(client):
    resp = client.post("/calculate", json={"a": 1, "b": 2, "operation": "pow"})
    assert resp.status_code == 400

def test_calculate_divide_by_zero(client):
    resp = client.post("/calculate", json={"a": 1, "b": 0, "operation": "divide"})
    assert resp.status_code == 400

def test_calculate_large_numbers(client):
    resp = client.post("/calculate", json={"a": 1e200, "b": 1, "operation": "add"})
    assert resp.status_code == 400

def test_calculate_too_large(client):
    resp = client.post("/calculate", json={"a": 1e200, "b": 1e10, "operation": "add"})
    assert resp.status_code == 400

def test_calculate_db_error(client, monkeypatch):
    def fail(*a, **kw):
        raise Exception("DB error")

    monkeypatch.setattr(CalculationModel, "create", fail)
    resp = client.post("/calculate", json={"a": 1, "b": 2, "operation": "add"})
    assert resp.status_code == 500

# --- /history endpoint ---

def test_history_success(client, monkeypatch):
    monkeypatch.setattr(
        CalculationModel, "get_history", lambda *a, **kw: [{"operation": "add"}]
    )
    resp = client.get("/history?limit=5")
    assert resp.status_code == 200
    assert "history" in resp.get_json()

def test_history_invalid_limit(client, monkeypatch):
    monkeypatch.setattr(CalculationModel, "get_history", lambda *a, **kw: [])
    resp = client.get("/history?limit=9999")
    assert resp.status_code == 200

def test_history_db_error(client, monkeypatch):
    def fail(*a, **kw):
        raise Exception("DB error")

    monkeypatch.setattr(CalculationModel, "get_history", fail)
    resp = client.get("/history")
    assert resp.status_code == 500

def test_calculate_invalid_type(client):
    resp = client.post("/calculate", json={"a": "foo", "b": "bar", "operation": "add"})
    assert resp.status_code == 400

# --- New endpoints: GET, PUT, DELETE /calculation/<id> ---

def test_get_calculation_success(client, monkeypatch):
    mock_calculation = {
        "id": 1,
        "operand1": 5,
        "operand2": 3,
        "operation": "add",
        "result": 8,
        "created_at": "2023-01-01T00:00:00"
    }
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: mock_calculation)
    resp = client.get("/calculation/1")
    assert resp.status_code == 200
    assert resp.get_json()["id"] == 1

def test_get_calculation_not_found(client, monkeypatch):
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: None)
    resp = client.get("/calculation/999")
    assert resp.status_code == 404

def test_update_calculation_success(client, monkeypatch):
    mock_calculation = {
        "id": 1,
        "operand1": 5,
        "operand2": 3,
        "operation": "add",
        "result": 8,
        "created_at": "2023-01-01T00:00:00"
    }
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: mock_calculation)
    monkeypatch.setattr(CalculationModel, "update", lambda *a, **kw: True)
    
    resp = client.put("/calculation/1", json={"a": 10, "b": 5, "operation": "add"})
    assert resp.status_code == 200
    assert resp.get_json()["result"] == 15

def test_update_calculation_not_found(client, monkeypatch):
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: None)
    
    resp = client.put("/calculation/999", json={"a": 10, "b": 5, "operation": "add"})
    assert resp.status_code == 404

def test_delete_calculation_success(client, monkeypatch):
    mock_calculation = {
        "id": 1,
        "operand1": 5,
        "operand2": 3,
        "operation": "add",
        "result": 8,
        "created_at": "2023-01-01T00:00:00"
    }
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: mock_calculation)
    monkeypatch.setattr(CalculationModel, "delete", lambda *a, **kw: True)
    
    resp = client.delete("/calculation/1")
    assert resp.status_code == 200
    assert "message" in resp.get_json()

def test_delete_calculation_not_found(client, monkeypatch):
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: None)
    
    resp = client.delete("/calculation/999")
    assert resp.status_code == 404

# Test database connection errors for new endpoints
def test_get_calculation_db_error(client, monkeypatch):
    def fail(*a, **kw):
        raise Exception("DB error")

    monkeypatch.setattr(CalculationModel, "get_by_id", fail)
    resp = client.get("/calculation/1")
    assert resp.status_code == 500

def test_update_calculation_db_error(client, monkeypatch):
    mock_calculation = {
        "id": 1,
        "operand1": 5,
        "operand2": 3,
        "operation": "add",
        "result": 8,
        "created_at": "2023-01-01T00:00:00"
    }
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: mock_calculation)
    
    def fail(*a, **kw):
        raise Exception("DB error")

    monkeypatch.setattr(CalculationModel, "update", fail)
    resp = client.put("/calculation/1", json={"a": 10, "b": 5, "operation": "add"})
    assert resp.status_code == 500

def test_delete_calculation_db_error(client, monkeypatch):
    mock_calculation = {
        "id": 1,
        "operand1": 5,
        "operand2": 3,
        "operation": "add",
        "result": 8,
        "created_at": "2023-01-01T00:00:00"
    }
    monkeypatch.setattr(CalculationModel, "get_by_id", lambda *a, **kw: mock_calculation)
    
    def fail(*a, **kw):
        raise Exception("DB error")

    monkeypatch.setattr(CalculationModel, "delete", fail)
    resp = client.delete("/calculation/1")
    assert resp.status_code == 500