const { Model } = require("../App");

class AdModel extends Model {
  static get tableName() {
    return "ads";
  }

  static relationMappings = {
    groups: {
      relation: Model.ManyToManyRelation,
      modelClass: require("./Group.model"),
      join: {
        from: "ads.id",
        through: {
          // ads_groups is the join table.
          from: "ads_groups.ad_id",
          to: "ads_groups.group_id",
        },
        to: "groups.id",
      },
    },
  };
}

module.exports = AdModel;
