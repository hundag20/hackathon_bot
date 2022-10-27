const Ad = require("../models/Ad.model");
const Group = require("../models/Group.model");
const Package = require("../models/Package.model");
const CronJob = require("cron").CronJob;

let num1 = "_1";
let num2 = "_2";
let num3 = "_3";
let num4 = "_4";

let locked = {
  [num1]: false,
  [num2]: false,
  [num3]: false,
  [num4]: false,
};

const fetchGroups = async (cat) => {
  const groups = await Group.query().where("category", "=", cat);
  return groups;
};

const postAd = async (ad, user_id) => {
  const { telegram } = require("../server");
  //based on category post to all groups asyncly
  //1. ecommerce 2. pharma 3. electronics
  let cat = 1;
  switch (ad.category) {
    case 1:
      cat = "ecommerce";
      break;
    case 1:
      cat = "pharma";
      break;
    case 1:
      cat = "electronics";
      break;
    default:
      cat = 0;
      break;
  }
  //prep msg
  const msg = `<b>${ad.title}</b>\n${ad.text_content}`;
  const photo = ad.image_content === "no-image" ? "" : ad.image_content;

  const groups = await fetchGroups(cat);
  for (el of groups) {
    try {
      if (photo) {
        await telegram.sendPhoto(el.tg_chat_id, ad.image_content, {
          parse_mode: "HTML",
          caption: msg,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `Contact Seller ↗️`,
                  url: `tg://user?id=${user_id}`,
                },
              ],
            ],
          },
        });
        return;
      }
      await telegram.sendMessage(el.tg_chat_id, msg, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: `Contact Seller ↗️`,
                url: `tg://user?id=${user_id}`,
              },
            ],
          ],
        },
      });

      //increment ad counter
      await Ad.query().update({counter: ad.counter + 1}).where('id', '=', ad.id)
      console.log("ad counter incremented");

    } catch (err) {
      console.log(err);
    }
  }
  //--daily-
  console.log("daily ads posted");
};

const updatePack = async (pack) => {
  let counter = await Package.query()
    .select("remaining_posts")
    .where("id", "=", pack.id);
  counter = counter[0].remaining_posts - 1;
  //update rem posts
  await Package.query().patchAndFetchById(pack.id, {
    remaining_posts: counter,
  });
  /*update next ad: _ads = find all pack ads(where ad.id != nextAd && ad.id > nextAd)
  if ads.length < 0 { find all ads -> det smallest -> set as nextAd }
  else {det smallest id from _ads  (FIFO) -> set as nextAd}
  */
  const _ads = await Ad.query()
    .where("package_id", "=", pack.id)
    .where("id", ">", pack.nextAd)
    .orderBy("id", "ASC");
  if (_ads.length === 0) {
    const FIFO_ad = await Ad.query()
      .where("package_id", "=", pack.id)
      .limit(1)
      .orderBy("id", "ASC");
    await Package.query().update({ nextAd: FIFO_ad[0].id });
  } else {
    const FIFO_ad = _ads[0];
    await Package.query().update({ nextAd: FIFO_ad.id });
  }
};

const cronFunc = async (x) => {
  try {
    const num = `_${x}`;
    const packages = await Package.query()
      .where("schedule_x", "=", x)
      .where("remaining_posts", ">", 0)
      .where("status", "=", "approved");
    if (packages.length > 0 && !locked[num]) {
      locked[num] = true;
      //awaitly post all ads
      for (_pack of packages) {
        const _ad = await Ad.query()
          .where("id", "=", _pack.nextAd)
          .where("package_id", "=", _pack.id);
        if (_ad.length > 0) {
          await postAd(_ad[0], _pack.user_id);
          await updatePack(_pack);
        }
      }
      locked[num] = false;
    }
  } catch (err) {
    console.log(err);
  }
};

//every 15 minutes
const freeTrialJob = new CronJob("* * * * * *", async function () {
  await cronFunc(1);
});
//every half hour
const dailyJob = new CronJob("*/30 * * * *", async function () {
  await cronFunc(2);
});
//every one hour
const weeklyJob = new CronJob("0 */1 * * *", async function () {
  await cronFunc(3);
});
//every one hour
const monthlyJob = new CronJob("0 */1 * * *", async function () {
  await cronFunc(4);
});

const job = () => {
  freeTrialJob.start();
  // dailyJob.start();
  // weeklyJob.start();
  // monthlyJob.start();
};
module.exports = job;
/*FIXME: current cron posts all ads at once on the same 30 minute intervals.
which will burry the first ads under other daily scheduled posts

DONE: prep and send ad
DONE handle real pics
DONE: update db after post
DONE: set approppriate intervals between posts
DONE: different locks for different jobs (no interferance)
DONE: allow createAds for weekly & monthly

TODO: allow createAds for free trial

BUG: [COULDN'T REPLICATE ERROR] approve/disapprove: message is not modified: specified new message content and reply markup are exactly the same
 as a current content and reply markup of the message (code breaker)(not always)
*/
