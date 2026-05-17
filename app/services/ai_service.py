import os
from typing import List
import google.generativeai as genai
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

# APIキーの設定
# ユーザーの指示に従い GOOGLE_API_KEY を優先するが、
# 既存の .env にある可能性を考慮して GEMINI_API_KEY もチェックする
api_key = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
else:
    # 警告を表示するか、実行時にエラーを投げる
    print("Warning: GOOGLE_API_KEY or GEMINI_API_KEY not found in environment variables.")

def get_embedding(text: str) -> List[float]:
    """
    指定されたテキストの埋め込みベクトルを取得します。
    モデルには 'models/gemini-embedding-001' を使用します。
    """
    if not text:
        return []

    try:
        # gemini-embedding-001 モデルを使用してベクトルを生成
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document",
            title="Incident Embedding"
        )
        # データベースの次元数(768)に合わせてスライスする（次元不一致エラー回避のため）
        embedding = result['embedding']
        return embedding[:768]
    except Exception as e:
        print(f"Error calling Gemini API for embedding: {e}")
        # 実運用環境では適切に例外を再送出するか、フォールバックを検討する
        raise e
