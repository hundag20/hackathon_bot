const knex = require("knex");
exports.knexInstance = knex({
  client: "mysql2",
  connection: {
    host: "localhost",
    user: "root",
    password: "",
    database: "botify",
  },
});
