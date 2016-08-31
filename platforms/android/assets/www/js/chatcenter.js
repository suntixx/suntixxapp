var messages;
var conversationStarted = false;
app.onPageInit('chat-window', function(page) {
  var receiverId = page.context.receiver;
  var isEvent = page.context.isevent;
  //var chatServerReady = false;
  var messageBar = app.messagebar('.messagebar', {maxHeight:200});
  messages = app.messages('.messages', {
    autoLayout: true,
    messageTemplate: '{{#if day}}'+
                        '<div class="messages-date">{{day}}</div>'+
                      '{{/if}}'+
                      '<div id="message-{{id}}" class="message {{#js_compare "this.sender.id == '+user.id+'"}}message-sent{{else}}message-received{/js_compare} {{#if hasImage}}message-pic{{/if}} {{#if avatar}}message-with-avatar{{/if}} message-appear-">'+
                      '{{#if name}}<div class="message-name">{{sender.name2}}</div>{{/if}}'+
                      '<div class="message-text">{{message}}</div>'+
                      '{{#if avatar}}<div class="message-avatar" style="background-image:url({{avatar}})"></div>{{/if}}'+
                      '{{#if label}}<div class="message-label">{{Time}}</div>{{/if}}'+
                      '</div>',
  });
  var request = {
    isevent: isEvent,
    roomid: receiver
  };
  mainView.activePage.todayAlreadyShowed = false;
  var nocache = "?t="+moment().unix();
  $$.ajax({
    timeout: 30 * 1000,
    async: true,
    url: config.server + "/chat/getmessages/" +nocache,
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    data: request,
    xhrFields: { withCredentials: true },
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        var messageData = JSON.parse(data);
        for (var day in messageData) {
          var dateShowed = false;
          if (!dateShowed) {
            var messageDay = momment(day, "DD-MMM-YYYY");
            if (messageDay.isSame(new Date(), "day")) { //is it today
              messageData.day = language.CHATS.TODAY;
              todayAlreadyShowed = true;
            } else if (messageDay.isSame(moment(new Date()).add('days', -1), "day")) { //is it yesterday
              messageData.day = language.CHATS.YESTERDAY;
            } else if (messageDay.isSame(new Date(), "year")) { //is it this yaer
              messageData.day = messageData[message].DaOfWeek+ " "+ messageData[message].Day+ ", "+ messageData[message].Month;
            } else { //is it not this year
              messageData.day = messageData[message].Day+ " "+messageData[message].Month+ ", "+messageData[message].Year;
            }
          }
          messages.addMessage(messageData[message]);
          dateShowed = true;
        }
      }
    },
    error: function (xhr, status){
      app.Notification({
        message:language.CHATS.CHAT_HISTORY_ERROR,
        hold: 2000,
      });
    },
  });
  if(eventId  && socket.serverConnected) {
    //join roomid
    joinRoom(eventId);
  } else {
    //hide loader
    $$('.chat-connecting').hide();
  }

  $$('.message').on('taphold', function() {

  });

  $$('.message-box').on('keyup keydown', function() {
      socket.emit('typing', {
       room: eventId,
       senderid: user.id,
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
    var request = {
      senderid: user.id,
      receiverid: receiverId,
      roomid: eventId,
      message: messageText,
      socketid: user.socketId
    };
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
        if (status == 200 || status == 0 ){
          var messageData = JSON.parse(data);
          messageData.day = mainView.activePage.todayAlreadyShowed ? 'Today' : false;
          messages.addMessage(messageData);
        }
      },
      error: function (xhr, status){
        app.Notification({
          message: language.CHATS.CHAT_ERROR,
          hold: 2000
        });
      },
    });


     //socket.emit('new-message', {msg: messageText});
  });
});

var socketManager = function() {
  socket.on('connected', function(socketid) {
    user.socketId = socketid;
    var request = {
      socketid: socketid,
      userid: user.id
    };
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
           if (mainView.activePage.name == "chat-window") {
             if(mainView.activePage.context.eventId) {
               //join room
               joinRoom(mainView.activePage.context.eventId);
             }
           }
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
     if (thisPage.name == "chat-window"  && data.room == 'room-'+thisPage.context.eventId ) {
       $$('.amount-in-room').text(data.quantity+ " Persons in this room");
       $$('.someone-typing').html("&nbsp;");
       $$('.chat-connecting').hide();
     }
   });

   socket.on('typing', function(data) {
     var thisPage = mainView.activePage;
     if (data.senderid === user.id) { return; }
     if (thisPage.name == "chat-window") {
       if (data.room == thisPage.context.eventId || data.receiverid == thisPage.context.receiver) {
         $$('.someone-typing').html(data.name+ " is typing");
         setTimeout(function() {
           $$('.someone-typing').html("&nbsp;");
         }, 1000);
       }
     }
   });

   socket.on('new-message', function(data) {
     var thisPage = mainView.activePage;
     if (data.sender_id === user.id) { return; }
     var messageData = JSON.parse(data);
     if (thisPage.name == "chat-window" && (data.room == thisPage.context.eventId || data.sender_id == thisPage.context.receiver)) {
       //add message

       messages.addMessage(messageData);
     } else {
         myApp.addNotification({
         message: 'New message from' + data.sender_firstname,
         hold: 1500,
         button: {
             text: language.CHATS.READ,
             color: 'lightgreen',
             close:true
         },
         onClick: function () {
           var isEvent = true
           if (messageData.sender && messageData.sender.id) {
             isEvent = false;
             chatService.openChat(data.sender_id, data.sender_firstname, isEvent);
           } else  {
             chatService.openChat(data.room, data.sender_firstname, isEvent);
           }
         }
       });
     }
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
