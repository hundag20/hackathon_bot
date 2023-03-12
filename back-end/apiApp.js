const express = require("express");
const bodyParser = require("body-parser");
const addQuiz = require("./controllers/addQuiz.controller");
const getStats = require("./controllers/getStats.controller");
const cors = require("cors");
const errHandler = require("./middlewares/errHandler.middleware");
const getLeaderboard = require("./controllers/leaderboard.controller");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'static')));
app.post("/v1/addQuiz", addQuiz, errHandler);
app.get("/v1/getStats", getStats, errHandler);
app.get("/v1/getLeaderboard", getLeaderboard, errHandler);

app.listen(3000, () => console.log(`app listening on port 3000`));

module.exports = { app };

