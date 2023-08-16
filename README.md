# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## How to run

Create a .env file with the contents of .env.example.

Open a terminal window and run `docker compose up` to start the db container.

Sync the prisma schema with db and seed the database (Only for the first time):

```
npx prisma db push
npm run db-seed
```

Open another terminal window and run ``npm run dev` to start the dev server.
