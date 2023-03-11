const Extra = require("telegraf/extra");
const WizardScene = require("telegraf/scenes/wizard");
const { Question } = require("../models/Question.model");
const { quiz } = require("../models/Quiz.model");
const { QuizUser } = require("../models/QuizUser.model");
const QuizUserModel = require("../models/QuizUser.model");
const { User } = require("../models/User.model");

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

const loadQuiz = async (userId) => {
  //check user exists and create if not
  const user = await User.query().where({ telid: userId });
  if (!user || user.length < 1) {
    await User.query().insert({ telId: userId });
  }

  //get quizId of any quiz he hasn't taken. if none, show message teling him to wait for new ones to be added
  //load quizes that user has taken
  const takenQuizes = await QuizUser.query().where({
    user_id: userId,
  });
  if (!takenQuizes || takenQuizes.length < 1) {
    //has taken no quizes
    const allQuizes = await quiz.query();
    if (allQuizes.length < 1) throw "no quizs added";
    const firstQuiz = allQuizes[0];
    return firstQuiz;
  } else if (takenQuizes) {
    console.log("has taken quizs");
  }
};

const loadQuestion = async (qId) => {
  return await Question.query().findById(qId);
};

const saveQuiz = async (quizData) => {
  //find score
  let score = 0;
  const q1 = await Question.query().findById(quizData.quizObj.q1_id);
  if (quizData.ans1 == q1.rightAnswer) score++;
  const q2 = await Question.query().findById(quizData.quizObj.q2_id);
  if (quizData.ans2 == q2.rightAnswer) score++;
  const q3 = await Question.query().findById(quizData.quizObj.q3_id);
  if (quizData.ans3 == q3.rightAnswer) score++;
  const q4 = await Question.query().findById(quizData.quizObj.q4_id);
  if (quizData.ans4 == q4.rightAnswer) score++;

  //save to quizs_users
  await QuizUser.query().insert({
    user_id: quizData.userId,
    quiz_id: quizData.quizObj.id,
    score,
  });
  //update user points
  const user = await User.query().where({ telid: quizData.userId });
  await User.query().update({
    points: user[0].points + score,
  });
};

//MARK-- WIZARD_newAd
const takeQuiz_Wizard = new WizardScene(
  "takeQuiz_Wizard_SCENE_ID", // first argument is Scene_ID,

  //A. load quiz and show first question
  async (ctx) => {
    try {
      ctx.wizard.state.quizData = {};
      ctx.wizard.state.quizData.userId = ctx.update?.message?.from?.id;
      const quiz = await loadQuiz(ctx.wizard.state.quizData.userId);
      ctx.wizard.state.quizData.quizObj = quiz;
      const firstQ = await loadQuestion(quiz.q1_id);
      const keys = Object.keys(firstQ);
      const options = [];
      keys.forEach((key) => {
        if (key.includes("ans") && firstQ[key]) {
          options.push([`${firstQ[key]}`, key]);
        }
      });
      const letters = ["A", "B", "C", "D", "E"];
      let ansList = "";
      options.forEach((el, i) => {
        ansList = ansList.concat(`${letters[i]}. ${el[0]} \n`);
      });
      ctx.replyWithHTML(
        `<span class='tg-spoiler'><b>Q1. ${firstQ.question} </b></span>\n\n${ansList}`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard(
            options.map((el, i) => m.callbackButton(letters[i], i))
          )
        ),
        {
          parse_mode: "HTML",
          reply_markup: {
            forceReply: true,
          },
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
    return ctx.wizard.next();
  },
  //B. load second Question
  async (ctx) => {
    try {
      const ans = ctx.update?.callback_query?.data;
      ctx.wizard.state.quizData.ans1 = ans;
      const quest = await loadQuestion(ctx.wizard.state.quizData.quizObj.q2_id);
      const keys = Object.keys(quest);
      const options = [];
      keys.forEach((key) => {
        if (key.includes("ans") && quest[key]) {
          options.push([`${quest[key]}`, key]);
        }
      });
      const letters = ["A", "B", "C", "D", "E"];
      let ansList = "";
      options.forEach((el, i) => {
        ansList = ansList.concat(`${letters[i]}. ${el[0]} \n`);
      });
      ctx.replyWithHTML(
        `<span class='tg-spoiler'><b>Q2. ${quest.question} </b></span>\n\n${ansList}`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard(
            options.map((el, i) => m.callbackButton(letters[i], i))
          )
        ),
        {
          parse_mode: "HTML",
          reply_markup: {
            forceReply: true,
          },
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  },
  //C. load third Question
  async (ctx) => {
    try {
      const ans = ctx.update?.callback_query?.data;
      ctx.wizard.state.quizData.ans2 = ans;
      const quest = await loadQuestion(ctx.wizard.state.quizData.quizObj.q3_id);
      const keys = Object.keys(quest);
      const options = [];
      keys.forEach((key) => {
        if (key.includes("ans") && quest[key]) {
          options.push([`${quest[key]}`, key]);
        }
      });
      const letters = ["A", "B", "C", "D", "E"];
      let ansList = "";
      options.forEach((el, i) => {
        ansList = ansList.concat(`${letters[i]}. ${el[0]} \n`);
      });
      ctx.replyWithHTML(
        `<span class='tg-spoiler'><b>Q3. ${quest.question} </b></span>\n\n${ansList}`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard(
            options.map((el, i) => m.callbackButton(letters[i], i))
          )
        ),
        {
          parse_mode: "HTML",
          reply_markup: {
            forceReply: true,
          },
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  },
  //D. load fourth Question
  async (ctx) => {
    try {
      const ans = ctx.update?.callback_query?.data;
      ctx.wizard.state.quizData.ans3 = ans;
      const quest = await loadQuestion(ctx.wizard.state.quizData.quizObj.q4_id);
      const keys = Object.keys(quest);
      const options = [];
      keys.forEach((key) => {
        if (key.includes("ans") && quest[key]) {
          options.push([`${quest[key]}`, key]);
        }
      });
      const letters = ["A", "B", "C", "D", "E"];
      let ansList = "";
      options.forEach((el, i) => {
        ansList = ansList.concat(`${letters[i]}. ${el[0]} \n`);
      });
      ctx.replyWithHTML(
        `<span class='tg-spoiler'><b>Q4. ${quest.question} </b></span>\n\n${ansList}`,
        Extra.HTML().markup((m) =>
          m.inlineKeyboard(
            options.map((el, i) => m.callbackButton(letters[i], i))
          )
        ),
        {
          parse_mode: "HTML",
          reply_markup: {
            forceReply: true,
          },
        }
      );
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  },
  //E. load stats
  async (ctx) => {
    try {
      const ans = ctx.update?.callback_query?.data;
      ctx.wizard.state.quizData.ans4 = ans;
      const quizUser = await saveQuiz(ctx.wizard.state.quizData);
      //   const stats  = await loadStats(quizUser);
      return ctx.wizard.next();
    } catch (err) {
      console.log(err);
    }
  }
);

const takeQuiz = async (ctx) => {
  const data = await ctx.update?.callback_query?.data;
  refereeId = data?.split("_")[2];
  //enter into wizard
  await ctx.scene.enter("takeQuiz_Wizard_SCENE_ID");
};
module.exports = { takeQuiz, takeQuiz_Wizard };

/*
wiard steps
1) - fetch quiz
   - show first question
2) - show second question
3) - show third question
4) - show fourth question
5) - show quiz stats
*/
