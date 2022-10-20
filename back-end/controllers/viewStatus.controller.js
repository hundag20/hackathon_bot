const Package = require("../models/Package.model");

const editAd = async (ctx) => {
  const data = await ctx.update.callback_query?.data;
  const packId = data.split("_")[2];

  const pack = await Package.query().findById(packId);
  const rep = {
    package: "type + purchase date",
    total_posts_made: "x",
    total_posts_rem: "y",
    Ad_1: {
      title: "title",
    },
  };
  const report = ``;
};
module.exports = editAd;
