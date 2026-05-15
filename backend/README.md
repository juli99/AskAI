# AskAI Backend (Python + FastAPI)

## Setup

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# ערוך את .env ומלא את הערכים (JWT_SECRET, GEMINI_API_KEY, GOOGLE_CLIENT_ID)
```

## Run

```powershell
uvicorn app.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs

## Environment

| משתנה | תיאור |
|--------|--------|
| `MONGO_URI` | חיבור ל-MongoDB (ברירת מחדל: `mongodb://localhost:27017`) |
| `MONGO_DB_NAME` | שם הדאטה-בייס |
| `JWT_SECRET` | מחרוזת אקראית חזקה (32+ תווים) |
| `GOOGLE_CLIENT_ID` | OAuth client ID מ-Google Cloud Console |
| `GEMINI_API_KEY` | API key מ-[Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GEMINI_MODEL` | שם המודל (ברירת מחדל: `gemini-2.0-flash`) |
| `FRONTEND_ORIGIN` | מקור ה-frontend ל-CORS (ברירת מחדל: `http://localhost:5173`) |
