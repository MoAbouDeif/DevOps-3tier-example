# locustfile.py
from locust import HttpUser, task, between, TaskSet
import random
import json

class CalculatorTasks(TaskSet):
    
    def on_start(self):
        """Initialize with some test data"""
        self.operations = ["add", "subtract", "multiply", "divide"]
        self.calculation_ids = []
    
    @task(5)
    def test_calculate_operation(self):
        """Test the main calculate endpoint with various operations"""
        operation = random.choice(self.operations)
        
        # Generate random numbers, avoid division by zero
        a = random.randint(1, 1000)
        b = random.randint(1, 100) if operation == "divide" else random.randint(1, 1000)
        
        payload = {
            "a": a,
            "b": b,
            "operation": operation
        }
        
        with self.client.post(
            "/api/calculate",  # Updated to use frontend API endpoint
            json=payload,
            catch_response=True,
            name=f"POST /api/calculate {operation}"
        ) as response:
            if response.status_code == 201:  # Updated to expect 201 status code
                data = response.json()
                self.calculation_ids.append(data.get("id"))
                response.success()
            else:
                response.failure(f"Status: {response.status_code}, Response: {response.text}")
    
    @task(3)
    def test_get_history(self):
        """Test retrieving calculation history"""
        with self.client.get(
            "/api/history?limit=10",
            catch_response=True,
            name="GET /api/history"
        ) as response:
            if response.status_code == 200:
                try:
                    data = response.json()
                    # Check if response is an array (list) of history items
                    if isinstance(data, list):
                        response.success()
                    else:
                        response.failure("Response is not an array")
                except ValueError:
                    response.failure("Invalid JSON response")
            else:
                response.failure(f"Status: {response.status_code}")
    
    @task(2)
    def test_get_calculation_by_id(self):
        """Test retrieving a specific calculation by ID"""
        if self.calculation_ids:
            calculation_id = random.choice(self.calculation_ids)
            with self.client.get(
                f"/api/calculation/{calculation_id}",  # Updated to use frontend API endpoint
                catch_response=True,
                name="GET /api/calculation/[id]"
            ) as response:
                if response.status_code in [200, 404]:
                    response.success()
                else:
                    response.failure(f"Status: {response.status_code}")
    
    @task(1)
    def test_update_calculation(self):
        """Test updating an existing calculation"""
        if self.calculation_ids:
            calculation_id = random.choice(self.calculation_ids)
            payload = {
                "a": random.randint(1, 100),
                "b": random.randint(1, 100),
                "operation": random.choice(self.operations)
            }
            
            with self.client.put(
                f"/api/calculation/{calculation_id}",  # Updated to use frontend API endpoint
                json=payload,
                catch_response=True,
                name="PUT /api/calculation/[id]"
            ) as response:
                if response.status_code in [200, 404]:
                    response.success()
                else:
                    response.failure(f"Status: {response.status_code}")
    
    @task(1)
    def test_delete_calculation(self):
        """Test deleting a calculation (will create 404s but that's expected)"""
        if self.calculation_ids:
            calculation_id = random.choice(self.calculation_ids)
            with self.client.delete(
                f"/api/calculation/{calculation_id}",  # Updated to use frontend API endpoint
                catch_response=True,
                name="DELETE /api/calculation/[id]"
            ) as response:
                # 200, 404, or 204 are all acceptable responses
                if response.status_code in [200, 204, 404]:
                    response.success()
                else:
                    response.failure(f"Status: {response.status_code}")

class FrontendUser(HttpUser):
    @task(1)
    def test_frontend(self):
        with self.client.get("/", catch_response=True, name="GET /") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Status: {response.status_code}")
    
    wait_time = between(1, 3)
    host = {{ .Values.config.targetHost }} 

class APITester(HttpUser):
    tasks = [CalculatorTasks]
    wait_time = between(0.5, 2.0)
    host = {{ .Values.config.targetHost }} # Target frontend service