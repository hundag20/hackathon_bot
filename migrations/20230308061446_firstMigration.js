/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.createTable("quizs", function (table) {
    table.increments();
    table.string("q1_id");
    table.string("q2_id");
    table.string("q3_id");
    table.string("q4_id");
    table.timestamps();
  });
  await knex.schema.createTable("questions", function (table) {
    table.increments();
    table.string("question");
    table.string("ans1");
    table.string("ans2");
    table.string("ans3");
    table.string("ans4");
    table.string("ans5");
    table.integer("rightAnswer");
    table.timestamps();
  });
  await knex.schema.createTable("users", function (table) {
    table.increments();
    table.integer("telid");
    table.string("username");
    table.integer("totalQuizsTaken");
    table.integer("totalCorrectAnswers");
    table.double("points").defaultTo(0);
    table.timestamps();
  });
  return await knex.schema.createTable("quizs_users", function (table) {
    table.increments();
    table.integer("user_id");
    table.integer("quiz_id");
    table.double("score");
    table.timestamps();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
  await knex.schema.dropTableIfExists("quizs");
  await knex.schema.dropTableIfExists("questions");
  await knex.schema.dropTableIfExists("quizs_users");
};
