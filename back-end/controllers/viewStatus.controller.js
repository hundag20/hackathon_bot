const Package = require("../models/Package.model");

const viewStatus = async (ctx) => {
  const data = await ctx.update.callback_query?.data;
  const packId = data.split("_")[2];

  const pack = await Package.query().findById(packId);
  const rep = {
    package: "type + purchase date",
    total_posts_made_per_group: "x",
    total_posts_rem_per_group: "y",
    Ad_1: {
      title: "title",
      posts_made_per_group: "x",
      average_View_count: "y" /*
      (tot view for all ad.id posts in group A) + (tot view for all ad.id posts in group B) / x
      where x = number of ad.id posts in group A (num of ad.id posts z same in all groups)
      */,
    },
  };
  const report = ``;
};
module.exports = viewStatus;
