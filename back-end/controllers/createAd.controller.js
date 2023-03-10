const WizardScene = require("telegraf/scenes/wizard");
const Extra = require("telegraf/extra");
const { checkIfFreeUsed } = require("../models/User.model");
const Owner = require("../models/Owner.model");
const { ADMINS } = require("./adminMenu.controller");
const Ad = require("../models/Ad.model");
const Group = require("../models/Group.model");
const Package = require("../models/Package.model");

const referralIsValid = async (ref) => {
  try {
    //here: check whether owner exists only
    /* another validation at another place: check if owner mentioned as
    referral for an Ad is still associated with atleast 1 group */
    const owner = await Owner.query().findById(Number(ref));
    if (owner) return true;
    else return false;
  } catch (err) {
    console.log(err);
  }
};
const transIsValid = async (num) => {
  return true;
};
const DAILY_POSTS = 15;
const QR_FILE_ID =
  "AgACAgQAAxkBAAIVrGMRogjezhfX9jZTi_PP6vEuTc62AAIBuzEb9JSIUMK236B6EnHxAQADAgADbQADKQQ";

const saveAds = async (ads, package_id) => {
  for (adObj of ads) {
    const admodel = await Ad.query().insert({
      package_id,
      title: adObj.text,
      category: adObj.category,
      text_content: adObj.desc,
      image_content: adObj.pic_id || "no-image",
    });
    return admodel.id;
  }
};

const savePackage = async (pkgObj, adObj) => {
  let rem = 0;
  switch (Number(pkgObj.schedule.x)) {
    case 1:
      //free trial = every 15 minutes for 1 hour
      rem = 4;
      break;
    case 2:
      //daily- every half hour for 24 hours
      rem = 48;
      break;
    case 3:
      //24*7 = weekly- every hour
      rem = 168;
      break;
    case 4:
      //24*30 = monthly- every hour
      rem = 720;
      break;
    default:
      rem = 0;
      break;
  }
  const package = await Package.query().insert({
    user_id: pkgObj.poster_id,
    schedule_x: pkgObj.schedule.x,
    referal: pkgObj.referral,
    paymentNum: pkgObj.transNum,
    remaining_posts: rem,
  });
  const nextAd = await saveAds([adObj], package.id);

  //save nextAd
  await Package.query()
    .update({
      nextAd,
    })
    .where({
      id: package.id,
    });
  return package.id;
};

