const Extra = require("telegraf/extra");
const WizardScene = require("telegraf/scenes/wizard");
const { Question } = require("../models/Question.model");
const { quiz } = require("../models/Quiz.model");
const { QuizUser } = require("../models/QuizUser.model");
const QuizUserModel = require("../models/QuizUser.model");
const { User } = require("../models/User.model");

const loadQuiz = async (userId, ctx) => {
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
  const allQuizes = await quiz.query();
  if (!takenQuizes || takenQuizes.length < 1) {
    //has taken no quizes
    if (allQuizes.length < 1) throw "no quizs added";
    const firstQuiz = allQuizes[0];
    return firstQuiz;
  } else if (takenQuizes) {
    //user has taken quizs
    const takenQuizesIds = takenQuizes.map(el => el.quiz_id)
    const allQuizesIds = allQuizes.map(el => el.id)
    const filteredIds = allQuizesIds.filter(el => !takenQuizesIds.includes(el));
    if(!filteredIds[0]){
      ctx.replyWithHTML(
        `<b>You have taken all available quizes! stay tuned for more ☺️</b>`
      );
      return false
    } else {
    return allQuizes.filter(el => el.id === filteredIds[0])[0]
    }

  }
};

const loadQuestion = async (qId) => {
  return await Question.query().findById(qId);
};

const saveQuiz = async (quizData) => {
  //find score
  let score = 0;
  //amount of time taken to complete quiz divded by 4 to be multiplied with each right answer
  const timeCoefficient = quizData.timeTaken / 1000 / 4;
  const report = { right: [], wrong: [] };
  const q1 = await Question.query().findById(quizData.quizObj.q1_id);
  if (quizData.ans1 == q1.rightAnswer) {
    score =
      score + score * timeCoefficient
        ? score + score * timeCoefficient
        : timeCoefficient;
    report.right.push(0);
  } else {
    report.wrong.push(0);
  }
  const q2 = await Question.query().findById(quizData.quizObj.q2_id);
  if (quizData.ans2 == q2.rightAnswer) {
    score =
      score + score * timeCoefficient
        ? score + score * timeCoefficient
        : timeCoefficient;
    report.right.push(1);
  } else {
    report.wrong.push(1);
  }
  const q3 = await Question.query().findById(quizData.quizObj.q3_id);
  if (quizData.ans3 == q3.rightAnswer) {
    score =
      score + score * timeCoefficient
        ? score + score * timeCoefficient
        : timeCoefficient;
    report.right.push(2);
  } else {
    report.wrong.push(2);
  }
  const q4 = await Question.query().findById(quizData.quizObj.q4_id);
  if (quizData.ans4 == q4.rightAnswer) {
    score =
      score + score * timeCoefficient
        ? score + score * timeCoefficient
        : timeCoefficient;
    report.right.push(3);
  } else {
    report.wrong.push(3);
  }

  //save to quizs_users
  const quizuser = await QuizUser.query().insert({
    user_id: quizData.userId,
    quiz_id: quizData.quizObj.id,
    score: Math.round(score * 100) / 100,
  });
  //update user points
  const user = await User.query().where({ telid: quizData.userId });
  await User.query()
    .update({
      points: user[0].points + score,
    })
    .where({ telid: quizData.userId });
  return { quizuser, report };
};

const loadStats = async (quizuser, report, quizData) => {
  //average seconds taken for questions
  const averageSeconds = quizData.timeTaken / 1000 / 4;
  //load the how many'th player he is to play the game
  const quizTakers = await QuizUser.query().where({
    quiz_id: quizData.quizObj.id,
  });
  const nth = quizTakers.length;
  //load his total score
  const score = quizuser.score;
  //load qids for answered and unanswered quests
  const rightAndWrongs = { right: [], wrong: [] };
  report.right.map((i) => {
    rightAndWrongs.right.push(quizData.quizObj[`q${i + 1}_id`]);
  });
  report.wrong.map((i) => {
    rightAndWrongs.wrong.push(quizData.quizObj[`q${i + 1}_id`]);
  });
  const stats = { averageSeconds, nth, score, rightAndWrongs };
  return stats;
};

const generateStatsHtml = async (stats, userId) => {
  const allQuestions = await Question.query();
  //load answered quests
  let answeredQuestions = "";
  for (qid of stats.rightAndWrongs.right) {
    const quest = await Question.query().findById(qid);
    answeredQuestions = answeredQuestions.concat(`✅ ${quest.question}\n`);
  }
  //load unanswered quests
  let unAnsweredQuestions = "";
  for (qid of stats.rightAndWrongs.wrong) {
    const quest = await Question.query().findById(qid);
    unAnsweredQuestions = unAnsweredQuestions.concat(`❌ ${quest.question}\n`);
  }
  const share = `https://t.me/${process.env.BOT_USERNAME}?start=${userId}`;
  const msg = `👉🏿 you are the #${stats.nth} player\n👉🏿 score: ${stats.rightAndWrongs.right.length}/4\n👉🏿 Average time taken for each question: ${stats.averageSeconds}s\n🎖 ${stats.score} Points added\n\n${answeredQuestions}\n${unAnsweredQuestions}\n\n${share}\nShare the link to this quiz and earn points 🎁
    `;
  return msg;
};

//MARK-- WIZARD_newAd
const takeQuiz_Wizard = new WizardScene(
  "takeQuiz_Wizard_SCENE_ID", // first argument is Scene_ID,

  //A. load quiz and show first question
  async (ctx) => {
    try {
      ctx.wizard.state.quizData = {};
      ctx.wizard.state.quizData.userId = ctx.update?.message?.from?.id;
      ctx.wizard.state.quizData.initTime = new Date();
      const quiz = await loadQuiz(ctx.wizard.state.quizData.userId, ctx);
      if (!quiz){ 
        throw 'no quiz found'
      };
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
      return ctx.scene.leave();

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
      ctx.wizard.state.quizData.endTime = new Date();
      ctx.wizard.state.quizData.timeTaken =
        ctx.wizard.state.quizData.endTime - ctx.wizard.state.quizData.initTime;

      const { quizuser, report } = await saveQuiz(ctx.wizard.state.quizData);
      const stats = await loadStats(
        quizuser,
        report,
        ctx.wizard.state.quizData
      );

      //generate html
      const msg = await generateStatsHtml(
        stats,
        ctx.wizard.state.quizData.userId
      );
      ctx.replyWithHTML(msg);

      return ctx.scene.leave();
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
