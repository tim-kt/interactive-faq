import { Database, SQLite3Connector } from "https://deno.land/x/denodb/mod.ts";
import { RouterContext, Status } from "https://deno.land/x/oak/mod.ts";
import Question from "../models.ts";
import { verifyUser } from "../jwt_verify.ts";

const connector = new SQLite3Connector({filepath: "faq.sqlite"});
const db = new Database(connector);

db.link([Question]);
db.sync();

/**
 * Responds with the question of the given ID.
 * 
 * @param context the request's context
 */
const getQuestion = async (context: RouterContext) => {
    if (!context.params || !context.params.id) {
        context.throw(Status.BadRequest, "Bad request");
    }

    const question = await Question.find(context.params.id);
    context.response.body = JSON.stringify(question);
    context.response.type = "json";
}

/**
 * Response with a list of all questions in the database.
 * 
 * @param context the request's context
 */
const getQuestions = async (context: RouterContext) => {
    const questions = await Question.all();
    
    context.response.body = JSON.stringify(questions);
    context.response.type = "json";
}

/**
 * Queries a question based on an query string.
 * 
 * @param context the request's context
 */
const queryQuestions = async (context: RouterContext) => {
    
    if (!context.request.hasBody) {
        context.throw(Status.BadRequest, "Bad Request");
    }
    
    const query = await context.request.body().value;

    if (!query || typeof query != "string" || !query.trim()) {
        context.throw(Status.BadRequest, "Bad Request");
    }
    
    const keywords = keywordsFromString(query);
  
    let mostMatchesId = -1;
    let mostMatches = 0;

    for (const question of await Question.all()) {
        if (!question.keywords) {
            addKeywords(question);
        }

        // Create a Set from the comma separated keywords string
        const questionKeywords = new Set(String(question.keywords).split(","));

        // Generate the intersection and save the length
        const intersection = new Set([...keywords].filter(x => questionKeywords.has(x)));
        const numMatches = intersection.size;

        if (numMatches > mostMatches) {
            mostMatchesId = Number(question.id);
            mostMatches = numMatches;
        }
    }

    if (mostMatchesId == -1) {
        context.response.status = Status.NotFound;
    }
    else {
        const question = await Question.find(mostMatchesId);
        context.response.body = JSON.stringify(question);
        context.response.type = "json";
    }
}

/**
 * Creates a new question in the database with the given data
 * and generates keywords for the question.
 * 
 * @param context the request's context
 */
const postQuestion = async (context: RouterContext) => {
    if (!context.request.hasBody) {
        context.throw(Status.BadRequest);
    }

    const verification = await verifyUser(context.request.headers.get("Authorization"), "broadcaster");
    if (verification != null) {
        context.throw(verification);
    }

    const body = context.request.body();
    let question;

    if (body.type === "json") {
        // TODO verify types
        question = await Question.create(await body.value);
    }
    else if (body.type === "form-data") {
        const formData = await body.value.read();
        question = await Question.create(formData.fields);
    }
    else {
        context.throw(Status.BadRequest);
    }

    addKeywords(question);

    context.response.body = question;
    context.response.type = "json";
    context.response.status = Status.OK;
}

/**
 * Updates a question of the given ID with the given data
 * and also updates the question's keywords.
 * 
 * @param context the request's context
 */
const putQuestion = async (context: RouterContext) => {
    if (!context.params || !context.params.id) {
        context.throw(Status.BadRequest);
    }

    if (!context.request.hasBody) {
        context.throw(Status.BadRequest);
    }

    const verification = await verifyUser(context.request.headers.get("Authorization"), "broadcaster");
    if (verification != null) {
        context.throw(verification);
    }
    
    // update() on a Question retrieved with find() is different from one retrieved with where()
    const question = Question.where("id", context.params.id);

    const body = context.request.body();

    if (body.type === "json") {
        // TODO verify types
        question.update(await body.value);

    }
    else if (body.type === "form-data") {
        const formData = await body.value.read();
        question.update(formData.fields);
    }
    else {
        context.throw(Status.BadRequest);
    }
    
    // When using the already existing const question, the request never finishes...
    const updatedQuestion = await Question.find(context.params.id);

    addKeywords(updatedQuestion);

    context.response.body = updatedQuestion;
    context.response.type = "json";
    context.response.status = Status.OK;
}

/**
 * Deletes the question of the given ID.
 * 
 * @param context the request's context
 */
const deleteQuestion = async (context: RouterContext) => {
    if (!context.params || !context.params.id) {
        context.throw(Status.BadRequest);
    }

    const verification = await verifyUser(context.request.headers.get("Authorization"), "broadcaster");
    if (verification != null) {
        context.throw(verification);
    }

    await Question.deleteById(context.params.id);
    context.response.status = Status.OK;
}

/**
 * Returns keywords generated from the given String.
 * 
 * @param question 
 */
function keywordsFromString(s: string) {
    const keywords = new Set<string>();
    s.toLowerCase().split(" ").forEach(item => keywords.add(item.replace(/[^a-z]/gi,"")))
    
    return keywords;
}

// TODO manual keywords would be cool

/**
 * Adds keywords generated from the question's text
 * to its keywords field.
 * 
 * @param question 
 */
function addKeywords(question: Question) {
    if (question.question == null) {
        return;
    }
    
    const keywords = keywordsFromString(String(question.question));

    question.keywords = Array.from(keywords).join(",");
    question.update()
}

// TODO I think I can do this with functions as well (so why declare constants?)
export { getQuestion, getQuestions, queryQuestions, postQuestion, putQuestion, deleteQuestion };
