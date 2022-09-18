const Ad = require("../models/Ad.model");
const Group = require("../models/Group.model");

//create new ad
(async () => {
  const ads = await Ad.query().findById(2);

  console.log("ad id: ", ads?.id);
  console.log(ads instanceof Ad); // --> true

  const newAd = await Ad.query().insert({
    status: "up",
    text_content: "some ad content",
    schedule_plan: "weekly",
    contact: "@timshel",
  });
  //creation occurs at bot level not ad level
  const groups = await Group.query().findById(7);

  //groups should be array of all selected group ids from all
  //group ids that the bot is subscribed to

  const yetNewAd = await newAd.$relatedQuery("groups").relate(groups);
})();
