# Mini Store Backend

Backend API for the Mini Store application built with Node.js, Express, TypeScript, and PostgreSQL.

## Setup Instructions

### Prerequisites

- Node.js v18+
- PostgreSQL database running locally

### Environment Variables

Create a `.env` file in the backend directory with:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/mini_store_db"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3000
```

### Installation & Setup

1.Install dependencies:

```bash
npm install
```

2.Generate Prisma client:

```bash
npm run db:generate
```

3.Push database schema:

```bash
npm run db:push
```

4.Start development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /health` - Health check

### Example Registration

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### Example Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Database Schema

- **Users**: id, email, password, walletBalance (default $1000), timestamps
- **Orders**: id, userId, productId, quantity, totalAmount, createdAt
- **Gifts**: id, senderId, receiverId, productId, quantity, totalAmount, message, createdAt

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
