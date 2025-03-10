import { type GetServerSideProps } from "next";
import { getServerAuthSession } from "~/server/auth";

export const getServerSideProps: GetServerSideProps<object> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  if (!session) {
    return {
      redirect: {
        destination: `/api/auth/signin/?callbackUrl=${
          ctx.req.url ?? "/dashboard"
        }`,
        permanent: false,
      },
    };
  }
  if (session.user.email?.endsWith("@sfu.ca")) {
    return {
      redirect: {
        destination: `/auth/error`,
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
