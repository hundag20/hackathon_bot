const { chooseCat } = require("./createAd.controller");
const Extra = require("telegraf/extra");
const WizardScene = require("telegraf/scenes/wizard");
const Ad = require("../models/Ad.model");

let packId = "";

const pushAd = async (adObj) => {
  await Ad.query().insert({
    package_id: packId,
    category: adObj.category,
    title: adObj.text,
    text_content: adObj.desc,
    imgage_content: adObj.pic_id,
  });
};

//MARK-- WIZARD_newAd
const newAd_Wizard = new WizardScene(
  "newAd_WIZARD_SCENE_ID", // first argument is Scene_ID,

  //B. choose category
  async (ctx) => {
    ctx.wizard.state.adData = {};
    await chooseCat(ctx);
    return ctx.wizard.next();
  },
  //C. enter title
  async (ctx) => {
    try {
      const cat = ctx.update.callback_query?.data;
      ctx.wizard.state.adData.poster_id = ctx.update?.callback_query?.from?.id;
      ctx.wizard.state.adData.category = cat;
      ctx.replyWithHTML("<b>Enter title of your Ad </b>");

      return ctx.wizard.next();
    } catch (er) {}
  },
  //D. enter description
  async (ctx) => {
    try {
      const text = ctx.update.message.text;
      ctx.wizard.state.adData.text = text;
      ctx.replyWithHTML("<b>Now enter the discription or body of your Ad </b>");

      return ctx.wizard.next();
    } catch (er) {}
  },
  //E. enter picture (optional)
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
    } catch (err) {
      console.log(err);
    }
  },
  //G. enter more ads | finish
  async (ctx) => {
    const skip = ctx.update.callback_query?.data;
    const photo = ctx.update.message?.photo;
    const pic_id = photo ? photo[0]?.file_id : "";
    if (skip) {
      await pushAd(ctx.wizard.state.adData);
      ctx.editMessageText(
        `<i>Do you want to include another Ad?</i>`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([
            m.callbackButton(`Include another Ad`, `a`),
            m.callbackButton("finish", `b`),
          ])
        )
      );

      return ctx.wizard.next();
    } else if (pic_id) {
      ctx.wizard.state.adData.pic_id = pic_id;
      await pushAd(ctx.wizard.state.adData);
      ctx.replyWithHTML(
        `<i>Do you want to include another Ad?</i>`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard([
            m.callbackButton(`Include another Ad`, `a`),
            m.callbackButton("finish", `b`),
          ])
        )
      );

      return ctx.wizard.next();
    }
  },
  //H. Done
  async (ctx) => {
    try {
      const data = ctx.update.callback_query?.data;
      if (data) {
        if (data == "a") {
          return ctx.scene.enter("newAd_WIZARD_SCENE_ID");
        } else {
          ctx.replyWithHTML("<b>Done! </b>");
          return ctx.scene.leave();
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
);

const enterNewAd = async (ctx) => {
  const data = await ctx.update.callback_query?.data;
  packId = data.split("_")[2];
  //enter into wizard
  await ctx.scene.enter("newAd_WIZARD_SCENE_ID");
};
module.exports = { enterNewAd, newAd_Wizard };
