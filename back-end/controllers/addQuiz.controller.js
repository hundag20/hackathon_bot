const { Question } = require("../models/Question.model");
const { quiz } = require("../models/Quiz.model");
const logger = require("../utils/logger");

const addQuiz = async (req, res, next) => {
  try {
    const { questions } = req.body;
    // logger("info", `body is ${JSON.stringify(req.body)}`);
    // questions.map((quest) => Object.keys(quest).map((prop) => {}))
    if (
      !questions ||
      questions.length < 4
    )
      throw { status: 400, msg: "missing info in request" };
    //validate correctness of data types

    //save questions
    const qids = [];
    for (let el of questions) {
        let answerIndex = null;
        if(!Object.keys(el).includes('correct')) throw { status: 400, msg: "missing info in request" };
        Object.keys(el).map(key => {if(key!= 'correct' && el[key] === el['correct']){
            answerStr = key.split('ans');
            answerIndex = Number(answerStr[1]) - 1;
        }})
        delete el.correct;
      const quest = {...el, rightAnswer: answerIndex}
      const Q = await Question.query().insert(quest);
      qids.push(Q.id);
    }
    //save quiz
    await quiz.query().insert({
      q1_id: qids[0], 
      q2_id: qids[1],
      q3_id: qids[2],
      q4_id: qids[3],
    });

    res.status(200).send();
  } catch (err) {
    next({ currentTask: "addQuiz", err });
  }
};

module.exports = addQuiz;
//change bot token
//leaderboard
//average score
//total number of coupons issued