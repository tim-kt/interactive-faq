import { Router } from "https://deno.land/x/oak/mod.ts";
import { getQuestion, getQuestions, queryQuestions, postQuestion, putQuestion, deleteQuestion } from "./controllers/questions.ts";

const router = new Router();

// TODO create OpenAPI specification
router
    // Public (TODO restrict to Twitch viewer?)
    .get("/question/:id", getQuestion)
    .get("/questions", getQuestions)
    .post("/questions/query", queryQuestions)
    // Restricted to broadcaster
    .post("/question", postQuestion)
    .put("/question/:id", putQuestion)
    .delete("/question/:id", deleteQuestion);

export default router;
