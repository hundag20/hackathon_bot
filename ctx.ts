
 const txtRespCtxt = {
    tg: Telegram {
      token: '1277460191:AAHSqUZS3FMpOfmtFO1IAd-4OYP5yHBGz_c',
      options: {
        apiRoot: 'https://api.telegram.org',
        webhookReply: true,
        agent: [Agent]
      },
      response: undefined
    },
    update: {
      update_id: 414399944,
      message: {
        message_id: 3377,
        from: [Object],
        chat: [Object],
        date: 1660816914,
        text: 's'
      }
    },
    options: {
      retryAfter: 1,
      handlerTimeout: 0,
      contextType: [class TelegrafContext],
      username: 'RequestAndBuy_bot'
    },
    updateType: 'message',
    updateSubTypes: [ 'text' ],
    contextState: {},
    assert: [Function: bound assert],
    answerInlineQuery: [Function: bound answerInlineQuery],
    answerCbQuery: [Function: bound answerCbQuery],
    answerGameQuery: [Function: bound answerGameQuery],
    answerShippingQuery: [Function: bound answerShippingQuery],
    answerPreCheckoutQuery: [Function: bound answerPreCheckoutQuery],
    editMessageText: [Function: bound editMessageText],
    editMessageCaption: [Function: bound editMessageCaption],
    editMessageMedia: [Function: bound editMessageMedia],
    editMessageReplyMarkup: [Function: bound editMessageReplyMarkup],
    editMessageLiveLocation: [Function: bound editMessageLiveLocation],
    stopMessageLiveLocation: [Function: bound stopMessageLiveLocation],
    reply: [Function: bound reply],
    getChat: [Function: bound getChat],
    exportChatInviteLink: [Function: bound exportChatInviteLink],
    kickChatMember: [Function: bound kickChatMember],
    unbanChatMember: [Function: bound unbanChatMember],
    restrictChatMember: [Function: bound restrictChatMember],
    promoteChatMember: [Function: bound promoteChatMember],
    setChatAdministratorCustomTitle: [Function: bound setChatAdministratorCustomTitle],
    setChatPhoto: [Function: bound setChatPhoto],
    deleteChatPhoto: [Function: bound deleteChatPhoto],
    setChatTitle: [Function: bound setChatTitle],
    setChatDescription: [Function: bound setChatDescription],
    pinChatMessage: [Function: bound pinChatMessage],
    unpinChatMessage: [Function: bound unpinChatMessage],
    leaveChat: [Function: bound leaveChat],
    setChatPermissions: [Function: bound setChatPermissions],
    getChatAdministrators: [Function: bound getChatAdministrators],
    getChatMember: [Function: bound getChatMember],
    getChatMembersCount: [Function: bound getChatMembersCount],
    setPassportDataErrors: [Function: bound setPassportDataErrors],
    replyWithPhoto: [Function: bound replyWithPhoto],
    replyWithMediaGroup: [Function: bound replyWithMediaGroup],
    replyWithAudio: [Function: bound replyWithAudio],
    replyWithDice: [Function: bound replyWithDice],
    replyWithDocument: [Function: bound replyWithDocument],
    replyWithSticker: [Function: bound replyWithSticker],
    replyWithVideo: [Function: bound replyWithVideo],
    replyWithAnimation: [Function: bound replyWithAnimation],
    replyWithVideoNote: [Function: bound replyWithVideoNote],
    replyWithInvoice: [Function: bound replyWithInvoice],
    replyWithGame: [Function: bound replyWithGame],
    replyWithVoice: [Function: bound replyWithVoice],
    replyWithPoll: [Function: bound replyWithPoll],
    replyWithQuiz: [Function: bound replyWithQuiz],
    stopPoll: [Function: bound stopPoll],
    replyWithChatAction: [Function: bound replyWithChatAction],
    replyWithLocation: [Function: bound replyWithLocation],
    replyWithVenue: [Function: bound replyWithVenue],
    replyWithContact: [Function: bound replyWithContact],
    getStickerSet: [Function: bound getStickerSet],
    setChatStickerSet: [Function: bound setChatStickerSet],
    deleteChatStickerSet: [Function: bound deleteChatStickerSet],
    setStickerPositionInSet: [Function: bound setStickerPositionInSet],
    setStickerSetThumb: [Function: bound setStickerSetThumb],
    deleteStickerFromSet: [Function: bound deleteStickerFromSet],
    uploadStickerFile: [Function: bound uploadStickerFile],
    createNewStickerSet: [Function: bound createNewStickerSet],
    addStickerToSet: [Function: bound addStickerToSet],
    getMyCommands: [Function: bound getMyCommands],
    setMyCommands: [Function: bound setMyCommands],
    replyWithMarkdown: [Function: bound replyWithMarkdown],
    replyWithMarkdownV2: [Function: bound replyWithMarkdownV2],
    replyWithHTML: [Function: bound replyWithHTML],
    deleteMessage: [Function: bound deleteMessage],
    forwardMessage: [Function: bound forwardMessage],
    botInfo: {
      id: 1277460191,
      is_bot: true,
      first_name: '# Tag Tracker',
      username: 'RequestAndBuy_bot',
      can_join_groups: true,
      can_read_all_group_messages: true,
      supports_inline_queries: false
    },
    bot: Telegraf {
      handler: [Function (anonymous)],
      options: {
        retryAfter: 1,
        handlerTimeout: 0,
        contextType: [class TelegrafContext],
        username: 'RequestAndBuy_bot'
      },
      telegram: Telegram {
        token: '1277460191:AAHSqUZS3FMpOfmtFO1IAd-4OYP5yHBGz_c',
        options: [Object],
        response: undefined
      },
      handleError: [Function (anonymous)],
      context: { botInfo: [Object] },
      polling: {
        offset: 414399944,
        started: true,
        timeout: 30,
        limit: 100,
        allowedUpdates: null,
        stopCallback: [Function: noop]
      }
    },
    scene: SceneContext {
      ctx: [Circular *1],
      scenes: Map(1) { 'createAd_WIZARD_SCENE_ID' => [WizardScene] },
      options: { sessionName: 'session' }
    },
    wizard: WizardContext {
      ctx: [Circular *1],
      steps: [
        [Function (anonymous)],
        [AsyncFunction (anonymous)],
        [AsyncFunction (anonymous)]
      ],
      state: { context: [TelegrafContext], reqData: {} },
      cursor: 2
    }
  }

  const imgRespCtxt = {
    tg: Telegram {
      token: '1277460191:AAHSqUZS3FMpOfmtFO1IAd-4OYP5yHBGz_c',
      options: {
        apiRoot: 'https://api.telegram.org',
        webhookReply: true,
        agent: [Agent]
      },
      response: undefined
    },
    update: {
      update_id: 414399969,
      message: {
        message_id: 3421,
        from: [Object],
        chat: [Object],
        date: 1660818236,
        photo: [Array]
      }
    },
    options: {
      retryAfter: 1,
      handlerTimeout: 0,
      contextType: [class TelegrafContext],
      username: 'RequestAndBuy_bot'
    },
    updateType: 'message',
    updateSubTypes: [ 'photo' ],
    contextState: {},
    botInfo: {
      id: 1277460191,
      is_bot: true,
      first_name: '# Tag Tracker',
      username: 'RequestAndBuy_bot',
      can_join_groups: true,
      can_read_all_group_messages: true,
      supports_inline_queries: false
    },
    bot: Telegraf {
      handler: [Function (anonymous)],
      options: {
        retryAfter: 1,
        handlerTimeout: 0,
        contextType: [class TelegrafContext],
        username: 'RequestAndBuy_bot'
      },
      telegram: Telegram {
        token: '1277460191:AAHSqUZS3FMpOfmtFO1IAd-4OYP5yHBGz_c',
        options: [Object],
        response: undefined
      },
      handleError: [Function (anonymous)],
      context: { botInfo: [Object] },
      polling: {
        offset: 414399969,
        started: true,
        timeout: 30,
        limit: 100,
        allowedUpdates: null,
        stopCallback: [Function: noop]
      }
    },
    scene: SceneContext {
      ctx: [Circular *1],
      scenes: Map(1) { 'createAd_WIZARD_SCENE_ID' => [WizardScene] },
      options: { sessionName: 'session' }
    },
    wizard: WizardContext {
      ctx: [Circular *1],
      steps: [
        [Function (anonymous)],
        [AsyncFunction (anonymous)],
        [AsyncFunction (anonymous)],
        [AsyncFunction (anonymous)],
        [AsyncFunction (anonymous)],
        [AsyncFunction (anonymous)]
      ],
      state: { context: [TelegrafContext], adData: [Object] },
      cursor: 4
    }
  }

  const ctx_update_message_photo = [
    {
      file_id: 'AgACAgQAAxkBAAINb2L-E-ttlbb1EBYI8UyzQIkFkAUWAAI8uzEbSHXwUx2qZl1SQ0giAQADAgADcwADKQQ',
      file_unique_id: 'AQADPLsxG0h18FN4',
      file_size: 781,
      width: 90,
      height: 45
    },
    {
      file_id: 'AgACAgQAAxkBAAINb2L-E-ttlbb1EBYI8UyzQIkFkAUWAAI8uzEbSHXwUx2qZl1SQ0giAQADAgADbQADKQQ',
      file_unique_id: 'AQADPLsxG0h18FNy',
      file_size: 6655,
      width: 320,
      height: 160
    },
    {
      file_id: 'AgACAgQAAxkBAAINb2L-E-ttlbb1EBYI8UyzQIkFkAUWAAI8uzEbSHXwUx2qZl1SQ0giAQADAgADeAADKQQ',
      file_unique_id: 'AQADPLsxG0h18FN9',
      file_size: 7913,
      width: 440,
      height: 220
    }
  ]
   
  
  
  
  
  
  
  
  
  
  