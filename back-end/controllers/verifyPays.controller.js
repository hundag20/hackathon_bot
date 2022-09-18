const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const { getAdminCtx, verifyAdmin } = require("./adminMenu.controller");
const SceneContext = require("telegraf/scenes/context");
const { BaseScene } = require("telegraf");

let reference_num = "";
let user_id = "";
const init = (r, u) => {
  reference_num = r;
  user_id = u;
};
let temp = false;
let resolved = "";
let transNum = new Promise((resolve, reject) => {
  // if (temp) {
  console.log("c");
  resolve("k");
  // } else {
  // reject(this);
  // }
});

const handleNewRequest = (transNum) => {
  console.log("b");
  temp = true;
  //change transNum from a pending promise to resolved one- via redefining the variable
  // transNum = Promise.resolve("transNumValue");

  //change transNum from pending to resolved by revaluating the temp value by calling resolve
  // Promise.resolve(transNum);

  resolved = Promise.resolve(transNum);
  // return transNum;
};
const listenForVerifyReq = () => {
  /* option 1- save requests in DB and here- check if there are new 
requests in Db every few seconds*/
  /*option 2- a method for letting a request prompt the wizard to activate (like a function)*/
};

/*
XXX option 1: send /cmd refNum to admin, and therefore activating the wizard
XXX (discards unhandled old requests for new) option 2: send button that lets him send /cmd refnum, and therefore activating the wizard
option 3: save requests in db
option 4: send button with right and x -- then create action handlers to init wizard when button clicked 
(embed transNum and userId within button)
*/

//MARK-- WIZARD_verifyPays
const verifyPays_Wizard = new WizardScene(
  "verifyPays_WIZARD_SCENE_ID", // first argument is Scene_ID,
  //start listening to requests
  async (ctx) => {
    console.log("a");
    // const req = await listenForVerifyReq();
    // transNum.then((req) => console.log(req));
    // while (resolved) {
    // resolved.then((x) => console.log("bbb"));
    // }

    // ctx.wizard.state.req = req;
    // return ctx.scene.next();
  },
  //send buttons to admin on request
  (ctx) => {},
  //back to litsening after response
  (ctx) => {}
);

const verifyPaysController = async (ctx) => {
  reference_num = ctx.update.message.text.split(" ")[1];
  console.log(reference_num);
  /*NOTE: there's no way around creating wizard only after admin 
  sends command */
  const authorized = verifyAdmin(ctx.update?.message?.from?.id);
  if (authorized) {
    await ctx.scene.enter("verifyPays_WIZARD_SCENE_ID");
  } else {
    ctx.replyWithHTML("you are unauthorized");
  }
};
module.exports = {
  verifyPays_Wizard,
  verifyPaysController,
  handleNewRequest,
};
/*NOTE: ctx can only be initiated by a user -> bot
 can't be done by the bot -> user */

//   (ctx) => {
//     ctx.wizard.state.context = ctx;
//     ctx.telegram.sendMessage(
//       ADMIN[0],
//       `<i>transaction number: ${reference_num}</i>`,
//       {
//         parse_mode: "HTML",
//         reply_markup: {
//           inline_keyboard: [
//             [{ text: `✅`, callback_data: `1` }],
//             [{ text: "❌", callback_data: `2` }],
//           ],
//         },
//       }
//     );
//     ctx.replyWithHTML("----------------");
//     return ctx.wizard.next();
//   },
//   (ctx) => {
//     console.log("d");
//     console.log(ctx.update);
//     const data = ctx.update.callback_query?.data;
//     if (data === "1") {
//       ctx.telegram.sendMessage(
//         user_id,
//         "Verification Successfull!, your Ad will be posted"
//       );
//     } else if (data === "2") {
//       ctx.telegram.sendMessage(
//         user_id,
//         "The transaction number you entered failed the verification process, try again"
//       );
//     }
//     return ctx.wizard.leave();
//   }

//NOTE categorize async tasks as promiseable and poll-based
