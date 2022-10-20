const Package = require("../models/Package.model");

const myActivePackages = async (ctx) => {
  const user_id = ctx.update?.message?.from?.id;
  const actPacks = await Package.query()
    .where("user_id", "=", user_id)
    .where("status", "=", "approved")
    .where("remaining_posts", ">", 0);
  let msg = "";
  let packType = "";
  actPacks.forEach((el, i) => {
    switch (el.schedule_x) {
      case 1:
        //free trial = every 15 minutes for 1 hour
        packType = "Free trial";
        break;
      case 2:
        //daily- every half hour for 24 hours
        packType = "Daily";
        break;
      case 3:
        //24*7 = weekly- every hour
        packType = "Weekly";
        break;
      case 4:
        //24*30 = monthly- every hour
        packType = "Monthly";
        break;
      default:
        packType = "";
        break;
    }
    if (i === 0) msg = `${i + 1}. ${packType}`;
    else {
      msg = msg.concat(`\n${i + 1}. ${packType}`);
    }
  });
  const buttons = actPacks.map((el, i) => {
    return [
      {
        text: i + 1,
        callback_data: el.id,
      },
    ];
  });
  console.log(buttons);
  ctx.telegram.sendMessage(user_id, msg, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: buttons,
    },
  });
  //actionable button = regex of packageIds
};
module.exports = myActivePackages;
