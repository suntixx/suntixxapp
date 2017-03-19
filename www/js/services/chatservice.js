var chatService = {};

chatService.openChat = function(receiverId, receiverName, isEvent, callback) {
  if (user && receiverId == user.id) {
    return;
  }
  app.showTab(".view-chats");
  if (db) {
    db.sqlBatch([
      ['INSERT or REPLACE INTO chatrooms (roomid, receiver_name, isevent) VALUES (?,?,?)', [receiverId,  receiverName, isEvent] ],
    ],
      function() {
        chatService.startChat(receiverId, receiverName, isEvent, function(err) {
          callback(err);
        });
    }, function(error) {
      console.log(error);
      myApp.addNotification({
          message: language.SYSTEM.DATABASE_CONFIGURATION_ERROR
      });
    });
  } else {
    chatService.startChat(receiverId, receiverName, isEvent, function(err) {
      if (callback) {
        callback(err);
      }
      //do nothing
    });
  }
};

chatService.startChat = function (receiverId, receiverName, isEvent, callback) {
  var storedMessages = [];
  if (db) {
    db.executeSql('SELECT * FROM messages WHERE roomid = ? AND isevent = ? ORDER BY created_on ASC', [receiverId, isEvent == true? 1: 0], function (resultSet) {
      //console.log(resultSet);
      var messageJSON;
      for(var x = 0; x < resultSet.rows.length; x++) {
        messageJSON = JSON.parse(resultSet.rows.item(x).messageJSON);
        messageJSON.created_at = resultSet.rows.item(x).created_on;
        messageJSON.MessageDate = moment(messageJSON.created_at).format('DD-MMM-YYYY');
        messageJSON.Month = moment(messageJSON.created_at).format('MMM');
		    messageJSON.DayOfWeek =  moment(messageJSON.created_at).format('ddd');
        messageJSON.Day = moment(messageJSON.created_at).format('Do');
        messageJSON.Year= moment(messageJSON.created_at).format('YYYY');
		    messageJSON.Time = moment(messageJSON.created_at).format('h:mm a');
        storedMessages.push(messageJSON);
      }
      //console.log(storedMessages);
      var groupByMonth = _.groupBy(storedMessages, function (item) {
        return item.MessageDate;
      });
      //console.log(groupByMonth);
      var formatedMessages = [];
      var todayShowed = false;
      for (var day in groupByMonth) {
        //if (!dateShowed) {
        var messageDay = moment(day, "DD-MMM-YYYY");
        var today = new Date();
        var firstMessage = groupByMonth[day][0];
        //console.log(firstMessage);
        if (messageDay.isSame(today, "day")) { //is it today
          firstMessage.day = language.CHATS.TODAY;
          todayShowed = true;
        } else if (messageDay.isSame(moment(today).add('days', -1), "day")) { //is it yesterday
          firstMessage.day = language.CHATS.YESTERDAY;
        } else if (messageDay.isSame(today, "year")) { //is it this yaer
          firstMessage.day = firstMessage.DayOfWeek+ " "+ firstMessage.Day+ ", "+ firstMessage.Month;
        } else { //is it not this year
          firstMessage.day = firstMessage.Day+ " "+firstMessage.Month+ ", "+firstMessage.Year;
        }
        formatedMessages.push.apply(formatedMessages, groupByMonth[day]);
      }
      //console.log(formatedMessages);
      chatsView.router.load({
        url: 'views/user/chat.html',
        context : {
          isevent: isEvent,
          receiver: receiverId,
          name: escapeText(receiverName),
          messages: formatedMessages,
          todayShowed: todayShowed,
        }
      });
      //if (callback) {
      //  callback();
    //  }
      db.executeSql ("UPDATE messages SET isread = 1 WHERE roomid = ? AND isevent = ?", [receiverId, isEvent == true? 1: 0], function(res) {
        console.log("messages set to read");
        if (callback) {
          callback();
        }
      }, function (err) {
        console.log("could not set messages to read "+ err.message);
      });
      //if (callback) {
      //  callback();
    //  }

    }, function(error) {
      console.log('SELECT error: ' + error.message);
      if (callback) {
        callback(err);
      }
    });
  } else {
    chatsView.router.load({
      url: 'views/user/chat.html',
      context : {
        isevent: isEvent,
        receiver: receiverId,
        name: escapeText(receiverName),
        messages: storedMessages,
      }
    });
    if (callback) {
      callback(err);
    }
  }
};

