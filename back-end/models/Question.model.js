const { Model } = require("../App");
const KnexInstance = require("../utils/knexInstance");
class QuestionModel extends Model {
  static get tableName() {
    return "questions";
  }
}


module.exports = { Question: QuestionModel};
