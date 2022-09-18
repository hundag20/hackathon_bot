const { Model } = require("../App");

class OwnerModel extends Model {
  static get tableName() {
    return "owners";
  }

  static relationMappings = {
    groups: {
      relation: Model.ManyToManyRelation,
      modelClass: require("./Group.model"),
      join: {
        from: "owners.id",
        through: {
          // owners_groups is the join table.
          from: "owners_groups.owner_id",
          to: "owners_groups.group_id",
          extra: ["update_id"],
        },
        to: "groups.tg_chat_id",
      },
    },
  };
}

module.exports = OwnerModel;
