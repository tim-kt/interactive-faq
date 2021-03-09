import { Database, SQLite3Connector } from "https://deno.land/x/denodb/mod.ts";
import Question from "../models.ts";
import { RouterContext } from "https://deno.land/x/oak/mod.ts";

const connector = new SQLite3Connector({filepath: "services/faq.sqlite"});
const db = new Database(connector);

db.link([Question]);
db.sync();

const getQuestions = async (context: RouterContext) => {
    const questions = await Question.all();
    context.response.body = JSON.stringify(questions);
}

export default getQuestions;