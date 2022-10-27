const selectPackage = async (ctx) => {
  const packId = Number(ctx.update?.callback_query?.data);
  ctx.replyWithHTML(`Menu`, {
    reply_markup: {
      parse_mode: "HTML",
      inline_keyboard: [
        [
          {
            text: `View status`,
            callback_data: `view_status_${packId}`,
          },
        ],
        [
          {
            text: `Enter new Ad`,
            callback_data: `add_ad_${packId}`,
          },
        ],
        [
          {
            text: `Edit existing Ad`,
            callback_data: `select_ad_${packId}`,
          },
        ],
      ],
    },
  });
};
module.exports = selectPackage;
