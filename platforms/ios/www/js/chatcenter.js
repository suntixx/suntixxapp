var messages;
//var conversationStarted = false;
app.onPageInit('chat-window', function(page) {
  var receiverId = page.context.receiver;
  var isEvent = page.context.isevent;

  var messageBar = app.messagebar('.messagebar', {maxHeight:200});
  messages = app.messages('.messages', {
    autoLayout: true,
    messages: page.context.messages,
    messageTemplate: '{{#if day}}'+
                        '<div class="messages-date">{{day}}</div>'+
                      '{{/if}}'+
                      '<a href="#" class="message-link" id="message-link-{{id}}">'+
                        '<div class="message {{#if type}}message-sent{{else}}message-received{{/if}}">'+
                        ' <div class="message-name">{{name}}</div>'+
                        ' <div class="message-text">{{text}}</div>'+
                        ' <div class="message-failed"></div>'+
                        ' <div class="message-label">{{Time}}</div>'+
                        '</div>'+
                      '</a>',

  });




  //app.hideToolbar('.message-toolbar');
  //app.showToolbar('.messagebar');
  mainView.activePage.todayAlreadyShowed = false;
  var nocache = "?t="+moment().unix();
  $$.ajax({
    timeout: 30 * 1000,
    async: true,
    url: config.server + "/chat/getmessages/" +nocache,
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    data: {
      isevent: isEvent,
      receiverid: receiverId
    },
    xhrFields: { withCredentials: true },
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        var messageData = JSON.parse(data);
        //var dateShowed = false;
        for (var day in messageData) {
          //if (!dateShowed) {
            var messageDay = moment(day, "DD-MMM-YYYY");
            var today = new Date();
            var firstMessage = messageData[day][0];
            if (messageDay.isSame(today, "day")) { //is it today
              firstMessage.day = language.CHATS.TODAY;
              mainView.activePage.todayAlreadyShowed = true;
            } else if (messageDay.isSame(moment(today).add('days', -1), "day")) { //is it yesterday
              firstMessage.day = language.CHATS.YESTERDAY;
            } else if (messageDay.isSame(today, "year")) { //is it this yaer
              firstMessage.day = firstMessage.DayOfWeek+ " "+ firstMessage.Day+ ", "+ firstMessage.Month;
            } else { //is it not this year
              firstMessage.day = firstMessage.Day+ " "+firstMessage.Month+ ", "+firstMessage.Year;
            }
          //}
          messages.addMessages(messageData[day]);
          //dateShowed = true;
          //mainView.activePage.todayAlreadyShowed = true;
        }
      }
    },
    error: function (xhr, status){
      app.addNotification({
        message:language.CHATS.CHAT_HISTORY_ERROR,
        hold: 2000,
      });
    },
  });

  if (!socket.serverConnected) {
    var checkServerConnected = function () {
      if (socket.serverConnected == true) {
        clearInterval(checkConnection);
        chatService.updateChat(page.context);
      }
    };
    var checkConnection = setInterval( checkServerConnected, 1500);

  } else {
    chatService.updateChat(page.context);
  }


  $$(page.container).on('taphold', '.message-link', function() {
    var messageLinkId = $$(this).attr("id");
    $$('#'+messageLinkId).toggleClass("bg-lightblue");
    if ($$(page.container).find('.bg-lightblue').length > 0) {
      chatService.showTools();
    } else {
      chatService.hideTools();
    }
  });


  $$(document).on('click', '.close-message-toolbar', function() {
    $$('.message-link').removeClass('bg-lightblue');
    chatService.hideTools();
  });

  $$(document).on('click', '.delete-messages', function () {
    messages.removeMessages($$(page.container).find('.bg-lightblue'));
    chatService.hideTools();
  });

  $$(document).on('click', '.forward-messages', function() {
    if (user.friends.length == 0) {
      var html = Template7.templates.noFriendsTemplate(user);
      app.popup(html);
    } else {
      var html = Template7.templates.forwardMessageToFriendTemplate(user);
      app.popup(html);
      var search = app.searchbar('.forward-to-friend-searchbar', {
        searchList: '.forward-message-friend-list',
      });
      search.enable();
    }
  });

  $$(document).on('click', '.get-members', function() {
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/chat/getmembers/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: {
        roomid: receiverId,
      },
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
        //ar result = JSON.parse(data);
        console.log(JSON.parse(data));
          var html = Template7.templates.chatRoomMembersTemplate(JSON.parse(data));
          app.popup(html);
        }
      },
      error: function (xhr, status) {
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },

    });
  });

  $$('.clear-chat').on('click', function() {
    messages.clean();
    //delete local and remote database messages
  });

  $$(document).on('click', '.leave-room', function() {
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/chat/leaveroom/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: {
        roomid: receiverId,
      },
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          mainView.router.back();
        }
      },
      error: function (xhr, status) {
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },

    });
  });

  $$('.open-user-profile').on('click', function () {
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/userinfo/" + receiverId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var result = JSON.parse(data);
          if (result && result.id>0) {
            mainView.router.load({
              url: 'views/user/user-profile.html',
              context: result,
            });
          }
        }
      },
      error: function (xhr, status) {
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },

    });
  });

  $$('.open-event').on('click', function () {
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/event/" + receiverId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var result = JSON.parse(data);
          if (result && result.id>0) {
            selectedEventLocal = result;
            mainView.router.load({
              url: 'event.html',
              context: selectedEventLocal,
            });
          }
        }
      },
      error: function (xhr, status) {
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },

    });
  });

  $$('.message-box').on('keyup keydown', function() {
      socket.emit('typing', {
       isevent: isEvent,
       from: user.id,
       name: user.name2,
       receiverid: receiverId
     });
  });

  $$('.send-message').on('click', function () {
    // Message text
    if (!socket.serverConnected) return;
    var messageText = escapeText(messageBar.value().trim());
    if (messageText.length === 0) return;
       // Empty messagebar
    messageBar.clear();
    var messageId = 'local-'+moment();
    messages.addMessage({
      id : messageId,
      text: messageText,
      //sender_id: user.id,
      name: user.name2+" "+user.name4,
      day: mainView.activePage.todayAlreadyShowed ? false : 'Today',
      type: true,
      Time: moment(new Date()).format("h:mm a")
    });
    mainView.activePage.todayAlreadyShowed = true;
    chatService.sendMessage(messageId, messageText, receiverId, isEvent);
    /*var request = {
      senderid: user.id,
      message: messageText,
      socketid: user.socketId
    };
    if (isEvent) {
      request.roomid = receiverId;
    } else {
      request.receiverid = receiverId
    }
    var nocache = "?t="+moment().unix();
    $$.ajax({
      timeout: 30 * 1000,
      async: true,
      url: config.server + "/chat/sendmessag/" +nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var messageData = JSON.parse(data);
          //messageData.message.sent = true;
          //messages.addMessage(messageData.message);
        }
      },
      error: function (xhr, status){
        $$(document).find('#message-link-' +messageId+ ' .message').addClass('message-with-avatar');
        $$(document).find('#message-link-' +messageId+ ' .message .message-failed').addClass('message-avatar').html('<i class="icon icon-chat-undelivered resend-message" message-id="'+ messageId+ '"></i>');
      },
    });*/
  });

  $$(document).on('click', '.resend-message', function() {
    var messageId = $$(this).attr("message-id");
    var messageText = $$(document).find('#message-link-'+messageId+ ' .message .message-text').text();
    chatService.sendMessage(messageId, messageText, receiverId, isEvent, true);
  });
});

