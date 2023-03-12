const { Model } = require("objection");
const { knexInstance } = require("./utils/knexInstance");

// Give the knex instance to objection.
Model.knex(knexInstance);

module.exports = { Model };
