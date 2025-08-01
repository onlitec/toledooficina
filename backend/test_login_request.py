#!/usr/bin/env python3
import requests
import json

url = 'http://localhost:5000/api/auth/login'
data = {
    'username': 'Admin',
    'password': 'admin123'
}

headers = {
    'Content-Type': 'application/json'
}

try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Erro: {e}")