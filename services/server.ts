import { parse } from "https://deno.land/std/flags/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";
import { oakCors } from "https://deno.land/x/cors/mod.ts";
import { bold, green, cyan, yellow, red, gray } from "https://deno.land/std/fmt/colors.ts";

import router from "./routes.ts";

const app = new Application();

app.use(oakCors());

// Logger
app.use(async (ctx, next) => {
    await next();
    const date = new Date();
    const rt = ctx.response.headers.get("X-Response-Time");
    console.log(
      `${gray(date.toLocaleString())} - ${green(ctx.request.method)} ${cyan(ctx.request.url.pathname)} - ${bold(String(rt))}`,
    );
});

// Timing
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

app.use(router.allowedMethods());
app.use(router.routes());

const args = parse(Deno.args);

if (!args.c || !args.k) {
    console.log(bold(red("Paths to TLS certificate (-c argument) and/or key (-k argument) not provided.")));
    console.log(bold(red("Traffic will not be encrypted.\n")));

    app.addEventListener("listen", ({ hostname, port}) => {
        console.log(bold("Server running on ") + yellow(`${hostname}:${port}`));
    })

    await app.listen({ 
        hostname: "0.0.0.0", 
        port: 80,
    });
}
else {
    app.addEventListener("listen", ({ hostname, port}) => {
        console.log(bold(green("Encrypted") + " server running on ") + yellow(`${hostname}:${port}`));
    })

    await app.listen({ 
        hostname: "0.0.0.0", 
        port: 443,
        secure: true,
        certFile: args.c,
        keyFile: args.k,
    });
}
