import uuid
from sqlmodel import Session, select
from app.models.models import User, Incident, get_engine
from app.services.ai_service import get_embedding

def verify_integration():
    engine = get_engine()
    
    with Session(engine) as session:
        # 1. テストユーザーの作成（または既存取得）
        test_username = "test_user_ai"
        user = session.exec(select(User).where(User.username == test_username)).first()
        if not user:
            print("Creating test user...")
            user = User(username=test_username, email="ai_test@example.com", full_name="AI Test User")
            session.add(user)
            session.commit()
            session.refresh(user)
        
        # 2. Gemini APIによるベクトル生成テスト
        print("Calling Gemini API for embedding...")
        test_title = "Authentication failure in production"
        test_desc = "Users reporting 500 errors when trying to log in to the main portal."
        embedding_text = f"Title: {test_title}\nDescription: {test_desc}"
        
        try:
            vector = get_embedding(embedding_text)
            print(f"Successfully generated vector. Dimensions: {len(vector)}")
            
            if len(vector) != 768:
                print(f"Warning: Expected 768 dimensions, but got {len(vector)}")
        except Exception as e:
            print(f"AI Service Error: {e}")
            return

        # 3. インシデントの作成と保存
        print("Saving incident to database with embedding...")
        new_incident = Incident(
            title=test_title,
            description=test_desc,
            impact="High",
            urgency="High",
            priority="Critical",
            reported_by_id=user.id,
            embedding=vector
        )
        session.add(new_incident)
        session.commit()
        session.refresh(new_incident)
        
        # 4. DBからの再取得と検証
        print(f"Verifying saved incident: {new_incident.id}")
        saved_incident = session.get(Incident, new_incident.id)
        
        if saved_incident and saved_incident.embedding:
            print("SUCCESS: Incident saved with embedding data!")
            print(f"Sample of saved vector (first 5 elements): {saved_incident.embedding[:5]}")
        else:
            print("FAILED: Incident saved but embedding is missing.")

if __name__ == "__main__":
    verify_integration()
