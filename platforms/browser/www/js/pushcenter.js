var initializePushMessaging = function() {
  push = PushNotification.init({
    android: {
        senderID: config.push.androidId,
        sound:true,
        icon:"notification_icon",
        iconColor: "blue",
        forceShow: true,
    },
    browser: {
        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    },
    ios: {
        alert: "true",
        badge: true,
        sound: 'true'
    },
  });



  push.on('registration', function(data) {
    if (!user || !user.id) {
      return;
    }
    data.device = device;
    data.userid = user.id;
    console.log(data);
    var result;
    $$.ajax({
      async: true,
      cache: false,
      url: config.server + "/api/registerdevice/",
      method: "POST",
      timeout: 30 * 1000,
      contentType: "application/x-www-form-urlencoded",
      data: data,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          console.log("device registered");

        }
      },
      error: function(status, xhr) {
        //app.alert(language.SYSTEM.PUSH_REGISTRATION_ERROR);

      },
    });
  });

  push.on('notification', function(data) {
    console.log(data);
    var payload = data.additionalData;


    var pushFinised = function () {
      push.finish(function() {
          console.log('success');
      }, function() {
          console.log('error');
      }, payload.notId);
    };

    switch(Number(payload.pushSwitch)) {
      case 1: //message push
        push.pushIds = JSON.parse(storage.getItem('pushIds'));
        if (!push.pushIds) push.pushIds = [];
        if (_.indexOf(push.pushIds, payload.info.id) < 0) {
          push.pushIds.push(payload.info.id);
          chatService.storeMessages([payload.info], false, function(err) {
            if (appActive) {
              var badge = Number($$('.chatrooms .icon-chats .badge').html());
              if (!badge) {
                $$('.chatrooms .icon-chats').html('<span class="badge bg-green">1</span>');
              } else {
                $$('.chatrooms .icon-chats .badge').html(badge + 1);
              }
            }
            storage.setItem('pushIds', JSON.stringify(push.pushIds));
            pushFinised();
          });
        } else {
          chatService.openChat(payload.info.receiver_id, payload.info.name, payload.info.isevent, function(err) {
            push.pushIds = _.without(push.pushIds, payload.info.id);
            storage.setItem('pushIds', JSON.stringify(push.pushIds));
            pushFinised();
          });
        }
      break;

      case 2:
        updateLocalCode(payload.info.code, payload.info.scannedTime, 1, function(err) {
          pushFinised();
        });
      break;
      default:
        pushFinised();
      break;

    }
  });

  push.on('error', function(e) {
    console.log("push error "+e.message);
  });
};
