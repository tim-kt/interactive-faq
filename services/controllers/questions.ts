import { Database, SQLite3Connector } from "https://deno.land/x/denodb/mod.ts";
import Question from "../models.ts";
import { RouterContext, Status } from "https://deno.land/x/oak/mod.ts";

const connector = new SQLite3Connector({filepath: "services/faq.sqlite"});
const db = new Database(connector);

db.link([Question]);
db.sync();

const getQuestion = async (context: RouterContext) => {
    if (!context.params || !context.params.id) {
        context.throw(Status.BadRequest, "Bad request (No id given)");
    }

    const question = await Question.find(context.params.id);
    context.response.body = JSON.stringify(question);
    context.response.type = "json";
}

const getQuestions = async (context: RouterContext) => {
    const questions = await Question.all();
    context.response.body = JSON.stringify(questions);
    context.response.type = "json";
}

const postQuestion = async (context: RouterContext) => {
    if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request (No request body)");
    }

    const body = context.request.body();
    if (body.type === "json") {
        // TODO verify types
        await Question.create(await body.value);
    }
    else if (body.type === "form-data") {
        const formData = await body.value.read();
        await Question.create(formData.fields);
    }
    else {
        context.throw(Status.BadRequest, "Bad request (Format must be JSON or form-data)");
    }

    context.response.status = Status.OK;
}

const deleteQuestion = async (context: RouterContext) => {
    if (!context.params || !context.params.id) {
        context.throw(Status.BadRequest, "Bad request (No id given)");
    }

    await Question.deleteById(context.params.id);
    context.response.status = Status.OK;
}

export { getQuestion, getQuestions, postQuestion, deleteQuestion };