const Telegram = require("telegraf/telegram");
const { Telegraf } = require("telegraf");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const dotenv = require("dotenv");
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const { app } = require("./App");
const {
  takeQuiz_Wizard,
  takeQuiz,
} = require("./controllers/takeQuiz.controller.js");
const { User } = require("./models/User.model");
const claimPrize = require("./controllers/claimPrize.controller");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

//--setup
const options = {
  // agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false,
  polling: true, // Reply via webhook
};

const TOKEN = process.env.BOT_TOKEN;
const telegram = new Telegram(TOKEN, [options]);
const bot = new Telegraf(TOKEN);

// bot.use(Telegraf.log());
bot.use((ctx, next) => {
  ctx.bot = bot;
  ctx.telegram = telegram;

  return next();
});

const stage = new Stage([takeQuiz_Wizard]);

bot.use(session());
bot.use(stage.middleware());

const handleReferral = async (id, ctx) => {
  if (id == ctx?.from?.id) {
    return ctx.telegram.sendMessage(id,
      `‼️<b>you can't share quizes to your own account‼️</b>`, {parse_mode: 'HTML'}
    );
  }
  //add points for referee
  //update user points
  const user = await User.query().where({ telid: id });
  const points = user[0].points + 2;
  await User.query()
    .update({
      points,
    })
    .where({ telid: id });
  //notify referee
  ctx.telegram.sendMessage(id,
    `<b>you have won 2 points for sharing a quiz!🎁\n your total point is now ${points}</b>`, {parse_mode: 'HTML'}
  );
};

bot.start((ctx) => {
  ctx.scene.leave(); // kill any active wizard

  const payload = ctx.message.text;
  console.log("payload", payload);
  const refereeId = payload.split(" ")[1];
  if(refereeId)handleReferral(refereeId, ctx);
  ctx.reply(`Welcome
  /TakeAquiz
  /claimPrize
  `);
});
bot.command("TakeAquiz", takeQuiz);
bot.command("claimPrize", claimPrize);
bot.launch();
// const newAdReg = new RegExp(/^add_ad/);
// bot.action(newAdReg, enterNewAd);

module.exports = { bot, telegram };

// if (ctx.update.my_chat_member) {
//   updateGroups([ctx.update]);
// }
// const packIdReg = new RegExp(/^[0-9].+$/);
// bot.action(packIdReg, selectPackage);
// const editAdReg = new RegExp(/^edit_ad/);
// bot.action(editAdReg, editAd);
// const viewSatusReg = new RegExp(/^view_status/);
// bot.action(viewSatusReg, viewStatus);
// const selectAdRef = new RegExp(/^select_ad/);
// bot.action(selectAdRef, selectAd);
// bot.launch()

/*
DONE: let owner choose group category before/after adding group
DONE: (create field for and) calculate remaining amount of posts for an ad based on its schedule.
recalculate after each post
DONE: create differet cron-job poster functions for all types of packages (or 1 func but different args) 

BUG: group update not updating group removal after program restarting

group-add final fixes
DONE: enter account only if owner hasn't entered account before
DONE: add prompt on regGroup- (if you already added then pls remove and add again)
DONE: add prompt telling user that adder should be owner / admin can't
DONE: check if adder is bot- if so, mark group as regdByAdmin and don't send reply groupAddedByNonOwner()

general
TODO: validate response on each wizard step
TODO: have a fallback for error messages
TODO: in final clean up..edit all inline buttons into texts after choice
TODO: use logger
TODO: for (try again) type buttons...edit previous msg instead of sending new button
TODO: add return/back button in addition to cancel\
TODO: fix firstPostedAt & lastPostedAt
TODO: allow to add more than one pic (add pic, done options)

features
TODO: edit ads
TODO: see ads status 
- x total posts (in y total ${cat} groups between z intervals)
- x number of posts remaining
TODO: (credibility feature) see customers list along with their tot number of posts nd usernames
TODO: (category type) 1 mill + groups (tikvah + others) (thier markup + mine)

NOTE: remove schdeule_y or daily_posts from everywhere-- that is outdated..only schedule_x is in use

NOTE: new model: 1 package -> many ads. daily = upto 48 diff ads (will cycle between ads)

NOTE: [include more ads][finish] button also available on freeTrial- but clicking 

ad,
package,

package = {
  id
  user_id
  schedule = 1,2,3,4
  remaining_posts
  status
  referral
  transNum
}
ads = {
  ...
package_id
}

how many separate ads do you want to use
(limit 48)(only mention when reached)
(you can edit, remove or add more ads later)


//after adPosted

Do you want to include another Ad?
(you can edit, remove or add more ads later)

[Include another Ad][finish]



if(package === 2)
postNextAd(packageId)

postNextAd(packageId) {
const pack = Package.query().findById(packageId)
const nextAd = Ad.query().findById(pack.nextAd)
await postAd(nextAd);
await cyclePackage(packageId);
}
*/
