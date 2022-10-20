const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const { traverseAsync } = require("../models/Group.model");
const Group = require("../models/Group.model");
const Owner = require("../models/Owner.model");

const accountIsValid = () => {
  return traverseAsync;
};
const saveGroupInfo = async (obj) => {
  //update owner if owner is new
  if (obj.owner_id)
    await Owner.query().findById(obj.owner_id).patch({
      cbe_account: obj.account,
    });
  //update group category
  await Group.query().where("tg_chat_id", obj.group_id).patch({
    category: obj.category,
  });
  return;
};
const hasAccount = async (owner_id) => {
  const owner = await Owner.query().findById(owner_id);
  if (owner.cbe_account === "none") return false;
  return true;
};

//MARK-- WIZARD_regGroup
const regGroup_Wizard = new WizardScene(
  "regGroup_WIZARD_SCENE_ID", // first argument is Scene_ID,
  async (ctx) => {
    ctx.wizard.state.groupData = {};
    ctx.replyWithHTML(
      "Add this bot to your group \n <b>(This only works if you are the group owner)</b>"
    );
    return ctx.wizard.next();
  },
  (ctx) => {
    const data = ctx.update.callback_query?.data;
    ctx.wizard.state.groupData.owner_id = JSON.parse(data)?.owner_id;
    ctx.wizard.state.groupData.group_id = JSON.parse(data)?.group_id;
    ctx.replyWithHTML(
      `<b>Choose the appropriate category for the group</b>
    👉🏿 1. ecommerce
    👉🏿 2. pharma
    👉🏿 3. electronics
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
  },
  async (ctx) => {
    try {
      if (await hasAccount(ctx.wizard.state.groupData.owner_id)) {
        ctx.replyWithHTML("<b>Done!</b>");
        await saveGroupInfo(ctx.wizard.state.groupData);
        return ctx.scene.leave();
      }
      const cat = ctx.update.callback_query?.data;
      if (cat) ctx.wizard.state.groupData.category = cat;
      ctx.replyWithHTML(`<i>Enter your CBE account</i>`);
      return ctx.wizard.next();
    } catch (er) {}
  },
  async (ctx) => {
    try {
      const account = ctx.update.message?.text;
      if (accountIsValid(account)) {
        ctx.wizard.state.groupData.account = account;
        ctx.replyWithHTML("<b>Done!</b>");
        await saveGroupInfo(ctx.wizard.state.groupData);
        return ctx.scene.leave();
      } else {
        ctx.replyWithHTML(
          "<b>you entered an invalid CBE account number!</b>",
          Extra.HTML().markup((m) =>
            m.inlineKeyboard([m.callbackButton(`try again`, `1`)])
          )
        );
        return ctx.wizard.back();
      }
    } catch (er) {}
  }
);

const regGroupController = async (ctx) => {
  //console.log(ctx.update); //917895751
  await ctx.scene.enter("regGroup_WIZARD_SCENE_ID");
};
const groupAdded = async (owner_id, groupName, group_id) => {
  const { telegram } = require("../server");
  telegram.sendMessage(
    owner_id,
    `you added autoAd to ${groupName}\nthis is your <b>referral code:</b> <u>${owner_id}</u>
  `,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `Continue`,
              callback_data: JSON.stringify({
                owner_id,
                group_id,
              }),
            },
          ],
        ],
      },
    }
  );
  // await ctx.scene.enter("createAd_WIZARD_SCENE_ID");
};
const groupRemoved = async (owner_id, groupName) => {
  const { telegram } = require("../server");
  telegram.sendMessage(owner_id, `you removed autoAd from ${groupName}`);
};

module.exports = {
  regGroupController,
  groupAdded,
  groupRemoved,
  regGroup_Wizard,
};
