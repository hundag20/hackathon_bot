/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const dummy = {
  quizs: [
    {
      q1_id: 1,
      q2_id: 2,
      q3_id: 3,
      q4_id: 4,
    },
  ],
  questions: [
    {
      question: "what year was TELE fomred?",
      ans1: "1990",
      ans2: "1995",
      ans3: "1998",
      ans4: "1890",
      ans5: "1895",
      rightAnswer: 0,
    },
    {
      question: "what year was ELPA fomred?",
      ans1: "1990",
      ans2: "1995",
      ans3: "1998",
      ans4: "1890",
      ans5: "1895",
      rightAnswer: 0,
    },
    {
      question: "what year was INSA fomred?",
      ans1: "1990",
      ans2: "1995",
      ans3: "1998",
      ans4: "1890",
      ans5: "1895",
      rightAnswer: 0,
    },
    {
      question: "what year was RIDE fomred?",
      ans1: "1990",
      ans2: "1995",
      ans3: "1998",
      ans4: "1890",
      ans5: "1895",
      rightAnswer: 0,
    },
  ],
  users: [{ username: "timshel" }],
};
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex("quizs").truncate();
  await knex("users").truncate();
  await knex("questions").truncate();
  await knex("quizs_users").truncate();

  //insert dummy
  await knex("quizs").insert(dummy.quizs);
  await knex("users").insert(dummy.users);
  await knex("questions").insert(dummy.questions);
  // await knex('quizs_users').insert(quizValues);
};
