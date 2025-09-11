import unittest
import json
import sys
import os

# Add the parent directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock database before importing app
from unittest.mock import patch, MagicMock

# Mock the database connection
with patch('db.init_db'), patch('db.get_connection'):
    from app import app

class TestService(unittest.TestCase):

    def setUp(self):
        self.app = app
        self.app.config["TESTING"] = True
        self.client = self.app.test_client()

    @patch("app.CalculationModel.create")
    def test_addition(self, mock_create):
        mock_create.return_value = 1
        response = self.client.post(
            "/calculate", json={"a": 5, "b": 3, "operation": "add"}
        )
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["result"], 8)
        self.assertEqual(data["id"], 1)
        mock_create.assert_called_once()

    @patch("app.CalculationModel.create")
    def test_division_by_zero(self, mock_create):
        response = self.client.post(
            "/calculate", json={"a": 5, "b": 0, "operation": "divide"}
        )
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(data["error"], "Division by zero")
        mock_create.assert_not_called()

    @patch("app.CalculationModel.get_history")
    def test_get_history(self, mock_get_history):
        mock_history = [
            {
                "id": 1,
                "operand1": 5,
                "operand2": 3,
                "operation": "add",
                "result": 8,
                "created_at": "2023-08-08T12:00:00",
            }
        ]
        mock_get_history.return_value = mock_history

        response = self.client.get("/history")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["history"], mock_history)

    @patch("app.CalculationModel.get_by_id")
    def test_get_calculation(self, mock_get_by_id):
        mock_calculation = {
            "id": 1,
            "operand1": 5,
            "operand2": 3,
            "operation": "add",
            "result": 8,
            "created_at": "2023-08-08T12:00:00",
        }
        mock_get_by_id.return_value = mock_calculation

        response = self.client.get("/calculation/1")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data, mock_calculation)

    @patch("app.CalculationModel.get_by_id")
    @patch("app.CalculationModel.update")
    def test_update_calculation(self, mock_update, mock_get_by_id):
        mock_existing = {
            "id": 1,
            "operand1": 5,
            "operand2": 3,
            "operation": "add",
            "result": 8,
            "created_at": "2023-08-08T12:00:00",
        }
        mock_get_by_id.return_value = mock_existing
        mock_update.return_value = True

        response = self.client.put(
            "/calculation/1", json={"a": 10, "b": 5, "operation": "add"}
        )
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["result"], 15)
        self.assertEqual(data["id"], 1)

    @patch("app.CalculationModel.get_by_id")
    @patch("app.CalculationModel.delete")
    def test_delete_calculation(self, mock_delete, mock_get_by_id):
        mock_existing = {
            "id": 1,
            "operand1": 5,
            "operand2": 3,
            "operation": "add",
            "result": 8,
            "created_at": "2023-08-08T12:00:00",
        }
        mock_get_by_id.return_value = mock_existing
        mock_delete.return_value = True

        response = self.client.delete("/calculation/1")
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", data)