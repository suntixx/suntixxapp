var pushHandlers = function(permission) {
  if (permission.isEnabled && user) {
    push.on('registration', function(data) {
      data.device = device;
      data.userid = user.id;
      console.log(data);
      var nocache = "?t="+moment().unix();
      var result;
      $$.ajax({
        async: true,
        url: config.server + "/api/registerdevice/"+ nocache,
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
          app.alert(language.SYSTEM.PUSH_REGISTRATION_ERROR);

        },
      });
    });

    push.on('notification', function(data) {
      console.log(data);
      push.setApplicationIconBadgeNumber(function() {
        console.log('badge set success');
      }, function() {
          console.log('badge set error');
      }, data.count);

      push.finish(function() {
          console.log('success');
      }, function() {
          console.log('error');
      }, 'push-1');
    });

    push.on('error', function(e) {
      console.log("push error "+e.message);
    });
  }
};
