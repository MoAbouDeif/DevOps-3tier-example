from db import get_connection

class CalculationModel:
    @staticmethod
    def create(app, operand1, operand2, operation, result):
        valid_operations = {"add", "subtract", "multiply", "divide"}
        if operation not in valid_operations:
            raise ValueError("Invalid operation type")
        conn = None
        try:
            conn = get_connection(app)
            cur = conn.cursor()
            cur.execute(
                "INSERT INTO calculations (operand1, operand2, operation, result) "
                "VALUES (%s, %s, %s, %s) RETURNING id",
                (operand1, operand2, operation, result),
            )
            calculation_id = cur.fetchone()[0]
            conn.commit()
            return {"id": calculation_id, "operand1": operand1, "operand2": operand2,
                    "operation": operation, "result": result}
        finally:
            if conn:
                conn.close()

    @staticmethod
    def get_history(app, limit=10):
        try:
            limit = int(limit)
            if limit <= 0 or limit > 100:
                limit = 10
        except Exception:
            limit = 10

        conn = None
        try:
            conn = get_connection(app)
            cur = conn.cursor()
            cur.execute(
                "SELECT id, operand1, operand2, operation, result, created_at "
                "FROM calculations ORDER BY created_at DESC LIMIT %s", (limit,)
            )
            rows = cur.fetchall()
            history = []
            for r in rows:
                history.append({
                    "id": r[0], "operand1": r[1], "operand2": r[2],
                    "operation": r[3], "result": r[4],
                    "created_at": r[5].isoformat() if r[5] else None
                })
            return history
        finally:
            if conn:
                conn.close()

    @staticmethod
    def get_by_id(app, calculation_id):
        conn = None
        try:
            conn = get_connection(app)
            cur = conn.cursor()
            cur.execute(
                "SELECT id, operand1, operand2, operation, result, created_at "
                "FROM calculations WHERE id = %s", (calculation_id,)
            )
            r = cur.fetchone()
            if r:
                return {"id": r[0], "operand1": r[1], "operand2": r[2],
                        "operation": r[3], "result": r[4],
                        "created_at": r[5].isoformat() if r[5] else None}
            return None
        finally:
            if conn:
                conn.close()

    @staticmethod
    def update(app, calculation_id, operand1, operand2, operation, result):
        valid_operations = {"add", "subtract", "multiply", "divide"}
        if operation not in valid_operations:
            raise ValueError("Invalid operation type")
        conn = None
        try:
            conn = get_connection(app)
            cur = conn.cursor()
            cur.execute(
                "UPDATE calculations SET operand1=%s, operand2=%s, operation=%s, result=%s "
                "WHERE id=%s", (operand1, operand2, operation, result, calculation_id)
            )
            conn.commit()
            if cur.rowcount == 0:
                return None
            return {"id": calculation_id, "operand1": operand1, "operand2": operand2,
                    "operation": operation, "result": result}
        finally:
            if conn:
                conn.close()

    @staticmethod
    def delete(app, calculation_id):
        conn = None
        try:
            conn = get_connection(app)
            cur = conn.cursor()
            cur.execute("DELETE FROM calculations WHERE id=%s", (calculation_id,))
            conn.commit()
            return cur.rowcount > 0
        finally:
            if conn:
                conn.close()
