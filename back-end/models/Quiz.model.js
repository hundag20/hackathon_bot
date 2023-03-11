const { Model } = require("../App");
const KnexInstance = require("../utils/knexInstance");
class QuizModel extends Model {
  static get tableName() {
    return "quizs";
  }
}


module.exports = { quiz: QuizModel};
