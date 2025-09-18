# MutPark Development Guide

## 🚀 Quick Start

### Option 1: Local Development (Recommended)
```bash
# Install dependencies
npm install

# Set up database and start development server
npm run dev:setup
```

### Option 2: Docker Development
```bash
# Start with Docker Compose
npm run docker:dev

# Stop Docker containers
npm run docker:down
```

## 🔧 Development Environment

### Railway Database Connection
The project uses Railway MySQL database for both development and production:
- Database URL is configured in `.env.local` for development
- Same database instance is used to maintain data consistency

### Environment Files
- `.env` - Production environment variables
- `.env.local` - Local development overrides

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server with Turbopack |
| `npm run dev:setup` | Generate Prisma client, push schema, and start dev server |
| `npm run docker:dev` | Start full stack with Docker Compose |
| `npm run docker:down` | Stop Docker containers |
| `npm run prisma:studio` | Open Prisma Studio database browser |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with sample data |

## 📊 Database Management

### Prisma Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes to database
npm run db:push

# Open Prisma Studio
npm run prisma:studio

# Seed database with sample data
npm run db:seed
```

## 🐳 Docker Development

The `docker-compose.dev.yml` provides:
- Next.js app with hot reload
- MySQL database
- Volume mounting for live code updates

## 🔄 Railway Integration

### Deployment Flow
1. Push changes to GitHub
2. Railway automatically detects changes
3. Builds using Dockerfile
4. Deploys to `mutpark-production.up.railway.app`

### Local to Railway Workflow
1. Develop locally with `npm run dev`
2. Test with Railway database
3. Commit and push for automatic deployment

## 🔒 Environment Variables

### Required Variables
- `DATABASE_URL` - Railway MySQL connection string
- `JWT_SECRET` - JWT signing secret
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `NEXT_PUBLIC_APP_URL` - App base URL

### Optional Variables
- `IYZICO_API_KEY` - Payment gateway API key
- `IYZICO_SECRET_KEY` - Payment gateway secret