const Telegraf = require("telegraf");
const Telegram = require("telegraf/telegram");
const Extra = require("telegraf/extra");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Stage = require("telegraf/stage");
const WizardScene = require("telegraf/scenes/wizard");
const session = require("telegraf/session");
const express = require("express");
const User = require("./models/User");
const Tag = require("./models/Tag");
const { callbackButton } = require("telegraf/markup");
const expressApp = express();

dotenv.config({ path: "./config.env" });

//--setup
const options = {
  agent: null, // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
  webhookReply: false,
  polling: true, // Reply via webhook
};
const TOKEN = "1277460191:AAHSqUZS3FMpOfmtFO1IAd-4OYP5yHBGz_c";
const telegram = new Telegram(TOKEN, [options]);
const bot = new Telegraf(TOKEN);

const PORT = process.env.PORT;
const URL = process.env.URL || "https://your-heroku-app.herokuapp.com";

bot.telegram.setWebhook(`${URL}/bot${TOKEN}`);
expressApp.use(bot.webhookCallback(`/bot${TOKEN}`));

//bot.use(Telegraf.log())

bot.use((ctx, next) => {
  ctx.bot = bot;
  return next();
});

bot.request;

//MARK --mongoose
mongoose
  .connect(process.env.DATABASE_CONNECT)
  .then(() => console.log("DB connection success!"));

//MARK-- WIZARD_trackTag
const trackTag_Wizard = new WizardScene(
  "trackTag_WIZARD_SCENE_ID", // first argument is Scene_ID,
  (ctx) => {
    ctx.wizard.state.context = ctx;
    ctx.replyWithHTML(`<i>send me your tag..</i>`, {
      reply_markup: {
        force_reply: true,

        keyboard: [["/cancel ❌"]],
        resize_keyboard: true,
      },
    });
    ctx.wizard.state.reqData = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    try {
      //validate request
      if (typeof ctx.message.text === "undefined")
        return ctx.replyWithHTML(
          `<i> 🚫 wrong input try again\n (<b>example</b>: old school Vans, Black)</i>`,
          {
            reply_markup: {
              keyboard: [["/cancel ❌"]],
              resize_keyboard: true,
            },
          }
        );

      //pending: new tag: add tag to db with user
      //pending: existimng tag: add user to tag
      const message = await ctx.message.text;
      const userId = await ctx.message.from.id;

      //add user if document with the same userId doesn't exist in User collection
      const newUser = await new User({
        user: userId,
      });
      const user = await User.findOne({ userId: userId }, function (err, data) {
        if (err) console.log(`error: ${err}`);
      }).clone();
      if (!user) {
        //new
        let u = {};
        u = await User.create(newUser);
      }

      //ste3
      const tag = await Tag.findOne({ tag: message }, function (err, data) {
        if (err) console.log(`error: ${err}`);
      }).clone();
      //step 4
      //new tag
      if (!tag) {
        //new
        const userIds = new Array();
        userIds.push(userId);

        const newTag = await new Tag({
          tag: message,
          userIds: userIds,
        });

        let u = {};
        u = await Tag.create(newTag);
      } else {
        //step 5
        //tag exists
        if (tag.userIds.includes(userId)) {
          ctx.replyWithHTML(`<i>you are already tracking '${message}'</i>`);
          return ctx.scene.leave();
        } else {
          await Tag.updateOne(
            { tag: message },
            {
              $addToSet: {
                userIds: userId,
              },
            },
            function (err) {
              if (err) return console.log(`ERROR: ${err}`);
            }
          ).clone();
        }
      }

      //zis msg shld be at .thens of queries?
      ctx.replyWithHTML(
        `<i>you will recieve notification when '${message}' gets mentioned</i>`
      );
      return ctx.scene.leave();
    } catch (err) {
      console.log(err);
      return ctx.replyWithHTML(
        `<i> 🚫 wrong input try again\n (<b>example</b>: old school Vans, Black)</i>,`,
        {
          reply_markup: {
            keyboard: [["/cancel ❌"]],
            resize_keyboard: true,
          },
        }
      );
    }
  }
);

//MARK-- /register stage
const stage = new Stage([trackTag_Wizard]);

//MARK-- /start
stage.command("start", async (ctx) => {
  ctx.scene.leave(); // kill any active wizard

  const payload = ctx.message.text;

  const payArray = payload.split(" ");

  if (payArray.length > 1) {
    const payArr = payArray[1].split("_");

    try {
      const finalArray = auctionsArray.find((el) => el.msgId == payArr[1]);
      ctx.state.temp = {};
      ctx.state.temp.request = finalArray;

      if (payArr[0] === "viewOffer") {
        await ctx.scene.enter("VIEW_OFFER_WIZARD_SCENE_ID");
      } else if (payArr[0] === "makeOffer") {
        await ctx.scene.enter("MAKE_OFFER_WIZARD_SCENE_ID");
      }
    } catch (err) {
      ctx.replyWithHTML("<i>try again..</i>");
      return console.log("database connection not established yet", err);
    }
  } else {
    ctx.reply(`Welcome ${ctx.from.first_name}`, {
      reply_markup: {
        keyboard: [["/tracktag ✍️"]],
        resize_keyboard: false,
      },
    });
  }
});

//MARK-- /tracktag
stage.command("tracktag", async (ctx) => {
  ctx.scene.leave(); // kill any active wizard
  await ctx.scene.enter("trackTag_WIZARD_SCENE_ID");
});

//MARK-- /alltags
stage.command("alltags", async (ctx) => {
  ctx.scene.leave(); // kill any active wizard
  const alltags = async () => {
    const tags = await Tag.find({}, function (err, data) {
      if (err) console.log(`error: ${err}`);
    }).clone();

    console.log(tags);
  };

  alltags();
});

const callBack = async () => {
  const tags = await Tag.find({}, function (err, data) {
    if (err) console.log(`error: ${err}`);
  }).clone();
  let regStr = `${tags[0].tag}`;
  tags.forEach(async (el, index) => {
    if (index != 0) regStr += `|${el.tag}`;
  });

  //console.log(regStr);
  const reg = new RegExp(`${regStr}`, "i");
  bot.hears(reg, async (ctx) => {
    //const sender2 = '<a href="tg://user?id=${sender}">this guy</a>';
    // const message = ctx.message.text;

    const sender = ctx.from.id;
    const message = ctx.match.input;
    const group = ctx.chat.username;

    const newTags = await tags.map((el) => {
      el.tag = el.tag.toLowerCase();
      el.userIds = el.userIds;
      el.users = el.users;
      return el;
    });
    //newTags.forEach(async el => {console.log(el)});
    newTags.forEach(async (el) => {
      const notif = `tag '${el.tag}' mentioned \n by: <a href="tg://chat?id=${sender}">this guy</a> \n group: @${group} \n message: ${message}`;

      const match = ctx.match.input.toLowerCase().match(el.tag);
      if (match) {
        el.userIds.forEach(async (el) => {
          await telegram.sendMessage(el, notif, { parse_mode: "HTML" });
        });
      }
    });
  });
};
callBack();

bot.use(session());
bot.use(stage.middleware());
bot.launch();

//next dd heroku to do heroku kill
//next notif func

//pend: func to anal every group pose if checking tag string, notif attached users.
//pend: decide if tagfinder or medfinder
