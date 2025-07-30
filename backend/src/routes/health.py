from flask import Blueprint, jsonify
from datetime import datetime

health_bp = Blueprint('health', __name__)

@health_bp.route('/health', methods=['GET'])
def health_check():
    """Health check simples para verificar se Flask está funcionando"""
    return jsonify({
        'status': 'healthy',
        'message': 'Backend Flask funcionando',
        'timestamp': datetime.now().isoformat()
    })