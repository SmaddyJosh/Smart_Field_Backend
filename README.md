# Smart Field System - Backend

Welcome to the backend of the Smart Field System! This Node.js/Express application provides the core API for handling authentication, user roles, and field management. It securely connects to a cloud-hosted Aiven MySQL database to persist your application data.

## Setup Instructions

Follow these steps to get the backend running locally:

### 1. Install Dependencies
Ensure you have Node.js and npm installed. Inside the root of the backend folder, install all required packages:
```bash
npm install
```

### 2. Environment Configuration
Create a file named `.env` in the root directory. Add your database mappings and JWT credentials to match this structure:
```env
PORT=5000
DATABASE_URL=mysql://<username>:<password>@<your-aiven-host>.aivencloud.com:<port>/defaultdb?ssl-mode=REQUIRED
JWT_SECRET=super_secret_multifarm_key_2026_xyz
```

### 3. Initialize Database
Before starting the server, you need schemas and initial seed data. We use a custom initialization script to set up the `users` and `fields` tables seamlessly:
```bash
node init_db.js
```
*(Wait until you see the output `Database initialized successfully!` before continuing.)*

### 4. Start the Server
Start up the development server using nodemon:
```bash
npm run dev
```
*(Alternatively, use `npm start` for a standard node instance).* 

The server will be running on `http://localhost:5000` and is ready to process requests!

## Design Decisions

- **Express Ecosystem**: Using standard Express.js enables straightforward, unopinionated routing for basic REST APIs that are easy to structure and understand.
- **Database Handling**: Chosen Aiven MySQL integration by utilizing the `mysql2/promise` pool architecture. This handles asynchronous and concurrent database connections securely and resiliently, avoiding manual connection close/open bloat and callback hell.
- **Authentication Strategy**: Implementing JWT-based authentication allows scalable, server-side stateless sessions. Secure passwords are cryptographically salted and hashed using `bcryptjs` before storage.
- **Modularized Structure**: Extracted repetitive logic and routes into separate files (`db.js`, `AuthRoutes.js`) to maintain clean separation of concerns and keep `server.js` clear and readable.

## Assumptions Made

- **Database Availability**: Assumes that the Aiven MySQL database cluster remains constantly active, fully accessible, and accepts secure TLS connections via `ssl-mode=REQUIRED`.
- **CORS Handling**: Assumes the React frontend is requesting over straightforward ports and is able to negotiate standard `cors` checks that the server defaults to.
- **Protected Environment Variables**: Based on typical usage, it is assumed that environment variables populated in `.env` are inherently kept out of git history by `.gitignore` (reducing human error).
- **Authentication Flow Integration**: It's assumed the frontend correctly caches the returned JWT token. Currently, the API provides the basics for tokens generation upon user login, functioning safely while further protected-route token verification logic can be securely padded.
