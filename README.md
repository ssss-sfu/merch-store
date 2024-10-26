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

## Cart Implementation

The cart is currently stored in memory using a state library called [jotai](https://jotai.org/). Jotai has
some [documenation](https://jotai.org/docs/guides/persistence) on how to make it persistent in local storage.

The implementation for the store is done all in the frontend in the file `cartStore.ts`.

## Admin Dashboard

The dashboard can be access through `/dashboard` in the url bar

### Changing the admin credentials

There is one admin user that will be added when the database is seeded initially. To change the credentails, update the
`.env` file by changing `ADMIN_USERNAME` and `ADMIN_PASSWORD` and run `npm run db-seed`.

Note: This wipe the database.

If you want to update the credentails without resetting the database, you would have to modify the username and password directly.
One way to do that is to use prisma studio's UI.

Open a new terminal and run npx prisma studio. Modify the username.

Modifying the password is a bit more tricky since you would have to generate the hashed password using a site like [bcrypt generator](https://bcrypt-generator.com/) and
update the passowrd in the db with the hashed password.

### Adding additional logic for authorization/authentication

Authentication is handled by a library called [NextAuth](https://next-auth.js.org/). The login logic can be found in the file `auth.ts`.

## Frontend Backend communication

Refer to the create t3 [docs](https://create.t3.gg/en/usage/trpc).

## Styling

Styling is handle by [shadcn/ui](https://ui.shadcn.com/docs) which is different from the traditional component library because components aren't 'installed'
into the codebase. Instead it provides the code for components using [tailwindcss](https://tailwindcss.com/) and [headlessui](https://headlessui.com/).
The color scheme can be configured in the `global.css` file. More info can be found in the shadcn/ui [docs](https://ui.shadcn.com/docs/theming).
