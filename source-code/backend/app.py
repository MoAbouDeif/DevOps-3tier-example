import os
import traceback
from flask import Flask, jsonify, request
from flask_cors import CORS
from calculator import add, subtract, multiply, divide
from db import init_db, get_connection
from models import CalculationModel
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# Initialize DB
init_db(app)

# CORS
allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()] or ["*"]
CORS(app, origins=allowed_origins, methods=["GET","POST","PUT","DELETE","OPTIONS"],
     allow_headers=["Content-Type"], supports_credentials=True)

# ---------- Probes ----------
@app.route("/healthz")
@app.route("/live")
def liveness():
    return jsonify({"status": "alive"}), 200

@app.route("/startup")
def startup():
    return jsonify({"status": "started"}), 200

@app.route("/ready")
def readiness():
    try:
        # simple DB check
        conn = get_connection(app)
        conn.close()
        return jsonify({"status": "ready"}), 200
    except Exception as e:
        app.logger.warning("Readiness check failed: %s", str(e))
        return jsonify({"status": "not ready", "reason": str(e)}), 503

# ---------- API ----------
@app.route("/")
def index():
    return "Calculator API Service"

@app.route("/calculate", methods=["POST"])
def calculate():
    data = request.get_json() or {}
    a, b, operation = data.get("a"), data.get("b"), data.get("operation")
    if a is None or b is None or operation is None:
        return jsonify({"error": "Missing parameters"}), 400
    try:
        a, b = float(a), float(b)
        if abs(a) > 1e100 or abs(b) > 1e100:
            return jsonify({"error": "Numbers too large"}), 400
    except Exception:
        return jsonify({"error": "Invalid numbers"}), 400
    try:
        if operation == "add": result = add(a,b)
        elif operation == "subtract": result = subtract(a,b)
        elif operation == "multiply": result = multiply(a,b)
        elif operation == "divide":
            if b==0: return jsonify({"error": "Cannot divide by zero"}), 400
            result = divide(a,b)
        else:
            return jsonify({"error": "Invalid operation"}), 400

        calc = CalculationModel.create(app, a, b, operation, result)
        return jsonify(calc), 201
    except Exception as e:
        app.logger.error(f"Calculate error: {str(e)}\n{traceback.format_exc()}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/history", methods=["GET"])
def get_history():
    try:
        limit = request.args.get("limit", 10, type=int)
        history = CalculationModel.get_history(app, limit)
        return jsonify(history), 200
    except Exception as e:
        app.logger.error(f"History error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route("/calculation/<int:calculation_id>", methods=["GET"])
def get_calculation(calculation_id):
    c = CalculationModel.get_by_id(app, calculation_id)
    if not c: return jsonify({"error": "Calculation not found"}), 404
    return jsonify(c), 200

@app.route("/calculation/<int:calculation_id>", methods=["PUT"])
def update_calculation(calculation_id):
    data = request.get_json() or {}
    a, b, operation = data.get("a"), data.get("b"), data.get("operation")
    if a is None or b is None or operation is None:
        return jsonify({"error": "Missing parameters"}), 400
    try:
        a, b = float(a), float(b)
        if abs(a) > 1e100 or abs(b) > 1e100:
            return jsonify({"error": "Numbers too large"}), 400
    except Exception:
        return jsonify({"error": "Invalid numbers"}), 400

    try:
        if operation == "add": result = add(a,b)
        elif operation == "subtract": result = subtract(a,b)
        elif operation == "multiply": result = multiply(a,b)
        elif operation == "divide":
            if b==0: return jsonify({"error": "Cannot divide by zero"}), 400
            result = divide(a,b)
        else:
            return jsonify({"error": "Invalid operation"}), 400
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    try:
        updated = CalculationModel.update(app, calculation_id, a, b, operation, result)
        if not updated: 
            return jsonify({"error": "Calculation not found"}), 404
        return jsonify(updated), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route("/calculation/<int:calculation_id>", methods=["DELETE"])
def delete_calculation(calculation_id):
    deleted = CalculationModel.delete(app, calculation_id)
    if not deleted: return jsonify({"error": "Calculation not found"}), 404
    return jsonify({"message": "Calculation deleted successfully"}), 200

if __name__=="__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=os.getenv("DEBUG")=="True")