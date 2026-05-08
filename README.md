# Liberon Academy - Admin + Backend Guide

## Run backend

1. Go to backend folder:

```bash
cd backend
```

2. Install packages:

```bash
npm install
```

3. Create env file:

```bash
cp .env.example .env
```

4. Update DB values in `.env`:
- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME=liberon_academy`
- `JWT_SECRET`

5. Start server:

```bash
npm run dev
```

Backend runs at `http://localhost:5000`.

## Access admin panel

- Login page: `http://localhost:5000/admin/login`
- Dashboard: `http://localhost:5000/admin/dashboard`

Seeded default admin (if `admins` table is empty):
- Email: `admin@liberonacademy.live`
- Password: `admin123`

## Add subjects/topics

Inside dashboard:
- **Subject Management** section:
  - Add subject name, icon, description
  - Use Edit/Delete buttons
- **Topic Management** section:
  - Select subject
  - Add topic and description
  - Edit/Delete topics

## Upload PDFs

Inside dashboard:
- Open **PDF Upload System**
- Fill title/category
- Choose PDF file
- Click **Upload PDF**

Files are stored in `backend/uploads/pdfs/`.
Metadata is stored in MySQL table `pdfs`.

## API routes

- Admin auth
  - `POST /api/admin/login`
  - `POST /api/admin/register-initial`
  - `GET /api/admin/me`
- Subjects
  - `GET /api/subjects`
  - `POST /api/subjects`
  - `PUT /api/subjects/:id`
  - `DELETE /api/subjects/:id`
- Topics
  - `GET /api/topics`
  - `POST /api/topics`
  - `PUT /api/topics/:id`
  - `DELETE /api/topics/:id`
- PDFs
  - `GET /api/pdfs`
  - `POST /api/pdfs`
  - `DELETE /api/pdfs/:id`
- Lectures
  - `GET /api/lectures`
  - `POST /api/lectures`
  - `PUT /api/lectures/:id`
  - `DELETE /api/lectures/:id`

## Database tables (auto-created)

- `admins`
- `subjects`
- `topics`
- `pdfs`
- `lectures`

These are auto-created and auto-seeded when backend starts.