chatService.deleteMessages = function(messages, callback) {
  var sqlBatch = [];
  async.eachSeries(messages, function(item, callback) {
    var sql = ["DELETE FROM messages WHERE message_id = ?", [item] ];
    sqlBatch.push(sql);
    callback(null);
  }, function(err) {
    db.sqlBatch(sqlBatch, function () {
      console.log("message deleted successfully");
      $$.ajax({
        timeout: 30 * 1000,
        async: true,
        cache: false,
        url: config.server + "/chat/messagesdeleted/",
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: {
          messages: messages,
          userid: user.id
        },
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          console.log('server deleted updated');
          callback();
        },
        error: function(status, xhr) {
          console.log('server deleted not updated');
          callback();
        }
      });
    }, function(err) {
      console.log("message not deleted "+ err.message);
      callback(err)
    });
  });
};

chatService.storeMessages = function(messages, isread, callback) {
  isread = typeof isread !== 'undefined' ? isread : false;
  var messagesDelivered = [];
  async.eachSeries(messages, function(item, seriesCallback) {
    //console.log(item);
    var sql1 = 'INSERT OR IGNORE INTO chatrooms (roomid, isevent, receiver_name) values (?,?,?)';
    var values1 = [item.receiver_id, item.isevent == true? 1:0, item.name ];
    var sql2 = 'INSERT OR IGNORE INTO messages (message_id, roomid, isevent, messageJSON, isreceived, isread) values (?,?,?,?,?,?)';
    var values2 = [item.id, item.receiver_id, item.isevent == true? 1:0,  JSON.stringify(item), item.type == "received" ? 1: 0, isread == true ? 1:0];
    messagesDelivered.push(item.id);
    db.transaction(function(tx) {
      tx.executeSql(sql1, values1);
      tx.executeSql(sql2, values2, function(tx, res) {
        tx.executeSql("UPDATE chatrooms SET modified_on = CURRENT_TIMESTAMP WHERE roomid = ? AND isevent = ?", [item.receiver_id , item.isevent], function (tx, res) {
          console.log("updated chatroom modified_on");
        }, function (err) {
          console.log ("can't update chatroom modified_on: "+ err.message);
        });
      });
    }, function(err) {
      seriesCallback(err);
      console.log("can't update message "+err.message);
    }, function() {
      console.log("message stored");
      seriesCallback();
    });
  }, function(err) {
    if (err && callback) {
      callback(err, messagesDelivered);
    } else if (callback) {
      callback(null, messagesDelivered);
    }
  });
};


chatService.showTools = function () {
  var messageTools =  '<a href="#" class="link icon-only close-message-toolbar"><i class="icon icon-back"></i></a>'+
                      '<a href="#" class="link delete-messages icon-only"><i class="icon icon-delete-message"></i></a>';
                      //'<a href="#" class="link forward-messages icon-only"><i class="icon icon-forward-message"></i></a>';

  $$('#message-bar').removeClass('messagebar').addClass('message-toolbar')
  $$('#message-bar .toolbar-inner').html(messageTools);
};

chatService.hideTools = function () {
  var messageBar = '<textarea class="message-box" placeholder="'+language.CHATS.MESSAGE+'"></textarea><a href="#" class="link send-message">'+language.USER_AREA.CHATS.SEND+'</a>';
  $$('#message-bar').removeClass('message-toolbar').addClass('messagebar');
  $$('#message-bar .toolbar-inner').html(messageBar);
};

chatService.sendMessage = function (messageId, text, receiverId, isEvent, reSend) {
  var request = {
    senderid: user.id,
    message: text,
    //socketid: user.socketId
  };
  if (reSend == true) {
    $$(document).find('#' +messageId+ ' .message').removeClass('message-with-avatar');
    $$(document).find('#' +messageId+ ' .message .message-failed').removeClass('message-avatar').empty();
  }

  isEvent == true ? request.roomid = receiverId : request.receiverid = receiverId;
  $$.ajax({
    timeout: 30 * 1000,
    async: true,
    cache: false,
    url: config.server + "/chat/sendmessage/",
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    data: request,
    xhrFields: { withCredentials: true },
    success: function(data, status, xhr) {
      var result = JSON.parse(data);
      if (db) {
        db.executeSql ("UPDATE messages SET message_id = ? WHERE message_id = ?", [result.id, messageId], function(res) {
        }, function (err) {
          console.log('error updating local message '+err.message);
        });
      }

    },
    error: function (xhr, status){
      $$(document).find('#message-link-' +messageId+ ' .message').addClass('message-with-avatar');
      $$(document).find('#message-link-' +messageId+ ' .message .message-failed').addClass('message-avatar').html('<i class="icon icon-chat-undelivered resend-message" message-id="'+ messageId+ '"></i>');
    },
  });
};

