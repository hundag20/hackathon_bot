const Ad = require("../models/Ad.model");

const selectAd = async (ctx) => {
  const data = await ctx.update.callback_query?.data;
  const packId = data.split("_")[2];

  const ads = Ad.query().where({ package_id: packId });
  const buttons = (await ads).map((el) => {
    return [
      {
        text: `${el.title}`,
        callback_data: `edit_ad_${el.id}`,
      },
    ];
  });
  ctx.replyWithHTML(`<b>Choose Ad</b> <i>(based on their title)</i>`, {
    reply_markup: {
      parse_mode: "HTML",
      inline_keyboard: buttons,
    },
  });
};
module.exports = selectAd;
