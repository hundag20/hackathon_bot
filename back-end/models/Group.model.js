const { Model } = require("objection");

class GroupModel extends Model {
  static get tableName() {
    return "groups";
  }
}

module.exports = GroupModel;
