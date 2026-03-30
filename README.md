# Smart Support System - Backend

![Alt text for the image](./assets/logo.png)

This repo contains the backend API for managing support operations with role-based access control, user authentication, and company management. Built with NestJS and PostgreSQL.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 12.0
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/umbc-cmsc447-section1-1932-team2/Smart-Support-System-BE.git
cd Smart-Support-System-BE
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
touch .env
```

Then add the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart_support_db"
# Server
PORT=3000
NODE_ENV=development
# JWT key for signing, needed for JWT token functionality
JWT_SECRET="your-secret-key-here"
```

### 4. Local Database Setup

You can use pgAdmin or psql to create a new database.

**Using psql:**

Start the PostgreSQL service:

```bash
brew services start postgresql
```

Open psql:

```bash
psql -U postgres
```

Create the database:

```sql
CREATE DATABASE smart_support_db;
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Run Migrations

```bash
npm run migration:dev -- --name <migration_name>
```

### 7. Start Development Server

```bash
npm run start:dev
```

![sdcasd](./assets/sc_run.png)

### 8. use postman for the api simulations

![SC postman running](./assets/sc_postman.png)

## Contributing

1. Create a feature branch from `main`:
   - `ft-` for features
   - `bg-` for bug fixes
   - `ch-` for chores
2. Make your changes and commit:
3. Squash your commits:

```bash
   git rebase -i main ~N
```

4. Rebase onto main:

```bash
   git fetch origin main --rebase
```

5. Push your branch:

6. Open a Pull Request on GitHub.
