const Telegram = require("telegraf/telegram");
const { Telegraf } = require("telegraf");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const dotenv = require("dotenv");

// const app = require("./App");
const { updateGroups } = require("./controllers/owner.controller");
const {
  createAdController,
  createAd_Wizard,
} = require("./controllers/createAd.controller");
const {
  regGroupController,
  regGroup_Wizard,
} = require("./controllers/regGroup.controller");
const { app } = require("./App");
const { adminMenuController } = require("./controllers/adminMenu.controller");
const {
  verifyPaysController,
  verifyPays_Wizard,
} = require("./controllers/verifyPays.controller");

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

// bot.use(Telegraf.log());
let i = 0;
bot.use((ctx, next) => {
  ctx.bot = bot;
  ctx.telegram = telegram;
  if (ctx.update.my_chat_member) {
    updateGroups([ctx.update]);
  }
  return next();
});

const stage = new Stage([createAd_Wizard, regGroup_Wizard, verifyPays_Wizard]);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
  ctx.reply(`Welcome
  /createAd
  /checkStatus
  `);
});
bot.command("createAd", createAdController);
bot.command("registerGroup", regGroupController);
bot.command("adminMenu", adminMenuController);
bot.command("listenForVerifyReqs", verifyPaysController);

// bot.command("verifyPay", adminController);
// bot.command("checkStatus", (ctx) => createAdController(ctx));
// bot.request;
bot.launch();

// Enable graceful stop
// process.once("SIGINT", () => bot.stop("SIGINT"));
// process.once("SIGTERM", () => bot.stop("SIGTERM"));

module.exports = bot;
