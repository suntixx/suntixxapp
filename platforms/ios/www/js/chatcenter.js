app.onPageInit('open-chats', function(page) {

  /*if (page.context.unread > 0) {
    $$('.chatrooms .icon-chats').html('<span class="badge bg-green">'+ page.context.unread +'</span>');
  } else {
    $$('.chatrooms .icon-chats').empty();
  }*/


  $$('.start-chatting').on('click', function() {
    var receiverId = $$(this).attr("room");
    var receiverName = $$(this).attr("receiver-name");
    var isEvent = $$(this).attr("isevent");
    isEvent = isEvent == "1" ? true : false;
    chatService.startChat(receiverId, receiverName, isEvent);
  });

  $$('.swipeout').on('swipeout:delete', function () {
    var room = $$(this).attr('room');
    chatService.deleteChat(room);
  });


});

app.onPageInit('chat-window', function(page) {
  var receiverId = page.context.receiver;
  var isEvent = false;
  if (page.context.isevent == true || page.context.isevent == 'true') {
    isEvent = true;
    $$(document).find('#right-panel-menu').html(Menus.chatRoom);
  } else {
    $$(document).find('#right-panel-menu').html(Menus.privateChat);
  }
  var todayShowed = page.context.todayShowed;

  var messageBar = app.messagebar('.messagebar', {maxHeight:200});
  var messages = app.messages('.messages', {
    autoLayout: true,
    messages: page.context.messages,
    messageTemplate: '{{#if day}}'+
                        '<div class="messages-date">{{day}}</div>'+
                      '{{/if}}'+
                      '<div class="message-link link" id="message-link-{{id}}">'+
                        '<div class="message message-{{type}} {{#if hasImage}}message-pic{{/if}}">'+
                          '<div class="message-name">{{name}}'+
                            '{{#if SenderType}}&nbsp;'+
                              '({{#js_compare "this.SenderType == 1"}}'+language.EVENTS.PROMOTER+ '{{else}}' +language.EVENTS.COMMITTEE+ '{{/js_compare}})'+
                            '{{/if}}'+
                          '</div>'+
                          '<div class="message-text">{{text}}</div>'+
                          '<div class="message-failed"></div>'+
                          '<div class="message-label">{{messageTime created_at}}</div>'+
                        '</div>'+
                      '</div>',

  });



  $$(page.container).on('taphold', '.message-link', function() {
    var messageLinkId = $$(this).attr("id");
    $$('#'+messageLinkId).toggleClass("message-selected");
    if ($$(page.container).find('.message-selected').length > 0) {
      chatService.showTools();
    } else {
      chatService.hideTools();
    }
  });


  $$(document).on('click', '.close-message-toolbar', function() {
    $$('.message-link').removeClass('message-selected');
    chatService.hideTools();
  });


  $$(document).on('click', '.clear-chat', function() {
    var messagesToDelete = [];
    $$(document).find('.message-link').each(function(item) {
      messagesToDelete.push($$(this).attr('id'));
    });
    chatService.deleteMessages(messagesToDelete, function(err) {
      if (err) {

      } else {
        messages.claer();
      }
    });
  });

  $$(document).on('click', '.delete-messages', function () {
    var messagesToDelete = [];
    $$(document).find('.message-selected').each(function(item) {
      messagesToDelete.push($$(this).attr('id'));
    });
    chatService.deleteMessages(messagesToDelete, function(err) {
      if (err) {

      } else {
        messages.removeMessages($$(document).find('.message-selected'));
        chatService.hideTools();
      }
    });

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
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      cache: false,
      url: config.server + "/chat/getmembers/",
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


  $$('.close-chat').on('click', function () {
    chatService.getChats();
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
          chatService.getChats();
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
            chatsView.router.load({
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
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      cache: false,
      url: config.server + "/api/event/" + receiverId,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var result = JSON.parse(data);
          if (result && result.id>0) {
            app.showTab('#homepage-tab');
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


  $$('.send-message').on('click', function () {
    // Message text
    var messageText = escapeText(messageBar.value().trim());
    if (messageText.length === 0) return;
       // Empty messagebar
    messageBar.clear();
    var messageId = 'local-'+moment();
    var message = {
      id : messageId,
      text: messageText,
      created_at: moment(new Date()).format(),
      name: language.CHATS.ME,
      day: todayShowed ? false : 'Today',
      type: "sent",
      Time: moment(new Date()).format("h:mm a"),
      receiver_id: receiverId,
      isevent: isEvent
    };
    todayShowed = true;
    //console.log($$('.messages').html());
    chatService.storeMessages([message], true, function(err) {
      if (err) {
        app.alert(language.CHATS.CHAT_ERROR);
      }
      messages.addMessage(message);
      chatService.sendMessage(messageId, messageText, receiverId, isEvent);
    });
    //chatService.sendMessage(messageId, messageText, receiverId, isEvent);
  });

  $$(document).on('click', '.resend-message', function() {
    var messageId = $$(this).attr("message-id");
    var messageText = $$(document).find('#'+messageId+ ' .message .message-text').text();
    chatService.sendMessage(messageId, messageText, receiverId, isEvent, true);
  });
});

var escapeText = function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 };
