const Package = require("../models/Package.model");
const { useFreeTrail } = require("../models/User.model");

const approve = async (ctx) => {
  try {
    const msg = {
      chat_id: ctx.update.callback_query.message.chat.id,
      id: ctx.update.callback_query.message.message_id,
      ref: ctx.update.callback_query.message.text.split(" | ")[0],
      packageId: ctx.update.callback_query.message.text.split(" | ")[1],
    };
    const package = await Package.query().findById(msg.packageId);

    if (package.status === "pending") {
      //edit message
      await ctx.telegram.editMessageText(
        msg.chat_id,
        msg.id,
        null,
        `${msg.ref} approved ✅`
      );
      //update package status
      await Package.query()
        .patch({
          status: "approved",
        })
        .where("id", "=", msg.packageId);

      //update free_used of user if applicable
      if (package.schedule_x == 1) {
        await useFreeTrail(package.user_id);
        console.log("free trial used by user: ", package.user_id);
      }

      //notify user
      ctx.telegram.sendMessage(
        package.user_id,
        "your package has been approved"
      );
    }
  } catch (err) {
    console.log(err);
  }
};
const disapprove = async (ctx) => {
  const msg = {
    chat_id: ctx.update.callback_query.message.chat.id,
    id: ctx.update.callback_query.message.message_id,
    ref: ctx.update.callback_query.message.text.split(" | ")[0],
    packageId: ctx.update.callback_query.message.text.split(" | ")[1],
  };
  const package = await Package.query().findById(msg.packageId);
  if (package.status === "pending") {
    //edit message
    await ctx.telegram.editMessageText(
      msg.chat_id,
      msg.id,
      null,
      `${msg.ref} disapproved ❌`
    );
    //update db
    Package.query().findById(msg.packageId).patch({
      status: "disapproved",
    });
    //notify user
    ctx.telegram.sendMessage(
      package.user_id,
      "your package has been dissaproved because you entered an invalid transaction number! try again"
    );
  }
};

module.exports = {
  approve,
  disapprove,
};
/*NOTE: ctx can only be initiated by a user -> bot
 can't be done by the bot -> user */

//NOTE categorize async tasks as promiseable and poll-based

//DONE: create approve and disapprove middlewares
//DONE: edit messages after approve or dissaprove descisions
//DONE: save paymentNums and notify user after approval/disapproval descision