var socketManager = function() {
  socket.on('connected', function(socketid) {
    user.socketId = socketid;
    var request = {
      socketid: socketid,
      userid: user.id
    };
    //console.log(request);
    var nocache = "?t="+moment().unix();
    $$.ajax({
      timeout: 30 * 1000,
      async: true,
      url: config.server + "/chat/connect/" +nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          //alert(socketid);
          socket.serverConnected = true;

        }
      },
      error: function (xhr, status){
        app.alert(language.SYSTEM.CHAT_CONFIGURATION_ERROR);
      },
    });
   });

   socket.on('room-count', function(data) {
     $$('.chat-count').html(data.quantity);
   });

   socket.on('joined-room', function(data) {
     var thisPage = mainView.activePage;
     if (thisPage.name == "chat-window"  && data.room == 'room-'+thisPage.context.receiver ) {
       $$('.amount-in-room').text(data.quantity+ " Persons in this room");
       $$('.someone-typing').html("&nbsp;");
       $$('.chat-loading').hide();
       $$('.chat-name').html(thisPage.context.name).css('font-size', '0.7em');
     }
   });

   socket.on('typing', function(data) {
     var thisPage = mainView.activePage;
     //data = JSON.parse(data);
     if (data.from === user.id) { return; }
     if (thisPage.name == "chat-window" && data.from == thisPage.context.receiver && data.isevent == thisPage.context.isevent) {

       $$('.someone-typing').html(data.name+ language.CHATS.SOMEONE_TYPING);
       setTimeout(function() {
         $$('.someone-typing').html("&nbsp;");
       }, 1000);
     }
   });

   socket.on('new-message', function(data) {
     var thisPage = mainView.activePage;
     //var messageData = JSON.parse(data);
     if (data.sender_id === user.id) { return; }

     console.log(data);
     //console.log(thisPage);
     if (thisPage.name == "chat-window" && data.from == thisPage.context.receiver && data.isevent == thisPage.context.isevent) {
       //add message
       //console.log(data.message);
       messages.addMessage(data.message);
     } else {
       var msg = language.CHATS.NEW_MESSAGE_FROM + data.fromName;
       if (data.isevent == true) {
         msg = msg + language.CHATS.IN + data.eventName;
       }
      app.addNotification({
         message: msg,
         hold: 4000,
         button: {
             text: language.CHATS.READ,
             color: 'lightgreen',
             close:true
         },
         onClick: function () {
           //app.alert();
           chatService.openChat(data.from, data.fromName, data.isevent, data.eventName ? data.eventName: null);
         },
       });
     }
     var nocache = "?t="+moment().unix();
     $$.ajax({
       timeout: 30 * 1000,
       async: true,
       url: config.server + "/chat/messagedelivered/" +nocache,
       method: "POST",
       contentType: "application/x-www-form-urlencoded",
       data: {messageid: data.id},
       xhrFields: { withCredentials: true },
       success: function(data, status, xhr) {
         if (status == 200 || status == 0 ) {
           //do nothing
         }
       },
       error: function (xhr, status){
       },
     });
     socket.emit('message-delivered', {
      messageid: data.id
    });
  });
};

var joinRoom = function(eventId) {
  var request = {
    userid: user.id,
    roomid: eventId,
  };
  var nocache = "?t="+moment().unix();
  $$.ajax({
    timeout: 30 * 1000,
    async: true,
    url: config.server + "/chat/joinroom/" +nocache,
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

var escapeText = function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 };
