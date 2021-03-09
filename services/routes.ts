import { Router } from "https://deno.land/x/oak/mod.ts";
import { getQuestion, getQuestions, postQuestion, deleteQuestion } from "./controllers/questions.ts";

const router = new Router();

router
    .get("/", (context) => {
        context.response.body = "Available endpoints: GET /question, GET /questions, POST /question, PUT /question, DELETE /question";
    })
    .get("/question/:id", getQuestion)
    .get("/questions", getQuestions)
    .post("/question", postQuestion)
    .put("/question", (context) => {
        // Not implemented
    })
    .delete("/question/:id", deleteQuestion);

export default router;