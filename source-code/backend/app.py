import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from calculator import add, subtract, multiply, divide
from db import init_db, get_connection
from models import CalculationModel
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Initialize PostgreSQL database
init_db(app)

# Configure CORS from environment
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
]

CORS(
    app,
    origins=allowed_origins,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"],
    supports_credentials=True,
)

@app.route("/")
def index():
    return "Calculator API Service"

@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing parameters"}), 400

    a = data.get("a")
    b = data.get("b")
    operation = data.get("operation")

    if a is None or b is None or operation is None:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        # Convert and validate numbers
        a = float(a)
        b = float(b)

        # Prevent excessively large numbers
        if abs(a) > 1e100 or abs(b) > 1e100:
            return jsonify({"error": "Numbers too large"}), 400

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numbers"}), 400

    try:
        if operation == "add":
            result = add(a, b)
        elif operation == "subtract":
            result = subtract(a, b)
        elif operation == "multiply":
            result = multiply(a, b)
        elif operation == "divide":
            result = divide(a, b)
        else:
            return jsonify({"error": "Invalid operation"}), 400

        # Save to database
        calculation_id = CalculationModel.create(app, a, b, operation, result)

        return jsonify({"id": calculation_id, "result": result})

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Database error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/history", methods=["GET"])
def get_history():
    try:
        # Get and validate limit parameter
        limit = request.args.get("limit", default=10, type=int)
        if limit <= 0 or limit > 100:
            limit = 10

        history = CalculationModel.get_history(app, limit)
        return jsonify({"history": history})
    except Exception as e:
        app.logger.error(f"History error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/calculation/<int:calculation_id>", methods=["GET"])
def get_calculation(calculation_id):
    try:
        calculation = CalculationModel.get_by_id(app, calculation_id)
        if not calculation:
            return jsonify({"error": "Calculation not found"}), 404
        return jsonify(calculation)
    except Exception as e:
        app.logger.error(f"Get calculation error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/calculation/<int:calculation_id>", methods=["PUT"])
def update_calculation(calculation_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing parameters"}), 400

    a = data.get("a")
    b = data.get("b")
    operation = data.get("operation")

    if a is None or b is None or operation is None:
        return jsonify({"error": "Missing parameters"}), 400

    try:
        # Convert and validate numbers
        a = float(a)
        b = float(b)

        # Prevent excessively large numbers
        if abs(a) > 1e100 or abs(b) > 1e100:
            return jsonify({"error": "Numbers too large"}), 400

    except (TypeError, ValueError):
        return jsonify({"error": "Invalid numbers"}), 400

    try:
        # Check if calculation exists
        existing = CalculationModel.get_by_id(app, calculation_id)
        if not existing:
            return jsonify({"error": "Calculation not found"}), 404

        # Perform the calculation
        if operation == "add":
            result = add(a, b)
        elif operation == "subtract":
            result = subtract(a, b)
        elif operation == "multiply":
            result = multiply(a, b)
        elif operation == "divide":
            result = divide(a, b)
        else:
            return jsonify({"error": "Invalid operation"}), 400

        # Update the calculation
        updated = CalculationModel.update(app, calculation_id, a, b, operation, result)
        if not updated:
            return jsonify({"error": "Calculation not found"}), 404

        return jsonify({"id": calculation_id, "result": result})

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        app.logger.error(f"Update calculation error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/calculation/<int:calculation_id>", methods=["DELETE"])
def delete_calculation(calculation_id):
    try:
        # Check if calculation exists
        existing = CalculationModel.get_by_id(app, calculation_id)
        if not existing:
            return jsonify({"error": "Calculation not found"}), 404

        # Delete the calculation
        deleted = CalculationModel.delete(app, calculation_id)
        if not deleted:
            return jsonify({"error": "Calculation not found"}), 404

        return jsonify({"message": "Calculation deleted successfully"})
    except Exception as e:
        app.logger.error(f"Delete calculation error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == "__main__":
    app.run(
        debug=os.getenv("DEBUG", "False") == "True",
        host="0.0.0.0",
        port=5000,
    )