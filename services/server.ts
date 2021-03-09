import { 
    Application,
    Router
} from "https://deno.land/x/oak/mod.ts";

import {
    bold,
    yellow,
} from "https://deno.land/std@0.84.0/fmt/colors.ts";

import router from "./routes.ts";

const app = new Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener("listen", ({ hostname, port}) => {
    console.log(bold("Server running on ") + yellow(`${hostname}:${port}`));
})

await app.listen({ hostname: "localhost", port: 8000});
