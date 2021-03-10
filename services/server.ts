import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { bold, yellow } from "https://deno.land/std@0.84.0/fmt/colors.ts";

import router from "./routes.ts";

const app = new Application();

app.use(oakCors());
app.use(router.allowedMethods());
app.use(router.routes());

app.addEventListener("listen", ({ hostname, port}) => {
    console.log(bold("Server running on ") + yellow(`${hostname}:${port}`));
})

await app.listen({ hostname: "localhost", port: 8000});