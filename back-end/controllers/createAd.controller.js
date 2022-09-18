const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const { checkIfFreeUsed } = require("../models/User.model");
const Owner = require("../models/Owner.model");
const { handleNewRequest } = require("./verifyPays.controller");
const { ADMINS } = require("./adminMenu.controller");

const referralIsValid = async (ref) => {
  try {
    //here: check whether owner exists only
    /* another validation at another place: check if owner mentioned as
    referral for an Ad is still associated with atleast 1 group */
    const owner = await Owner.query().findById(ref);
    if (owner) return true;
    else return false;
  } catch (err) {}
};
const transIsValid = async (num) => {
  return true;
};
const DAILY_POSTS = 15;
const QR_FILE_ID =
  "AgACAgQAAxkBAAIVrGMRogjezhfX9jZTi_PP6vEuTc62AAIBuzEb9JSIUMK236B6EnHxAQADAgADbQADKQQ";

//MARK-- WIZARD_createAd
const createAd_Wizard = new WizardScene(
  "createAd_WIZARD_SCENE_ID", // first argument is Scene_ID,
  //choose package
  (ctx) => {
    ctx.wizard.state.context = ctx;
    ctx.replyWithHTML(
      `<i>Choose a package</i>`,
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton(`Free trial🎁`, `1`),
          m.callbackButton("Daily", `2`),
          m.callbackButton("weekly", `3`),
          m.callbackButton("monthly", `4`),
        ])
      )
    );

    ctx.wizard.state.adData = {};
    ctx.wizard.state.adData.schedule = {};
    return ctx.wizard.next();
  },
  //choose category
  async (ctx) => {
    const data = ctx.update.callback_query?.data;
    if (data == 1) {
      const free_used = await checkIfFreeUsed(ctx.from.id);
      if (free_used) {
        ctx.replyWithHTML(
          "<b>You have used your free trial!</b>",
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([m.callbackButton(`choose another package`, `1`)])
          )
        );
        return ctx.wizard.back();
      }
    } else if (data) {
      //x- weekly/monthly
      //y- num of posts in a day
      ctx.wizard.state.adData.schedule.x = data;
      ctx.wizard.state.adData.schedule.y = DAILY_POSTS;
      const groupCatStats = {
        ecommerce: 12,
        pharma: 24,
        electronics: 32,
      };
      ctx.replyWithHTML(
        `<b>Choose the appropriate category of groups for your Ad </b>
      👉🏿 1. ecommerce (${groupCatStats.ecommerce} groups)
      👉🏿 2. pharma (${groupCatStats.pharma} groups)
      👉🏿 3. electronics (${groupCatStats.electronics} groups)
      `,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([
            m.callbackButton(`1`, `1`),
            m.callbackButton(`2`, `2`),
            m.callbackButton(`3`, `3`),
          ])
        ),
        {
          parse_mode: "HTML",
          reply_markup: {
            forceReply: true,
          },
        }
      );
      return ctx.wizard.next();
    }
  },
  //enter title
  async (ctx) => {
    try {
      const cat = ctx.update.callback_query?.data;
      ctx.wizard.state.adData.category = cat;
      ctx.replyWithHTML("<b>Enter title of your Ad </b>");
      return ctx.wizard.next();
    } catch (er) {}
  },
  //enter description
  async (ctx) => {
    try {
      const text = ctx.update.message.text;
      ctx.wizard.state.adData.text = text;
      ctx.replyWithHTML("<b>Now enter the discription or body of your Ad </b>");
      return ctx.wizard.next();
    } catch (er) {}
  },
  //enter picture (optional)
  async (ctx) => {
    try {
      const desc = ctx.update.message.text;
      if (!desc) throw "some error";
      ctx.wizard.state.adData.desc = desc;
      ctx.replyWithHTML(
        "<b>Now enter a picture for your Ad </b>",
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([m.callbackButton(`skip`, `skip`)])
        )
      );
      return ctx.wizard.next();
    } catch (er) {}
  },
  //enter contact username
  async (ctx) => {
    const skip = ctx.update.callback_query?.data;
    const photo = ctx.update.message?.photo;
    const pic_id = photo ? photo[0]?.file_id : "";
    if (skip) {
      ctx.editMessageText(
        `<b>Last step, enter a contact username (eg. @timshel)</b>`,
        {
          parse_mode: "HTML",
          reply_markup: {
            forceReply: true,
          },
        }
      );
      return ctx.wizard.next();
    } else if (pic_id) {
      ctx.wizard.state.adData.desc = pic_id;
      ctx.replyWithHTML(
        `<b>Last step, enter a contact username (eg. @timshel)</b>`
      );
    }
  },
  //enter referral
  async (ctx) => {
    try {
      const uname = ctx.update.message?.text;
      ctx.wizard.state.adData.uname = uname;
      ctx.replyWithHTML("<b>Now enter a referral number</b>");
      return ctx.wizard.next();
    } catch (er) {}
  },
  //enter transaction number
  async (ctx) => {
    try {
      const referral = ctx.update.message?.text;
      if (await referralIsValid(referral)) {
        ctx.wizard.state.adData.referral = referral;
        ctx.replyWithPhoto(QR_FILE_ID, {
          caption:
            "<b>Final step</b>: Scan this QR code on telebirr to complete payment (1500 ETB)\nEnter the transaction number here when you are done.",
          parse_mode: "HTML",
        });
        return ctx.wizard.next();
      } else {
        ctx.replyWithHTML(
          "<b>you entered an invalid referral number!</b>",
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([m.callbackButton(`try again`, `1`)])
          )
        );
        return ctx.wizard.back();
      }
    } catch (er) {}
  },
  //done
  async (ctx) => {
    try {
      const transNum = ctx.update.message?.text;
      if (transNum && transIsValid(transNum)) {
        ctx.wizard.state.adData.transNum = transNum;
        //Notify admin at this point
        ctx.replyWithHTML(
          "<b>Done!</b>\nwe will notify you soon after verifying the payment."
        );
        // handleNewRequest("someshit");
        ctx.scene.leave();
        return ctx.telegram.sendMessage(
          ADMINS[0],
          `verify new request: ${transNum}`,
          {
            parse_mode: "HTML",
            reply_markup: {
              keyboard: [[{ text: `/listenForVerifyReqs ${transNum}` }]],
              one_time_keyboard: true,
            },
          }
        );
        //save in db
        //tell wizard to access DB (if you tell u can also pass values)
        // return ctx.scene.enter("verifyPay_WIZARD_SCENE_ID");
      } else {
        ctx.replyWithHTML(
          "<b>you entered an invalid transaction number!</b>",
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([m.callbackButton(`try again`, `1`)])
          )
        );
        return ctx.wizard.back();
      }
    } catch (er) {
      console.log(er);
    }
  }
);
const createAdController = async (ctx) => {
  await ctx.scene.enter("createAd_WIZARD_SCENE_ID");
};

module.exports = { createAd_Wizard, createAdController };
//DONE: validating referral id
//DONE: send QR code for completing payment
//TODO: send verify button for admin(☑️ X)
//TODO: update ad db to track ads based on counter rather than date
//TODO: validate response on each wizard step
//TODO: have a fqllback for error messages
