const { Question } = require("../models/Question.model");
const { quiz } = require("../models/Quiz.model");
const { User } = require("../models/User.model");

const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.query().orderBy('points', 'desc');
    console.log('users', users);

    res.status(200).send(users);
  } catch (err) {
    res.status(500).send();
  }
};
module.exports = getLeaderboard;
/*
stats to expose
1. total num of users
2. total num of quizs
3. total num of questions
4. percentage of user who have shared a quiz atleast once
*/
