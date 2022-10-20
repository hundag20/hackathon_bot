const { Model } = require("../App");
const KnexInstance = require("../utils/knexInstance");
class UserModel extends Model {
  static get tableName() {
    return "users";
  }
}

const useFreeTrail = async (userId) => {
  const user = await UserModel.query().findById(userId);
  await UserModel.query().findById(userId).patch({
    free_used: true,
  });
};

const checkIfFreeUsed = async (userId) => {
  const user = await UserModel.query().findById(userId);

  if (user && user.free_used == false) {
    return false;
  } else if (user && user.free_used == true) {
    return true;
  } else {
    await UserModel.query().insert({ id: userId });
    return false;
  }
};

module.exports = { User: UserModel, checkIfFreeUsed, useFreeTrail };
