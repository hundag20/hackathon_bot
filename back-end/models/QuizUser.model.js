const { Model } = require("../App");
const KnexInstance = require("../utils/knexInstance");
class QuizUser extends Model {
  static get tableName() {
    return "quizs_users";
  }
}


module.exports = { QuizUser: QuizUser};
