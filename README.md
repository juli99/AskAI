# AskAI

מיני-צ'אט AI אישי עם הרשמה/התחברות, היסטוריית שיחות, ושיחה מול Gemini.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind
- **Backend:** Python 3.12 + FastAPI + Motor
- **Database:** MongoDB 7.0
- **AI:** Google Gemini 2.0 Flash (Free Tier)
- **Auth:** Email/Password (JWT) + Google OAuth

## Prerequisites

- Python 3.12+
- Node.js 20+
- MongoDB (מקומי `mongodb://localhost:27017` או [Atlas Free Tier](https://www.mongodb.com/atlas))
- [Gemini API key](https://aistudio.google.com/app/apikey) (חינם)
- [Google OAuth Client ID](https://console.cloud.google.com/apis/credentials) (חינם)

## Setup

### 1. Backend

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

ערוך את `backend\.env` ומלא לפחות:
- `JWT_SECRET` - מחרוזת אקראית חזקה (32+ תווים)
- `GEMINI_API_KEY` - מ-Google AI Studio
- `GOOGLE_CLIENT_ID` - אופציונלי (רק אם רוצים Google login)
- `SMTP_USER` + `SMTP_PASSWORD` - לאימות אימייל בהרשמה (ראה למטה)

### 2. Frontend

```powershell
cd frontend
npm install
copy .env.example .env.local
```

ערוך את `frontend\.env.local`:
- `VITE_GOOGLE_CLIENT_ID` - אותו Client ID של גוגל (לפרונט)

### 3. Google OAuth (אופציונלי)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → צור OAuth Client ID (Web)
2. הוסף `http://localhost:5173` ל-Authorized JavaScript origins
3. העתק את ה-Client ID לשני קבצי ה-env

### 4. Gmail SMTP לאימות אימייל (חינם)

נדרש כדי לשלוח קודי אימות בהרשמה. חינמי לחלוטין (500 מיילים ביום).

1. **הפעל אימות דו-שלבי** בחשבון Google שלך: https://myaccount.google.com/security
2. **צור App Password:** https://myaccount.google.com/apppasswords → בחר "Mail" → העתק את 16 התווים שנוצרו (בלי רווחים)
3. עדכן ב-`backend\.env`:
   ```
   SMTP_USER=your-gmail@gmail.com
   SMTP_PASSWORD=xxxxxxxxxxxxxxxx
   ```

אם תחצה את התקרה (500/יום) ה-Gmail ייחסם זמנית לשליחה — לא יחויב כסף.

## Run

פתח שני טרמינלים:

**Backend (port 8000):**
```powershell
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Frontend (port 5173):**
```powershell
cd frontend
npm run dev
```

פתח: http://localhost:5173

Swagger UI ל-API: http://localhost:8000/docs

## Project Structure

```
AskAI/
├── backend/              # FastAPI + Motor + Gemini
│   └── app/
│       ├── routers/      # auth, chat, users
│       ├── services/     # auth_service, google_oauth, ai_service (abstraction)
│       ├── models/       # User, Conversation, Message
│       ├── schemas/      # request/response DTOs
│       ├── config.py
│       ├── db.py
│       ├── deps.py       # JWT auth dependency
│       └── main.py
└── frontend/             # React + Vite + Tailwind
    └── src/
        ├── api/          # axios + endpoints
        ├── pages/        # LoginPage, RegisterPage, ChatPage
        ├── components/   # ProtectedRoute, MessageBubble, MessageInput
        ├── store/        # auth context
        └── types/
```

## Roadmap

ראה [תוכנית מפורטת](../.claude/plans/unified-whistling-harp.md) לפיצ'רים עתידיים: streaming, העלאת קבצים/תמונות, RAG, multi-model, dark mode, ועוד.

## Notes

- **Gemini Free Tier:** 15 RPM / 1500 RPD. ב-Free Tier גוגל עשויה להשתמש בקלט/פלט לשיפור מודלים - אל תכניס מידע רגיש.
- **JWT secret:** חייב להיות חזק (32+ תווים אקראיים) ולא להישמר ב-git.
