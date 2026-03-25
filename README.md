# ActivityWork

ActivityWork is a fully local Next.js application that acts as an intermediary module between ActivityWatch and Timeharbor.

It receives and organizes local activity events, stores them in a local SQLite database, and prepares them for downstream processing between both systems without relying on any cloud service.

## Project Location

The Next.js app is located in `activitywork/`.

## Local Development

```bash
cd activitywork
npm install
npm run dev
```

SQLite is configured through Prisma and runs locally using the `DATABASE_URL` in `activitywork/.env`.
