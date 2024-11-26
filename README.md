# Setting up your development environment

## Initial Setup

1. Clone the repo
2. `cd lecca-io`
3. Install Node.js (version > 20) and npm
4. Install pnpm globally:
   `npm install -g pnpm`
5. Install dependencies:
   `pnpm install`
6. (Optional) Install NX Console VS Code extension.

## Environment Variables

1. Locate the `.env.example` file in the root directory
2. Create a new `.env` file and copy the contents from `.env.example`
3. Modify the variables as needed for your setup

Note: These are the minimum required variables to run the platform. For full functionality, refer to `server.config.ts` for all possible environment variables and their use cases.

## Database Setup

Before starting the server, you'll need a running database. This can be done using Docker:

1. Install Docker for your OS if you don't have it.
2. Run the following command (customize values as needed):
   `docker run --name docker-container-name -d
-e POSTGRES_DB=mydb
-e POSTGRES_PASSWORD=password123
-e POSTGRES_USER=postgres
-p "5432:5432" postgres
`
3. Run the following command to migrate your database to match the prisma schema.
   `pnpm prisma migrate dev`

## Starting the Server

Run the following command in the root directory:
`npx nx run server:serve:development`

You should see a log of all available services running. If any required environment variables are missing, error messages will appear in the logs.

## Starting the UI

Run the following command in the root directory:
`npx nx run ui:serve`
