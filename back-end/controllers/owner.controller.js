const { default: axios } = require("axios");
const Owner = require("../models/Owner.model");
const Group = require("../models/Group.model");
const { groupAdded, groupRemoved } = require("./regGroup.controller");
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
const TOKEN = process.env.BOT_TOKEN;


//add bot to groups on change
exports.updateGroups = async (botUpdates) => {
  try {
    const data = botUpdates?.filter((el) => el?.my_chat_member);
    const status =
      data[data.length - 1]?.my_chat_member?.new_chat_member?.status;
    const updateId = data[data.length - 1]?.update_id;

    if (!status) {
      throw "no new updates";
    } else if (status) {
      /*NOTE: update doesn't seem to include owner id if admin added it to a group 
      works only if the owner of the group adds it 
      */
      const group_id = data[data.length - 1].my_chat_member.chat.id;
      const owner_id = data[data.length - 1]?.my_chat_member?.from.id;
      const group_name = data[data.length - 1].my_chat_member.chat.title;

      const prevUpdateId = await Group.query()
        .select("update_id")
        .where("tg_chat_id", group_id)
        .first();
      if (prevUpdateId?.update_id === updateId) {
        throw "no new updates";
      } else if (status === "member") {
        await Owner.query()
          .insert({ id: owner_id })
          .catch(() => {
            console.log("skipping owner creation for existing owner");
          });

        if (
          !data[data.length - 1]?.my_chat_member?.new_chat_member.user?.is_bot
        ) {
          console.log(
            `bot added to this group: ${group_id} by this owner: ${owner_id} `
          );
          groupAdded(owner_id, group_name, group_id);
        } else {
          console.log(
            `bot added to this group: ${group_id} by this admin: ${owner_id} `
          );
        }
        const group = await Group.query().where("tg_chat_id", group_id);
        //relate and update update_id for existing groups
        if (group.length > 0) {
          const relId = await Owner.relatedQuery("groups")
            .for(owner_id)
            .relate(group_id);
          await Group.query().where("tg_chat_id", group_id).patch({
            update_id: updateId,
          });
        } //create(id, update_id) and relate for new group
        else {
          const relId = await Owner.relatedQuery("groups")
            .for(owner_id)
            .insert({ tg_chat_id: group_id, update_id: updateId });
        }
      } else if (status === "left") {
        groupRemoved(owner_id, group_name);
        console.log(
          `bot removed from this group: ${group_id} by this owner: ${owner_id} `
        );
        //unrelate bot from group
        await Owner.relatedQuery("groups")
          .for(owner_id)
          .unrelate()
          .where("group_id", "like", group_id);
      }
      await Group.query().where("tg_chat_id", group_id).patch({
        update_id: updateId,
      });
    }
  } catch (err) {
    // console.log(err);
  }
};

//get groups the owner owns
exports.getGroups = async (owner_id) => {
  const groups = await Owner.relatedQuery("groups").for(owner_id);
  console.log(`groups that ${owner_id} is a part of are:`);
  return groups;
};
