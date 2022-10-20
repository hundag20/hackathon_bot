const { Model } = require("../App");

class PackageModel extends Model {
  static get tableName() {
    return "packages";
  }
}

module.exports = PackageModel;
