const { Coupon } = require("../models/Coupon.model");
const { User } = require("../models/User.model");
const voucher_codes = require('voucher-code-generator');

const userHasEnoughPoints = async(id) => {
    const user = await User.query().findOne({telid: id});
    return { remaining: user? 10 - user.points : user,
        true: (user && user.points >=10 )?  true : false
    };
}
const claimPrize = async (ctx) => {
   //check if user has enough points
   const pointChecker = await userHasEnoughPoints(ctx.from?.id)
   if(pointChecker.true){
   //get one-time coupon or generate if it doesn't exist
   let coupon = {}
   coupon = await Coupon.query().findOne({user_id: ctx.from?.id, status: 'unused'});
   if(!coupon){
    const coup = voucher_codes.generate({
        length: 8,
        count: 1,
        charset: voucher_codes.charset("alphanumeric")
    });
    coupon = await Coupon.query().insert({user_id: ctx.from?.id, key: coup[0]})
}
   ctx.replyWithHTML(
    `<b>Here is your coupon key —- <i>${coupon.key}</i> -— Visit the official Ethio-Telecom's website to get access to dicounted packages ☺️</b>`
  );

   }else{
    ctx.replyWithHTML(
        `<b>you need ${Math.round(pointChecker.remaining * 100) / 100 } more Points to get your reward ☺️</b>`
      );
   }
  };
  module.exports = claimPrize