chatService.downloadMessages = function(callback) {
  $$.ajax({
    timeout: 30 * 1000,
    async: true,
    cache: false,
    url: config.server + "/chat/getmessages/",
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    data: {
      captcha: config.secret,
      userid: user.id
    },
    xhrFields: { withCredentials: true },
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        var downloadedMessages = JSON.parse(data);
        //console.log(messageData);
        //var dateShowed = false;
        if (downloadedMessages.length == 0) {
          if (callback) {
              callback();
          } else {
              return;
          }
        }
        chatService.storeMessages(downloadedMessages, false, function(err, messagesDelivered) {
          $$.ajax({
            timeout: 30 * 1000,
            async: true,
            cache: false,
            url: config.server + "/chat/messagesdelivered/",
            method: "POST",
            contentType: "application/x-www-form-urlencoded",
            data: {
              messages: messagesDelivered,
              userid: user.id
            },
            xhrFields: { withCredentials: true },
            success: function(data, status, xhr) {
              console.log('server delivered updated');
              if (callback)
                callback();
            },
            error: function(status, xhr) {
              console.log('server deliverd not updated');
              if (callback)
                callback();
            }
          });
        });
      }
    },
    error: function (xhr, status){
      app.addNotification({
        message:language.CHATS.CHAT_HISTORY_ERROR,
        hold: 2000,
      });
      if (callback)
        callback();
    },
  });
};

chatService.getUnread = function(callback) {
  var sql = "SELECT COUNT(isread) as unread FROM  messages";
  db.executeSql(sql, [], function(resultSet) {
    callback(null, resultSet.rows.item(0).unread);
  },
  function(err) {
    callback(err.message);
  });
};

chatService.getChats = function() {
  var chatRoomList = [];
  var unreadTotal = 0;
  var updateChatsBadge = function(unread) {
    if (unread > 0) {
      $$('.chatrooms .icon-chats').html('<span class="badge bg-green">'+ unread +'</span>');
    } else {
      $$('.chatrooms .icon-chats').empty();
    }
    Template7.global.config.chats = unread;
  };
  if (db) {
    var sql = "SELECT DISTINCT c.roomid, c.receiver_name, c.modified_on, c.isevent,  "+
                  "(SELECT COUNT(m2.isread) FROM  messages as m2 WHERE m2.isread=0 AND m2.roomid=c.roomid) as unread  "+
                  "FROM chatrooms AS c "+
                  "LEFT JOIN messages AS m ON c.roomid = m.roomid " +
                  "ORDER BY c.modified_on DESC";
    db.executeSql(sql, [], function(resultSet) {
      for(var x = 0; x < resultSet.rows.length; x++) {
        chatRoomList.push(resultSet.rows.item(x));
        unreadTotal += Number(resultSet.rows.item(x).unread);
      }
      updateChatsBadge(unreadTotal);
      chatsView.router.load ({
        url: 'views/user/open-chats.html',
        context: {
          chatRoomList: chatRoomList,
          unread: unreadTotal,
        },
        reload: true,
      });
    }, function(error) {
      console.log('SELECT error: ' + error.message);
      app.alert(language.CHATS.CHAT_HISTORY_ERROR);
      updateChatsBadge(unreadTotal);
      chatsView.router.load ({
        url: 'views/user/open-chats.html',
        context: {
          chatRoomList: chatRoomList,
          unread: unreadTotal,
        },
        reload: true,
      });
    });
  } else {
    updateChatsBadge(unreadTotal);
    chatsView.router.load ({
      url: 'views/user/open-chats.html',
      context: {
        chatRoomList: chatRoomList,
        unread: unreadTotal,
      },
      reload: true,
    });
  }
};

chatService.joinRoom = function(eventId) {
  var request = {
    userid: user.id,
    roomid: eventId,
  };
  $$.ajax({
    timeout: 30 * 1000,
    async: true,
    cache: false,
    url: config.server + "/chat/joinroom/",
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    data: request,
    xhrFields: { withCredentials: true },
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        //do nothing
      }

    },
    error: function (xhr, status){
    },
  });
};

chatService.deleteChat = function(roomId) {
  db.transaction(function(tx) {
    tx.executeSql('DELETE FROM chatrooms WHERE roomid = ?', [roomId]);
    tx.executeSql('DELETE FROM messages WHERE roomid = ?', [roomId]);
  }, function(error) {
    console.log('Transaction ERROR: ' + error.message);
  }, function() {
    console.log('Chatroom deleted OK');
  });
};
