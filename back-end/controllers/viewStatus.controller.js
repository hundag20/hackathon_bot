const { default: axios } = require("axios");
const Ad = require("../models/Ad.model");
const Package = require("../models/Package.model");

const viewStatus = async (ctx) => {
  try {
    const data = await ctx.update.callback_query?.data;
    const packId = data.split("_")[2];

    let report = {};
    const pack = await Package.query().findById(packId);
    const ads = await Ad.query().where({ package_id: pack.id });

    let type = 0,
      init;
    switch (Number(pack.schedule_x)) {
      case 1:
        //free trial = every 15 minutes for 1 hour
        type = "free trial";
        init = 4;
        break;
      case 2:
        //daily- every half hour for 24 hours
        rem = "Daily";
        init = 48;
        break;
      case 3:
        //24*7 = weekly- every hour
        rem = "Weekly";
        init = 168;
        break;
      case 4:
        //24*30 = monthly- every hour
        rem = "Monthly";
        init = 720;
        break;
      default:
        rem = 0;
        break;
    }
    report.packtype = type;
    report.totposted = init - pack.remaining_posts;
    report.remposts = pack.remaining_posts;
    report.ads = [];
    for (el of ads) {
      report.ads.push({
        title: el.title,
        totposted: el.counter,
      });
    }
    let adsRep = ``;
    report.ads.forEach((el, i) => {
      adsRep = adsRep.concat(
        adsRep,
        `<b>Ad ${i + 1}: {\ntitle:</b> ${el.title}\n<b>total posts made: </b>${
          el.totposted
        }\n}\n`
      );
    });
    console.log("adsrep: ", adsRep);
    report = `<b>Package Type: ${report.packtype}</b>\n<b>Total posts made per single group: ${report.totposted}</b>\n<b>Remaining posts per group: ${report.remposts}</b>\n
    ${adsRep}
    `;
    ctx.replyWithHTML(report);
  } catch (err) {
    console.log(err);
  }
};
module.exports = viewStatus;

// const rep = {
//   package: "type"
//  // package: "purchase date",
//   total_posts_made_per_group: "x",
//   total_posts_rem_per_group: "y",
//   Ad_1: {
//     title: "title",
//     posts_made_per_group: "x",
//     // average_View_count: "y"
//     /*
//     (tot view for all ad.id posts in group A) + (tot view for all ad.id posts in group B) / x
//     where x = number of ad.id posts in group A (num of ad.id posts z same in all groups)
//     */
//   },
// };
