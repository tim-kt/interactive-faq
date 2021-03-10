import { parse } from "https://deno.land/std/flags/mod.ts";
import { bold, red } from "https://deno.land/std/fmt/colors.ts";
import { Base64 } from "https://deno.land/x/bb64/mod.ts";
import { decode, validate } from "https://deno.land/x/djwt/mod.ts";
import { verify } from "https://deno.land/x/djwt/signature.ts";
import { Status, ErrorStatus } from "https://deno.land/x/oak/mod.ts";


const args = parse(Deno.args);

if (!args.s) {
    console.log(bold(red("No JWT Secret provided (-s argument).")));
    console.log(bold(red("Restricted routes will not be accessible.")));
}

const secret = args.s ? Base64.fromBase64String(args.s).toString() : "NOT A REAL SECRET";

/**
 * Verifies a JWT from an Authorization header and checks if the payload's
 * role value is equal to the given requiredRole string.
 * 
 * Things can go wrong. The function returns an ErrorStatus that can be 
 * directly thrown. The following error cases are covered:
 *  - No JWT secret has been provided when starting the server -> 503
 *  - The Authorization header is empty or not correctly formatted -> 403
 *  - The JWT is valid but the role does not match the required role -> 403
 *  - The JWT is invalid -> 403
 * 
 * If and only if none of these things occur, null is returned.
 * 
 * @param bearer Authorization header that follows the Bearer scheme and contains a JWT 
 * @param requiredRole the role that the user needs to access some content
 * @returns an ErrorStatus in case of an error or null if everything goes well
 */
export async function verifyUser(bearer: string | null, requiredRole: string): Promise<ErrorStatus | null> {
    if (secret == "NOT A REAL SECRET") {
        return Status.ServiceUnavailable;
    }

    if (!bearer || !bearer.trim() || !bearer.startsWith("Bearer ")) {
        console.log("Invalid format");
        return Status.Forbidden;
    }

    const jwt = bearer.substr(7);

    try {
        // For some reason I can't use the high-level API verify() from djwt/mod.ts
        // as that will always give me the error "The jwt's signature does not match the verification signature."
        const { header, payload, signature } = validate(decode(jwt));
        await verify({
            signature: signature,
            key: secret,
            algorithm: header.alg,
            signingInput: jwt.slice(0, jwt.lastIndexOf(".")),
        });

        if (payload.role == requiredRole) {
            return null;
        }
        else {
            console.log("Invalid user role");
            return Status.Forbidden;
        }
    }
    catch(e) {
        console.log("Invalid JWT: " + e.message);
        return Status.Forbidden;
    }
}
