const WizardScene = require("telegraf/scenes/wizard");

//MARK-- WIZARD_regGroup
const regGroup_Wizard = new WizardScene(
  "regGroup_WIZARD_SCENE_ID", // first argument is Scene_ID,
  (ctx) => {
    ctx.replyWithHTML(`<i>Enter your CBE account</i>`);
    return ctx.wizard.next();
  },
  (ctx) => {
    try {
      const account = ctx.update.message.text;
      ctx.replyWithHTML("<b>Done!</b>");
      return ctx.scene.leave();
    } catch (er) {}
  }
);

const regGroupController = async (ctx) => {
  ctx.replyWithHTML("Add this bot to your group");
};
const groupAdded = async (owner_id, groupName) => {
  const telegram = require("../server");
  telegram.sendMessage(
    owner_id,
    `you added autoAd to ${groupName}\nthis is your <b>referral code:</b> <u>${owner_id}</u>
  `,
    { parse_mode: "HTML" }
  );
  // await ctx.scene.enter("createAd_WIZARD_SCENE_ID");
};
const groupRemoved = async (owner_id, groupName) => {
  const telegram = require("../server");
  telegram.sendMessage(owner_id, `you removed autoAd from ${groupName}`);
};

module.exports = {
  regGroupController,
  groupAdded,
  groupRemoved,
  regGroup_Wizard,
};
