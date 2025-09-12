import unittest, json, sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from unittest.mock import patch
with patch("db.init_db"), patch("db.get_connection"):
    from app import app

class TestService(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()
        app.config["TESTING"] = True

    @patch("models.CalculationModel.create")
    def test_addition(self, mock_create):
        mock_create.return_value = {"id":1,"operand1":5,"operand2":3,"operation":"add","result":8}
        r = self.client.post("/calculate", json={"a":5,"b":3,"operation":"add"})
        self.assertEqual(r.status_code, 201)
        data = json.loads(r.data)
        self.assertEqual(data["result"],8)

    @patch("models.CalculationModel.get_history")
    def test_get_history(self, mock_get):
        mock_get.return_value = [{"id":1,"operand1":5,"operand2":3,"operation":"add","result":8,"created_at":"2023-08-08T12:00:00"}]
        r = self.client.get("/history")
        self.assertEqual(r.status_code, 200)
        data = json.loads(r.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data),1)
        self.assertEqual(data[0]["id"],1)

    @patch("models.CalculationModel.update")
    @patch("models.CalculationModel.get_by_id")
    def test_update_calculation(self, mock_get, mock_update):
        mock_get.return_value = {"id":1,"operand1":5,"operand2":3,"operation":"add","result":8}
        mock_update.return_value = {"id":1,"operand1":10,"operand2":5,"operation":"add","result":15}
        r = self.client.put("/calculation/1", json={"a":10,"b":5,"operation":"add"})
        self.assertEqual(r.status_code, 200)
        data = json.loads(r.data)
        self.assertEqual(data["id"],1)
        self.assertEqual(data["result"],15)
