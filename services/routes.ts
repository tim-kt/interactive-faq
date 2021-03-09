import { Router } from "https://deno.land/x/oak/mod.ts";
import getQuestions from "./controllers/questions.ts";

const router = new Router();

router
    .get("/", (context) => {
        context.response.body = "Available endpoints: GET /question, GET /questions, POST /question, PUT /question, DELETE /question";
    })
    .get("/question", (context) => {
        // Not implemented
    })
    .get("/questions", getQuestions)
    .post("/question", (context) => {
        // Not implemented
    })
    .put("/question", (context) => {
        // Not implemented
    })
    .delete("/question", (context) => {
        // Not implemented
    });

export default router;