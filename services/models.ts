import { 
    Model, 
    DataTypes 
} from "https://deno.land/x/denodb/mod.ts";

class Question extends Model {
    static table = "questions";

    static fields = {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        question: DataTypes.STRING,
        answer: DataTypes.STRING,
        text: DataTypes.TEXT,
        keywords: DataTypes.TEXT,
        channel: DataTypes.STRING,
    }
}

export default Question;
