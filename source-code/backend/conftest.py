import sys
import os

# Add the parent directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Mock database before importing any app modules
from unittest.mock import patch, MagicMock

# Mock the database connection for all tests
with patch('db.init_db'), patch('db.get_connection'):
    from app import app
    from models import CalculationModel