import { createRouteHandler } from "uploadthing/next-legacy";

import { ourFileRouter } from "~/server/api/uploadthing";

export default createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