const chooseCat = async (ctx, caller) => {
  const allGroups = await Group.query();
  let pharma = 0;
  ecom = 0;
  elec = 0;
  allGroups.forEach((el) => {
    if (el.category === "pharma") pharma++;
    if (el.category === "ecommerce") ecom++;
    if (el.category === "electronics") elec++;
  });
  const groupCatStats = {
    ecommerce: ecom,
    pharma: pharma,
    electronics: elec,
  };
  const head =
    caller === "edit"
      ? ""
      : `<b>Enter your Ad</b> (<i>you can enter more ads later</i>)\n\n`;
  ctx.replyWithHTML(
    `${head}<b>Choose the appropriate category of groups for your Ad </b>
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
};

//MARK-- WIZARD_createAd
const createAd_Wizard = new WizardScene(
  "createAd_WIZARD_SCENE_ID", // first argument is Scene_ID,
  //A. choose package
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

    ctx.wizard.state.cursor = {};
    ctx.wizard.state.pkgData = {};
    ctx.wizard.state.adData = {};
    ctx.wizard.state.pkgData.ads = [];
    ctx.wizard.state.pkgData.schedule = {};
    if (ctx.wizard.state.cursor.h)
      return ctx.wizard.steps[ctx.wizard.state.cursor.b](ctx);

    ctx.wizard.state.cursor.a = ctx.wizard.cursor;
    return ctx.wizard.next();
  },
  //B. choose category
  async (ctx) => {
    try {
      ctx.wizard.state.pkgData.poster_id = ctx.update.callback_query.from.id;
      const data = ctx.update.callback_query?.data;
      if (data) {
        if (data == 1) {
          const free_used = await checkIfFreeUsed(ctx.from.id);
          if (free_used) {
            ctx.replyWithHTML(
              "<b>You have used your free trial!</b>",
              Extra.HTML().markup((m) =>
                m.inlineKeyboard([
                  m.callbackButton(`choose another package`, `1`),
                ])
              )
            );
            return ctx.wizard.back();
          }
        }
        //x- weekly/monthly
        //y- num of posts in a day
        ctx.wizard.state.pkgData.schedule.x = data;
        ctx.wizard.state.pkgData.schedule.y = DAILY_POSTS;

        if (ctx.wizard.state.cursor.h) {
          console.log("back");
          await chooseCat(ctx);
          ctx.wizard.steps[ctx.wizard.state.cursor.c](ctx);
        } else {
          ctx.wizard.state.cursor.b = ctx.wizard.cursor;
          await chooseCat(ctx);
          return ctx.wizard.next();
        }
      }
    } catch (err) {
      console.log(err);
    }
  },
  //C. enter title
  async (ctx) => {
    try {
      const cat = ctx.update.callback_query?.data;
      ctx.wizard.state.adData.category = cat;
      ctx.replyWithHTML("<b>Enter title of your Ad </b>");
      if (ctx.wizard.state.cursor.h)
        return ctx.wizard.steps[ctx.wizard.state.cursor.d](ctx);
      ctx.wizard.state.cursor.c = ctx.wizard.cursor;
      return ctx.wizard.next();
    } catch (er) {}
  },
  //D. enter description
  async (ctx) => {
    try {
      const text = ctx.update.message.text;
      ctx.wizard.state.adData.text = text;
      ctx.replyWithHTML("<b>Now enter the discription or body of your Ad </b>");
      if (ctx.wizard.state.cursor.h)
        return ctx.wizard.steps[ctx.wizard.state.cursor.e](ctx);
      ctx.wizard.state.cursor.d = ctx.wizard.cursor;
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
      if (ctx.wizard.state.cursor.h)
        return ctx.wizard.steps[ctx.wizard.state.cursor.f](ctx);
      ctx.wizard.state.cursor.e = ctx.wizard.cursor;
      return ctx.wizard.next();
    } catch (er) {}
  },
  //H. enter referral
  async (ctx) => {
    const skip = ctx.update.callback_query?.data;
    const photo = ctx.update.message?.photo;
    const pic_id = photo ? photo[0]?.file_id : "";
    if (skip) {
      ctx.editMessageText("<b>Now enter a referral number</b>", {
        parse_mode: "HTML",
        reply_markup: {
          forceReply: true,
        },
      });
      return ctx.wizard.next();
    } else if (pic_id) {
      ctx.wizard.state.adData.pic_id = pic_id;
      ctx.replyWithHTML("<b>Now enter a referral number</b>");
      return ctx.wizard.next();
    }
  },
  //I. enter transaction number
  async (ctx) => {
    try {
      ctx.wizard.state.cursor.i = ctx.wizard.cursor;
      const referral = ctx.update.message?.text;
      if (await referralIsValid(referral)) {
        ctx.wizard.state.pkgData.referral = referral;
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
  //J. done
  async (ctx) => {
    try {
      ctx.wizard.state.cursor.j = ctx.wizard.cursor;
      const transNum = ctx.update.message?.text;
      if (transNum && transIsValid(transNum)) {
        ctx.wizard.state.pkgData.transNum = transNum;
        //Notify admin at this point
        ctx.replyWithHTML(
          "<b>Done!</b>\nwe will notify you soon after verifying the payment."
        );
        // handleNewRequest("someshit");
        ctx.scene.leave();
        const packageId = await savePackage(
          ctx.wizard.state.pkgData,
          ctx.wizard.state.adData
        );
        ctx.telegram.sendMessage(ADMINS[0], `${transNum} | ${packageId}`, {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: `✅`, callback_data: "approve" }],
              [
                {
                  text: `❌`,
                  callback_data: "disapprove",
                },
              ],
            ],
          },
        });
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

module.exports = { createAd_Wizard, createAdController, chooseCat };
//DONE: validating referral id
//DONE: send QR code for completing payment
//DONE send verify button for admin(☑️ X)

//daily: 24 hours - 48 posts in 30 minutes interval: remaining posts at ad creation for daily package - 48
//TODO: allow different categories for different ads

//NOTE: first ad = next, next added = next

/*TODO:
1. create add Ad (my active packages > enter new Ad to package)
2. test Update ad (remPosts, nextAd) 
*/

//G. [include another ad][finish]
// async (ctx) => {
//   try {
//     const uname = ctx.update.message?.text;
//     ctx.wizard.state.adData.uname = uname;
//     ctx.wizard.state.pkgData.ads.push(ctx.wizard.state.adData);
//     await ctx.replyWithHTML(
//       `<i>Do you want to include another Ad?</i>`,
//       Extra.HTML().markup((m) =>
//         m.inlineKeyboard([
//           m.callbackButton(`Include another Ad`, `a`),
//           m.callbackButton("finish", `b`),
//         ])
//       )
//     );
//     if (ctx.wizard.state.cursor.h)
//       return ctx.wizard.steps[ctx.wizard.state.cursor.h](ctx);
//     ctx.wizard.state.cursor.g = ctx.wizard.cursor;
//     return ctx.wizard.next();
//   } catch (er) {}
// },
