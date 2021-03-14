import { Router } from "https://deno.land/x/oak/mod.ts";
import { getQuestion, getAllQuestions, getChannelSpecificQuestions, queryQuestions, postQuestion, putQuestion, deleteQuestion } from "./controllers/questions.ts";

const router = new Router();

// TODO create OpenAPI specification
router
    // Public (TODO restrict to Twitch viewers?)
    .get("/questions/all", getAllQuestions)
    .get("/questions/all/:id", getQuestion)
    .get("/questions/:channel", getChannelSpecificQuestions)
    .post("/questions/:channel/query", queryQuestions)
    // Restricted to broadcaster
    .post("/questions/:channel", postQuestion)
    .put("/questions/all/:id", putQuestion)
    .delete("/questions/all/:id", deleteQuestion);

export default router;
