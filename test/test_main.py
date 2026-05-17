import os
import pytest
import sys
from fastapi.testclient import TestClient

# プロジェクトのルートディレクトリをsys.pathに追加する
# これにより、'app.main'のようなトップレベルのインポートが可能になります
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

# 同期テスト用のクライアント（TestClientは同期的に動作します）
client = TestClient(app)

def test_read_root():
    """
    ルートエンドポイント (/) のテスト。
    FastAPIアプリケーションが正しく起動し、
    期待されるメッセージを返すことを確認します。
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Incident Management API is running"}