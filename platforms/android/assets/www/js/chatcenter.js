var messages;
var conversationStarted = false;
app.onPageInit('chat-window', function(page) {
  var receiverId = page.context.receiver;
  var eventId = page.context.eventId;
  //var chatServerReady = false;
  var messageBar = app.messagebar('.messagebar', {maxHeight:200});
  messages = app.messages('.messages', {
    autoLayout: true,
    messageTemplate: '{{#if day}}'+
                        '<div class="messages-date">{{day}} {{#if time}}, <span>{{time}}</span>{{/if}}</div>'+
                      '{{/if}}'+
                      '<div id="message-{{messageId}}" class="message message-{{type}} {{#if hasImage}}message-pic{{/if}} {{#if avatar}}message-with-avatar{{/if}} message-appear-">'+
                      '{{#if name}}<div class="message-name">{{name}}</div>{{/if}}'+
                      '<div class="message-text">{{text}}</div>'+
                      '{{#if avatar}}<div class="message-avatar" style="background-image:url({{avatar}})"></div>{{/if}}'+
                      '{{#if label}}<div class="message-label">{{label}}</div>{{/if}}'+
                      '</div>',
  });

  if(eventId  && socket.serverConnected) {
    //join roomid
    joinRoom(eventId);
  } else {
    //chatServerReady = true;
  }

  $$('.message-box').on('keyup keydown', function() {
      socket.emit('typing', {
       room: 'room-'+eventId,
       senderid: user.id,
       name: user.name2,
       receiverid: receiverId
     });
  });

  $$('.send-message').on('click', function () {
    // Message text
    if (!socket.serverConnected) return;
    var messageText = messageBar.value().trim();
    if (messageText.length === 0) return;
       // Empty messagebar
    messageBar.clear();
    var request = {
      senderid: user.id,
      receiverid: receiverId,
      roomid: eventId,
      message: messageText,
    };
    var nocache = "?t="+moment().unix();
    $$.ajax({
      timeout: 5 * 1000,
      async: true,
      url: config.server + "/chat/sendmessage/" +nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var messageData = JSON.parse(data);
          messages.addMessage({
           text: escapeText(messageText),
           type: "sent",
           name: user.name2,
           messageId: messageData.message_id,
           day: !conversationStarted ? 'Today' : false,
           time: !conversationStarted ? moment(new Date()).format("h:mm a") : false
         });
         conversationStarted = true;
        }

      },
      error: function (xhr, status){
      },
    });


     //socket.emit('new-message', {msg: messageText});
  });
});

var socketManager = function() {
  socket.on('connected', function(socketid) {
    var request = {
      socketid: socketid,
      userid: user.id
    };
    var nocache = "?t="+moment().unix();
    $$.ajax({
      timeout: 5 * 1000,
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
        alert("could not connect to chat");
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
     if (thisPage.name == "chat-window") {
       if (data.room == thisPage.context.eventId || data.sender_id == thisPage.context.receiver) {
         //add message
         messages.addMessage({
           text: data.message,
           type:"received",
           messageId: messageData.message_id,
           name: data.sender_firstname,
           day: !conversationStarted ? 'Today' : false,
           time: !conversationStarted ? moment(new Date()).format("h:mm a")  : false
         });
         conversationStarted = true;
       }
     }
     socket.emit('message-delivered', {
      messageid: data.message_id
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
    timeout: 5 * 1000,
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
