# Software Systems Student Society Merch Store

## Welcome

Welcome to the Software Systems Student Society (SSSS) merch store repo. This project is maintained by the website committee.

To join the committee, go to the [SSSS Discord server](https://discord.gg/XZUd7amxPq), find the `#what-are-committees`, and claim the `@website` role.

View the live site here: https://merch.sfussss.org/

The application is deployed on Vercel with a serverless PostgreSQL database hosted on Neon.tech, and uses Vercel Cron Jobs to delete unprocessed orders.

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## How to run

Create a `.env` file with the contents of `.env.example`.

Now you'll need to create an [uploadthing](https://uploadthing.com) account, create a project, and generate a key. Replace the value of `UPLOADTHING_TOKEN` in the `.env` with the generated key.

(Optional to see confirmation emails)
Now you'll need to create a [Resend](https://resend.com) account, create a project, and generate an API key. Add the API key to your `.env` file as `RESEND_API_KEY` and set `DEV_EMAIL_RECIPIENT` to your email address to receive them. DEV mode will only send emails to your the email address you set.

Open a terminal window and run `docker compose up` to start the db container.

Sync the prisma schema with db and seed the database (Only for the first time):

```
npx prisma db push
npm run db-seed
```

Open another terminal window and run `npm run dev` to start the dev server.

## Cart Implementation

The cart is currently stored in memory using a state library called [jotai](https://jotai.org/). Jotai has
some [documentation](https://jotai.org/docs/guides/persistence) on how to make it persistent in local storage. Currently it is persistent in session storage.

The implementation for the store is done all in the frontend in the file `cartStore.ts`.

## Admin Dashboard

The dashboard can be access through `/dashboard` in the url bar. Can only be accessed through logging in to an admin account, SFU accounts do yet have access to the dashboard as of right now.

### Changing the admin credentials

There is one admin user that will be added when the database is seeded initially. To change the credentials, update the
`.env` file by changing `ADMIN_USERNAME` and `ADMIN_PASSWORD` and run `npm run db-seed`.

Note: This wipe the database.

If you want to update the credentials without resetting the database, you would have to modify the username and password directly.
One way to do that is to use prisma studio's UI.

Open a new terminal and run npx prisma studio. Modify the username.

Modifying the password is a bit more tricky since you would have to generate the hashed password using a site like [bcrypt generator](https://bcrypt-generator.com/) and
update the passowrd in the db with the hashed password.

### Adding additional logic for authorization/authentication

Authentication is handled by a library called [NextAuth](https://next-auth.js.org/). The login logic can be found in the file `auth.ts`.

SFU Authentication is done through [SFU CAS](https://www.sfu.ca/information-systems/services/cas/cas-for-web-applications/), which provides the user with a CAS ticket, and validates it against SFU's CAS via an XML document. If ticket is valid, extract the id and email to a JWT, creating basic SFU auth for app.

### Sending emails for order confirmation and status updates

Emails are sent through Resend, with logic implemented in `/server/servers/emailservice.ts`.

Confirmation emails are sent when a user places an order and when their order status is changed.

### Stale Order Cancellation

Orders that are not processed within a week are automatically cancelled. This is done through a cron job that runs every 24 hours. The cron job is implemented in `/vercel.json` and the api route it calls is located at `/src/parges/api/cron/cancel-orders.ts`. You can test the api route by running `curl -X POST http://localhost:3000/api/cron/cancel-orders -H "x-api-key: API_KEY"`.

## Frontend Backend communication

Refer to the create t3 [docs](https://create.t3.gg/en/usage/trpc).

## Styling

Styling is handle by [shadcn/ui](https://ui.shadcn.com/docs) which is different from the traditional component library because components aren't 'installed'
into the codebase. Instead it provides the code for components using [tailwindcss](https://tailwindcss.com/) and [headlessui](https://headlessui.com/).
The color scheme can be configured in the `global.css` file. More info can be found in the shadcn/ui [docs](https://ui.shadcn.com/docs/theming).
