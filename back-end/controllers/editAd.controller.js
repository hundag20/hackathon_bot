const { chooseCat } = require("./createAd.controller");
const Extra = require("telegraf/extra");
const WizardScene = require("telegraf/scenes/wizard");

//TODO: const pushAd
//TODO: make skip next work

//MARK-- WIZARD_newAd
const editAd_Wizard = new WizardScene(
  "editAd_WIZARD_SCENE_ID", // first argument is Scene_ID,

  //A. change ad category yes|skip
  async (ctx) => {
    ctx.wizard.state.adData = {};
    ctx.replyWithHTML(
      "<b>Change ad category</b>",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton(`Yes`, `1`),
          m.callbackButton(`No, skip`, `2`),
        ])
      )
    );
    return ctx.wizard.next();
  },
  //B. change ad catgory
  async (ctx) => {
    const toSkip = ctx.update.callback_query?.data;
    if (toSkip == 1) {
      await chooseCat(ctx);
      return ctx.wizard.next();
    } else if (toSkip == 2) {
    }
  },
  //C. change ad title yes|skip
  async (ctx) => {
    const cat = ctx.update.callback_query?.data;
    ctx.wizard.state.adData.poster_id = ctx.update?.callback_query?.from?.id;
    ctx.wizard.state.adData.category = cat;
    ctx.replyWithHTML(
      "<b>Change ad title</b>",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton(`Yes`, `1`),
          m.callbackButton(`No, skip`, `2`),
        ])
      )
    );
    return ctx.wizard.next();
  },
  //D. enter title
  async (ctx) => {
    try {
      const toSkip = ctx.update.callback_query?.data;
      if (toSkip == 1) {
        ctx.replyWithHTML("<b>Enter title of your Ad </b>");

        return ctx.wizard.next();
      } else if (toSkip == 2) {
      }
    } catch (er) {}
  },
  //E. change ad Description yes|skip
  async (ctx) => {
    const text = ctx.update.message.text;
    ctx.wizard.state.adData.title = text;
    ctx.replyWithHTML(
      "<b>Change ad Description</b>",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton(`Yes`, `1`),
          m.callbackButton(`No, skip`, `2`),
        ])
      )
    );
    return ctx.wizard.next();
  },
  //F. enter description
  async (ctx) => {
    try {
      const toSkip = ctx.update.callback_query?.data;
      if (toSkip == 1) {
        ctx.replyWithHTML("<b>enter the discription or body of your Ad </b>");

        return ctx.wizard.next();
      } else if (toSkip == 2) {
      }
    } catch (er) {}
  },
  //G. change ad picture(s) yes|skip
  async (ctx) => {
    const desc = ctx.update.message.text;
    if (!desc) throw "some error";
    ctx.wizard.state.adData.desc = desc;
    ctx.replyWithHTML(
      "<b>Change ad picture(s)</b>",
      Extra.HTML().markup((m) =>
        m.inlineKeyboard([
          m.callbackButton(`Yes`, `1`),
          m.callbackButton(`No, skip`, `2`),
        ])
      )
    );
    return ctx.wizard.next();
  },
  //H. enter picture (optional)
  async (ctx) => {
    try {
      const toSkip = ctx.update.callback_query?.data;
      if (toSkip == 1) {
        ctx.replyWithHTML("<b>enter a picture for your Ad </b>");

        return ctx.wizard.next();
      } else if (toSkip == 2) {
        await pushAd(ctx.wizard.state.adData);
        ctx.replyWithHTML("<b>Done! </b>");
        return ctx.scene.leave();
      }
    } catch (err) {
      console.log(err);
    }
  },
  //G. Done
  async (ctx) => {
    const photo = ctx.update.message?.photo;
    const pic_id = photo ? photo[0]?.file_id : "";
    if (pic_id) {
      ctx.wizard.state.adData.pic_id = pic_id;
      await pushAd(ctx.wizard.state.adData);
      ctx.replyWithHTML("<b>Done! </b>");
      return ctx.scene.leave();
    }
  }
);

const editAd = async (ctx) => {
  const data = await ctx.update.callback_query?.data;
  const adId = data.split("_")[2];
  //enter into wizard
  await ctx.scene.enter("editAd_WIZARD_SCENE_ID");
};
module.exports = { editAd, editAd_Wizard };

/*
- same wizard
- enter new ___ | skip
*/
