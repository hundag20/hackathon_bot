const { Question } = require("../models/Question.model");
const { quiz } = require("../models/Quiz.model");
const { User } = require("../models/User.model");

const getStats = async (req, res, next) => {
  try {
    const users = await User.query();
    const questions = await Question.query();
    const quizs = await quiz.query();
    const stats = {
      users: users.length,
      questions: questions.length,
      quizs: quizs.length,
    };
    res.status(200).send(stats);
  } catch (err) {
    res.status(500).send();
  }
};
/*
stats to expose
1. total num of users
2. total num of quizs
3. total num of questions
4. percentage of user who have shared a quiz atleast once
*/
