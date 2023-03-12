const { Model } = require("../App");
const KnexInstance = require("../utils/knexInstance");
class CouponModel extends Model {
  static get tableName() {
    return "coupons";
  }
}


module.exports = { Coupon: CouponModel};
