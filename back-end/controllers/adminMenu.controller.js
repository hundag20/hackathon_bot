const WizardScene = require("telegraf/scenes/wizard");

const ADMINS = ["338236905"];

const verifyAdmin = (userId) => {
  if (ADMINS.includes(String(userId))) return true;
  else return false;
};

const adminMenuController = async (ctx) => {
  const authorized = verifyAdmin(ctx.update?.message?.from?.id);
  if (authorized) {
    ctx.replyWithHTML(`<b>ADMIN MENU</b>\n/listenForVerifyReqs\n/otherFeature`);
  } else {
    ctx.replyWithHTML("you are unauthorized");
  }
};

module.exports = {
  ADMINS,
  verifyAdmin,
  adminMenuController,
};
//admin
//DONE -verify /admin texter is actually admin
//DONE -start wizard with admins (wizard never ends)
//-wizard has a polling feature that litsens for verification requests
//-wizard will send verification buttons when requests received
//-wizard will edit buttons to 'completed' after verification made
//-wizard will return to litsening to requests after verification made
