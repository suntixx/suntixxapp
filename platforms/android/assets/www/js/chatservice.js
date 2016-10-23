var chatService = {};

chatService.openChat = function(receiverId, receiverName, isEvent, eventName) {
  if (user && receiverId == user.id) {
    return;
  }
  if (!eventName) eventName = "";
  var storedMessages =[];
  if (isEvent == "false") isEvent = false;
  mainView.router.load({
    url: 'views/user/chat.html',
    context : {
      isevent: isEvent,
      receiver: receiverId,
      name: isEvent == true ? eventName : receiverName,
      messages: storedMessages
    }
  });
  /*db.sqlBatch([
    ['INSERT or REPLACE INTO chatrooms (roomid, receiver_name, isevent) VALUES (?,?,?)', [receiverId,  receiverName, isEvent] ],
  ],
    function() {
      db.executeSql('SELECT * FROM messages ORDER BY created_on DESC', [], function (resultSet) {
        console.log(resultSet);
        //resultSet.rows.forEach( function (item, index) {
        //  storedMessages.push(JSON.parse(item.messageJSON));
        //});
        for(var x = 0; x < resultSet.rows.length; x++) {
          storedMessages.push(JSON.parse(resultSet.rows.item(x).messageJSON));
        }
        mainView.router.load({
          url: 'views/user/chat.html',
          context : {
            isevent: isEvent,
            receiver: receiverId,
            messages: storedMessages
          }
        });
      }, function(error) {
        console.log('SELECT error: ' + error.message);
      });
  }, function(error) {
    console.log(error);
    myApp.addNotification({
        message: language.SYSTEM.DATABASE_CONFIGURATION_ERROR
    });
  });*/
};

chatService.storeMessages = function(messages) {
  messages.forEach(insertMessage);

  var insertMessage = function(item, index) {
    db.transaction(function(tx) {
      var sql = 'INSERT INTO messages (message_id, messageJSON) values (?,?)';
      tx.executeSql(sql, [item.id,  JSON.stringify(item)], function(tx, resultSet) {
        console.log("added message "+receiverId);
      }, function(tx, error) {
          console.log("insert error " +error);
      });
    }, function(error) {
      console.log(error);
    }, function() {
      //success
    });
  };
};

chatService.updateChat = function (data) {
  if(data.isevent) {
    //join roomid
    joinRoom(data.receiver);
    $$('#right-panel-menu').html(Menus.chatRoom);
  } else {
    //hide loader
    $$('.chat-loading').hide();
    $$('.chat-name').html(data.name).css('font-size', '0.7em');
    $$('#right-panel-menu').html(Menus.privateChat);
  }
};

chatService.showTools = function () {
  var messageTools =  '<a href="#" class="link icon-only close-message-toolbar"><i class="icon icon-back"></i></a>'+
                      '<a href="#" class="link delete-messages icon-only"><i class="icon icon-delete-message"></i></a>'+
                      '<a href="#" class="link forward-messages icon-only"><i class="icon icon-forward-message"></i></a>';

  $$('#message-bar').removeClass('messagebar').addClass('message-toolbar')
  $$('#message-bar .toolbar-inner').html(messageTools);
};

chatService.hideTools = function () {
  var messageBar = '<textarea class="message-box" placeholder="'+language.USER_AREA.CHATS.MESSAGE+'"></textarea><a href="#" class="link send-message">'+language.USER_AREA.CHATS.SEND+'</a>';
  $$('#message-bar').removeClass('message-toolbar').addClass('messagebar');
  $$('#message-bar .toolbar-inner').html(messageBar);
};

chatService.sendMessage = function (messageId, text, receiverId, isEvent, reSend) {
  var request = {
    senderid: user.id,
    message: text,
    socketid: user.socketId
  };
  if (reSend == true) {
    //$$(document).find('#message-link-' +messageId+ ' .message .message-failed').html('<span style="width:22px; height:22px" class="preloader preloader-white"></span>');
    $$(document).find('#message-link-' +messageId+ ' .message .message-failed').html('<i class="icon icon-chat-loading"></i>');
    $$(document).find('#message-link-' +messageId+ ' .message .message-failed i').addClass('preloader');
  }
  isEvent == true ? request.roomid = receiverId : request.receiverid = receiverId;
  var nocache = "?t="+moment().unix();
  $$.ajax({
    timeout: 30 * 1000,
    async: true,
    url: config.server + "/chat/sendmessage/" +nocache,
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    data: request,
    xhrFields: { withCredentials: true },
    success: function(data, status, xhr) {
      $$(document).find('#message-link-' +messageId+ ' .message').removeClass('message-with-avatar');
      $$(document).find('#message-link-' +messageId+ ' .message .message-failed').remove();
    },
    error: function (xhr, status){
      $$(document).find('#message-link-' +messageId+ ' .message').addClass('message-with-avatar');
      $$(document).find('#message-link-' +messageId+ ' .message .message-failed').addClass('message-avatar').html('<i class="icon icon-chat-undelivered resend-message" message-id="'+ messageId+ '"></i>');
    },
  });
};
