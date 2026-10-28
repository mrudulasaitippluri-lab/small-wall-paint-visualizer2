# Smart Wall Paint Visualizer (MEAN Stack)

A starter full-stack web application for previewing wall paint colours on uploaded room photos.

## Requirements
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

## Project structure
- `backend/` — Express REST API, MongoDB models, JWT authentication
- `frontend/` — Angular standalone application

## 1. Start the backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```
Edit `.env` and set `MONGODB_URI` and a strong `JWT_SECRET`. The API runs at `http://localhost:5000`.

## 2. Start the Angular frontend
Open another terminal:
```bash
cd frontend
npm install
npm start
```
Open `http://localhost:4200`.

## Demo accounts
Register a normal account through the app. To make an admin, register an account and update that user's `role` to `admin` in MongoDB. Never expose admin role assignment in a public production registration form.

## Included features
- Register/login with JWT
- Upload JPG/PNG room images
- Canvas-based manual polygon wall selection (click points, then close polygon)
- Apply a paint colour with adjustable opacity
- Download the rendered image
- Save projects to MongoDB and view saved projects
- Paint colour palette API and basic admin colour management endpoint
- Responsive interface and API validation

## API overview
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/colors` (public)
- `POST /api/colors` (admin)
- `PUT /api/colors/:id` (admin)
- `DELETE /api/colors/:id` (admin)
- `GET /api/projects` (authenticated user's projects; admins can query all)
- `POST /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`

## Important notes
- This is a functional starter suitable for coursework/demo use, not a production-audited system.
- The frontend keeps the current working image in browser memory. Saved project metadata and a data-URL preview are stored in MongoDB for demonstration; for production, use object storage (e.g. S3) and store URLs instead of large data URLs.
- Manual polygon selection is a basic tool. It does not include AI wall detection, AR/VR, payments, or advanced texture simulation.
- Colour previews are approximate. Real paint appearance varies with lighting, screen calibration, and wall texture.
- Upload only photos you own or have permission to use. Do not upload private images without consent.
