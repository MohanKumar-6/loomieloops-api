# Loomie Loops Backend

A clean, TypeScript-based backend service for the Loomie Loops yarn shop.

## Tech Stack
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Drizzle ORM
- **Language**: TypeScript
- **Validation**: Zod

## Getting Started

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Update the `MYSQL_URL` with your MySQL connection string.

### 3. Database Migration
Push the schema to your database:
```bash
pnpm db:push
```

### 4. Run the Server
```bash
pnpm dev
```
The server will run on [http://localhost:3001](http://localhost:3001).

## Deployment to Railway

This service is ready to be deployed to [Railway](https://railway.app/).

### Option 1: Separate Repository (Recommended)
1. Use the move script provided to move this folder to a new root.
2. Initialize a git repo: `git init && git add . && git commit -m "initial commit"`.
3. Create a new GitHub repository and push your code.
4. Connect the GitHub repo to Railway.

### Option 2: Monorepo
If you keep it in the `loomieloops` folder:
1. In Railway, set the **Root Directory** to `backend`.
2. Railway will automatically detect the `package.json` and deploy.

### Environment Variables
Ensure you set the following in Railway:
- `PORT`: 3001 (or leave blank for Railway default)
- `DATABASE_URL`: Your PostgreSQL connection string.

## Services Implemented
- **Auth**: Simple login endpoint at `/api/auth/login`.
- **Tracking**: Order tracking endpoint at `/api/tracking/:orderId`.
- **Database Schema**: Pre-defined tables for `users`, `products`, `orders`, and `tracking`.
# loomieloops-api
