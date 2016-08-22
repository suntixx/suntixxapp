var showAvatar = function () {
  var organization = '' ;
  if (user.organization_id && user.organization) {
    organization = user.organization.name;
  }
  var userFullname = user.fullname ? user.fullname: user.name2+ " "+user.name4;
  var html = '<div class="list-block media-list user-avatar">' +
              '<ul>' +
               '<li class="item-content">' +
                  '<div class="item-media">' +
                    '<img class="user-image" src="' + config.server + '/thumbnails/users/' + user.id + '/portrait.png" width="44">' +
                  '</div>' +
                  '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title">' +userFullname+'</div>' +
                    '</div>' +
                    '<div class="item-subtitle">' + organization + '</div>' +
                  '</div>' +
                '</li>' +
              '</ul>' +
            '</div>';
            //alert(html);
  $$(document).find('#user-avatar').html(html);
  $$(document).find('.logout-menu').show();
};

var showLoginOrCreate = function () {
  var html = '<div class="list-block media-list">' +
              '<ul>' +
               '<li class="item-content"><a href="#" class="login link close-panel">' +
                  '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title color-orange"><i class="icon icon-login"></i>Sign In</div>' +
                    '</div>' +
                  '</div>' +
                '</a></li>' +
                '<li class="item-content"><a href="#" class="create-new-user link close-panel">' +
                   '<div class="item-inner">' +
                     '<div class="item-title-row">' +
                       '<div class="item-title color-orange"><i class="icon icon-register"></i>Create Account</div>' +
                     '</div>' +
                   '</div>' +
                 '</a></li>' +
              '</ul>' +
            '</div>';
  $$(document).find('#user-avatar').html(html);
  $$(document).find('.logout-menu').hide();
};
if(user) {
  checkLogin();
} else {
  showLoginOrCreate();
}

document.addEventListener('online', checkLogin, false);
function checkLogin () {

  console.log("loggin in");
  if (user && Number(user.id) > 0) {
    var nocache = "?t="+moment().unix();
    if(user.social_id && user.social && facebookConnectPlugin) {
      //getLoginStatus
      app.showIndicator();
      facebookConnectPlugin.getLoginStatus(function(success) {
          if(success.status === 'connected'){
            //do nothing
            app.hideIndicator();
            success.background = true;
            userService.facebookLoginSuccess(success);

          } else {
            app.hideIndicator();
            showLoginOrCreate();
            user = null;
            Template7.global.user  = null;
            app.addNotification({
              message: language.USER_AREA.FACEBOOK_ERROR,
              hold: 2000,
            });
          }
      });
      //return;
    } else {
      user.password = storage.getItem('userPassword');
      app.showIndicator();
      var result = {};
      $$.ajax({
        async: true,
        url: config.server + "/api/userinfo" + nocache,
        method: "POST",
        timeout: 20 * 1000,
        contentType: "application/x-www-form-urlencoded",
        data: user,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            app.hideIndicator();
            user = JSON.parse(data);
            if (user.mobilephone == "" || user.mobilephone == "null" || user.mobilephone == null) {
              mainView.router.load({
                url: 'views/user/complete-registration.html',
              });
            } else {
              showAvatar();
              storage.setItem('userData', JSON.stringify(user));
              Template7.global.user = user;
              //socket = io.connect(config.server);
              //socket.on('connect', socketManager);
            }
          }

        },
        error: function (xhr, status){
          app.hideIndicator();
          showLoginOrCreate();
          user = null;
          Template7.global.user  = null;
          app.addNotification({
            message: language.SYSTEM.SERVER_ERROR,
            hold: 2000,
          });
        },
      });
    }
  } //else {
  //  user = null;
  //  storage.removeItem("userId");
  //  storage.removeItem("userEmail");
  //  storage.removeItem("userPassword");
  //  Template7.global.user = null;
//  }
}
//checkLogin();

app.onPageInit('create-new-user', function(page) {

  var today = new Date();
  $$('#new-birth-date').val(moment(today).format('YYYY-MM-DD'));

  var userCountry = appPickers.countries('new-user-country');
  $$('#new-user-country').on('click', function() {
    userCountry.open();
  });

  var titlePicker = appPickers.userTitle();
  $$('input#title-field').on('click', function () {
    titlePicker.open();
  });

  $$('.create-user').on('click', function() {
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if (!userService.validateForm('#create-new-user-form') ) {return;}
    //if (!userService.validateForm('#create-new-user-form')) return;
    var request = app.formToJSON('#create-new-user-form');
    if (!request.name3 || request.name3 == "") {
      request.name3 = ' ';
    }
    storage.setItem('userPassword', request.password);
    request.captcha = config.secret;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Registering User");
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/register/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          user = JSON.parse(data);
          storage.setItem('userData', JSON.stringify(user));
          Template7.global.user = user;
          app.hidePreloader();
          showAvatar();
          mainView.router.loadPage('home.html');
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        storage.setItem('userPassword', null);
        app.alert("Registration Failed!");
      },
    });
  });

  var cropper;
  var originalImage;
  $$('.edit-image').on('click', function() {
    //if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
    //  app.alert("Image upload is only supported for Android version 5.0 and greater");
    //  return;
  //  }
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      if (!originalImage || originalImage == "") {
        app.alert("Unable to open Image");
        return;
      }
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert(err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;
  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');

    var options = new FileUploadOptions();
    options.fileName = Math.random() + '.jpg';
    options.mimeType = "image/jpeg";
    options.fileKey = "file";
    options.httpMethod = "POST";
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
      // alert(JSON.stringify(options));
       //alert(originalImage);
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
      uploading = true;
    };
    ft.upload(originalImage, encodeURI(Server.userImageUpload), function(data) {

    //  app.hideProgressbar();
      //data = JSON.parse(data.response.path);
      var item = {
        cropX: Math.round(imageData.x),
        cropY: Math.round(imageData.y),
        cropW: Math.round(imageData.width),
        cropH: Math.round(imageData.height)
      };

      data = data.response.split(':');
      var path = data[1];
      path = path.substring(1, path.length - 2 );
      //alert(path);
      //$$('#user-image-id').prop('src', imageURI);
      $$('#user-imagePath').val(path);
      var request = {
        src: path,
        imgType: 'users',
        userId: user.id,
        images: [item],
      };
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 20 * 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          }
          app.hideProgressbar();
          uploading = false;
        },
        error: function(status, xhr) {
          app.hideProgressbar();
          uploading = false;
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
      uploading = false;
      err = JSON.stringify(err);
      //alert(err);
      if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
        app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
      } else {
        app.alert("Oops! Something went wrong. Please Try Again.");
      }
    }, options);
  });

});


app.onPageInit('update-preferences', function (page) {
  var preferences = [];
  if (user.preferences != null) {
    preferences = user.preferences.split(',');
  }

  if (preferences.length > 0) {
    $$('input[type="checkbox"]').each(function () {
      var pref = $$(this).val();
      if (preferences.indexOf(pref) >= 0) {
        $$(this).prop('checked', true);
      }
    });
  }

  $$('.save-user').on('click', function () {
    var formData = app.formToJSON('#update-preferences-form');
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/register/" + user.id +nocache,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: formData,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          storage.setItem('userData', JSON.stringify(user));
          app.hidePreloader();
          mainView.router.loadPage('home.html');
          //alert(satus + " " +JSON.stringify(result));
        }

      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Update Failed!");
      },
    });
  });
});

app.onPageInit('user-profile', function(page) {
  var thisProfile = page.context;
  thisProfile.notMe = true;

  if(thisProfile.isOrg) {
    $$('.profile').html(Template7.templates.userOrganizationTemplate(thisProfile));
  } else {
    $$('.profile').html(Template7.templates.userProfileTemplate(thisProfile));
  }
});

app.onPageInit('profile', function(page) {
  //var thisProfile = user;
  //alert(JSON.stringify(thisProfile.id));
  $$('#right-panel-menu').html(Menus.user);
  if (user.social_id) {
    $$('.facebook-menu').addClass('delete-facebook-integration');
    $$('.facebook-menu .item-title').html(language.USER_AREA.MENU.REMOVE_FACEBOOK);
  } else {
    $$('.facebook-menu').addClass('add-facebook-integration');
    $$('.facebook-menu .item-title').html(language.USER_AREA.MENU.ADD_FACEBOOK);
  }

  $$('.home').on('click', function () {
    mainView.router.back ({
      url: 'home.html',
      force: true,
      ignoreCache: true,
    });
  });

  $$('.delete-facebook-integration').on('click', function() {
    app.confirm('Do you really want to remove integration with Facebook',
      function() {
        facebookConnectPlugin.getLoginStatus(function(success) {
          if(success.status === 'connected') {
            facebookConnectPlugin.logout(userService.facebookLogoutSuccess, userService.facebookLogoutFail);
          }
        });
      });
  });

  $$('.add-facebook-integration').on('click', function() {
    facebookConnectPlugin.getLoginStatus(function(success) {
        if(success.status === 'connected'){
          //do nothing
          app.alert(language.USER_AREA.FACEBOOK_ALREADY_AUTHORIZED);
        } else {
          facebookConnectPlugin.login(userService.facebookPermissions, userService.facebookLoginSuccess, userService.facebookLoginFail);
        }
    });
  });



  $$('.open-chat').on('click', function() {
    var receiverId = $$(this).attr("user-id");
    mainView.router.load({
      url: 'views/user/chat.html',
      context : {receiver: receiverId},
    });
  });

  var loadUser = function() {
    $$('.profile').html(Template7.templates.userProfileTemplate(user));
    $$('.user-organization').on('click', loadOrganization);
  };

  var loadOrganization = function() {
    $$('.profile').html(Template7.templates.userOrganizationTemplate(user));
    $$('.user-personal').on('click', loadUser);
  };

  $$('#userDetailsTab').on('show', function() {
    loadUser();
    $$('.profile-page-title').text(language.USER_AREA.PROFILE);
    $$('.user-personal').on('click', loadUser);
    $$('.user-organization').on('click', loadOrganization);
  });

  $$('.profile').html(Template7.templates.userProfileTemplate(user));
  $$('.user-organization').on('click', loadOrganization);
  $$('.user-personal').on('click', loadUser);


  $$('#userFriendsTab').on('show', function() {
    $$('.profile-page-title').text(language.USER_AREA.FRIENDS);
    $$('#userFriendsTab').html(Template7.templates.userFriendsTemplate(user));

    $$('.add-facebook-integration').on('click', function() {
      facebookConnectPlugin.getLoginStatus(function(success) {
          if(success.status === 'connected'){
            //do nothing
            app.alert(language.USER_AREA.FACEBOOK_ALREADY_AUTHORIZED);
          } else {
            facebookConnectPlugin.login(userService.facebookPermissions, userService.facebookLoginSuccess, userService.facebookLoginFail);
          }
      });
    });

    $$('.message-friend').on('click', function() {
      var receiverId = $$(this).attr("friend-id");
      mainView.router.load({
        url: 'views/user/chat.html',
        context : {receiver: receiverId},
      });
    });

    $$('.show-friend-profile').on('click', function() {
      var friendId = $$(this).attr("friend-id");
      var friendProfile = SEARCHJS.matchArray(user.friends, {id: parseInt(friendId)});
      mainView.router.load({
        url: 'views/user/user-profile.html',
        context: friendProfile[0],
      });
    });
  });



  $$('#userActivityTab').on('show', function() {
    $$('.profile-page-title').text(language.USER_AREA.ACTIVITY);
  });

  $$('#userChatsTab').on('show', function() {
    $$('.profile-page-title').text(language.USER_AREA.CHATS.CHATS);
    $$('#userChatsTab').html(Template7.templates.userChatsTemplate(user));
  });
});

app.onPageInit('update-details', function (page) {
  //$$('#right-panel-menu').html(Menus.user);
  app.formFromJSON('#update-details-form', user);
  $$('#birth-date').val(moment(user.birth).format('YYYY-MM-DD'));
  var titlePicker = appPickers.userTitle();
  $$('input#title-field').on('click', function () {
    titlePicker.open();
  });

  var userCountry = appPickers.countries('user-country');
  $$('#user-country').on('click', function() {
    userCountry.open();
  });

  $$('.home').on('click', function () {
    mainView.router.back ({
      url: 'home.html',
      force: true,
      ignoreCache: true,
    });
  });

  $$('.save-user').on('click', function () {
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if (!userService.validateForm('#update-details-form') ) {return;}
    var formData = app.formToJSON('#update-details-form');
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: formData,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          storage.setItem('userData', JSON.stringify(user));
          app.hidePreloader();
          mainView.router.back({
            url: 'views/user/profile.html',
            context: user,
            force: true,
          });
        } else {
          app.hidePreloader();
          app.alert("User Update Failed!");
        }

      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Update Failed!");
      },
    });
  });

  var cropper;
  var originalImage;
  $$('.change-image').on('click', function() {
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      if (!originalImage || originalImage == "") {
        app.alert("Unable to open Image");
        return;
      }
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert(err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;
  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');
    var options = new FileUploadOptions();
    options.fileName = Math.random() + '.jpg';
    options.mimeType = "image/jpeg";
    options.fileKey = "file";
    options.httpMethod = "POST";
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
      uploading = true;
    };
    ft.upload(originalImage, encodeURI(Server.userImageUpload), function(data) {
      //app.hideProgressbar();
      //data = JSON.parse(data.response.path);
      var item = {
        cropX: Math.round(imageData.x),
        cropY: Math.round(imageData.y),
        cropW: Math.round(imageData.width),
        cropH: Math.round(imageData.height)
      };

      data = data.response.split(':');
      var path = data[1];
      path = path.substring(1, path.length - 2 );
      //alert(path);
      //$$('#user-image-id').prop('src', imageURI);
      $$('#user-imagePath').val(path);
      var request = {
        src: path,
        imgType: 'users',
        userId: user.id,
        images: [item],
      };
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 20 * 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          }
          uploading = false;
          app.hideProgressbar();
        },
        error: function(status, xhr) {
          app.hideProgressbar();
          uploading = false;
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
      uploading = false;
      console.log(JSON.stringify(err));
      if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
        app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
      } else {
        app.alert("Oops! Something went wrong. Please Try Again.");
      }
    }, options);
  });
});

app.onPageInit('complete-facebook-registration', function(page) {
  var thisContext = page.context;
  app.formFromJSON('#create-new-facebook-user-form', page.context);

  var titlePicker = appPickers.userTitle();
  $$('input#title-field').on('click', function () {
    titlePicker.open();
  });


  var userCountry = appPickers.countries('reg-user-country');
  $$('#reg-user-country').on('click', function() {
    userCountry.open();
  });

  $$('.save-user').on('click', function() {
    if (!userService.validateForm('#create-new-facebook-user-form') ) {return;}
    //if (!userService.validateForm('#create-new-user-form')) return;
    var request = app.formToJSON('#create-new-facebook-user-form');
    storage.setItem('userPassword', request.password);
    if (!request.name3 || request.name3 == "") {
      request.name3 = ' ';
    }
    request.captcha = config.secret;
    request.facebook = thisContext.facebook;
    request.password = "nopassword";
    request.admin =  0;
    request.deleted = 0;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Registering User");
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/register/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          user = JSON.parse(data);
          storage.setItem('userData', JSON.stringify(user));
          Template7.global.user = user;
          app.hidePreloader();
          showAvatar();
          mainView.router.loadPage('home.html');
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        storage.setItem('userPassword', null);
        app.alert("Registration Failed!");
      },
    });
  });

  $$('.cancel-registration').on('click', function () {
    app.confirm("If you don't complete registration, you will be logged out",
      function () {
        storage.removeItem("userId");
        storage.removeItem("userData");
        storage.removeItem("userPassword");
        user = null;
        Template7.global.user = null;
        showLoginOrCreate();
        facebookConnectPlugin.logout(userService.facebookLogoutSuccess, userService.facebookLogoutFail);
        /*mainView.router.loadPage("home.html");
        var nocache = "?t="+moment().unix();
        app.showPreloader("Logging Out");
        $$.ajax({
          timeout: 20 * 1000,
          async: true,
          url: config.server + "/api/user/logout" + nocache,
          method: "POST",
          contentType: "application/x-www-form-urlencoded",
          //header: {"Get-Cookie" : storedUser.session},
          success: function(data, status, xhr) {
            app.hidePreloader();
            if (status == 200 || status == 0 ){
              facebookConnectPlugin.logout(userService.facebookLogoutSuccess, userService.facebookLogoutFail);
            }
          },
          error: function(status, xhr) {
            app.hidePreloader();
            facebookConnectPlugin.logout(userService.facebookLogoutSuccess, userService.facebookLogoutFail);
          },
        });*/
      }
    );
  });

  var synchronizeUser = function() {
    app.modalLogin(language.USER_AREA.EMAIL_PASSWORD,
    function(email, password) {
      var nocache = "?t="+moment().unix();
      app.showIndicator();
      $$.ajax({
        timeout: 20 * 1000,
        async: true,
        url: config.server + "/api/verifyuser" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: {
          email: email,
          password: password,
        },
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            user = JSON.parse(data);
            userService.facebookLoginSuccess( {authResponse: page.context.facebook});
          }
        },
        error: function(xhr, status) {
          app.hideIndicator();
          app.modal({
            title: config.appName,
            text: language.USER_AREA.FORGOT_PASSWORD_FAILED,
            verticalButtons: true,
            buttons: [
              {
                text: language.OTHER.CANCEL,
                close: true,
              },
              {
                text: language.USER_AREA.FORGOT_PASSWORD,
                close:true,
                onClick: function() {
                   forgotPassword();
                //  forgotPassword.trigger();
                },
              },
              {
                text: language.OTHER.TRY_AGAIN,
                close: true,
                onClick: function() {
                  synchronizeUser();
                },
              },
            ],
          });
        }
      });
    });
  };

 $$('.synchronize-user-profiles').on('click', synchronizeUser);

  var cropper;
  var originalImage;
  $$('.change-image').on('click', function() {
    //if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
    //  app.alert("Image upload is only supported for Android version 5.0 and greater");
    //  return;
    //}
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      if (!originalImage || originalImage == "") {
        app.alert("Unable to open Image");
        return;
      }
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert(err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;
  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');

    var options = new FileUploadOptions();
    options.fileName = Math.random() + '.jpg';
    options.mimeType = "image/jpeg";
    options.fileKey = "file";
    options.httpMethod = "POST";
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
      uploading = true;
    };
    ft.upload(originalImage, encodeURI(Server.userImageUpload), function(data) {
      //app.hideProgressbar();
      //data = JSON.parse(data.response.path);
      var item = {
        cropX: Math.round(imageData.x),
        cropY: Math.round(imageData.y),
        cropW: Math.round(imageData.width),
        cropH: Math.round(imageData.height)
      };

      data = data.response.split(':');
      var path = data[1];
      path = path.substring(1, path.length - 2 );
      //alert(path);
      //$$('#user-image-id').prop('src', imageURI);
      $$('#user-imagePath').val(path);
      var request = {
        src: path,
        imgType: 'users',
        userId: user.id,
        images: [item],
      };
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 20 * 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          }
          uploading = false;
          app.hideProgressbar();
        },
        error: function(status, xhr) {
          app.hideProgressbar();
          uploading = false;
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
      uploading = false;
      err = JSON.stringify(err);
      if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
        app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
      } else {
        app.alert("Oops! Something went wrong. Please Try Again.");
      }
    }, options);
  });
});

app.onPageInit('complete-registration', function (page) {
  if (page.context) {
    app.formFromJSON('#update-details-form', page.context);
  } else {
    app.formFromJSON('#update-details-form', user);
  }



  var titlePicker = appPickers.userTitle();
  $$('input#title-field').on('click', function () {
    titlePicker.open();
  });


  var userCountry = appPickers.countries('reg-user-country');
  $$('#reg-user-country').on('click', function() {
    userCountry.open();
  });

  $$('.cancel-registration').on('click', function () {
    app.confirm("If you don't complete registration, you will be logged out",
      function () {
        storage.removeItem("userId");
        storage.removeItem("userData");
        storage.removeItem("userPassword");
        user = null;
        Template7.global.user = null;
        showLoginOrCreate();
        mainView.router.loadPage("home.html");
        var nocache = "?t="+moment().unix();
        app.showPreloader("Logging Out");
        $$.ajax({
          timeout: 20 * 1000,
          async: true,
          url: config.server + "/api/user/logout" + nocache,
          method: "POST",
          contentType: "application/x-www-form-urlencoded",
          //header: {"Get-Cookie" : storedUser.session},
          success: function(data, status, xhr) {
            if (status == 200 || status == 0 ){
              // do nothing
              app.hidePreloader();
            }
          },
          error: function(status, xhr) {
            app.hidePreloader();
          }
        });
      },
      function () {
        //if user continues, do nothing
      }
    );
  });

  $$('.save-user').on('click', function () {
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if (!userService.validateForm('#update-details-form') ) {return;}
    var formData = app.formToJSON('#update-details-form');
    if (!formData.name3 || formData.name3 == "") {
      formData.name3 = ' ';
    }
    formData.admin =  0;
    formData.deleted = 0;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: formData,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          storage.setItem('userData', JSON.stringify(user));
          app.hidePreloader();
          mainView.router.load({
            url: 'home.html'
          });
          //alert(satus + " " +JSON.stringify(result));
        } else {
          app.hidePreloader();
          app.alert("User Update Failed!");
        }

      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Update Failed!");
      },
    });
  });

  var cropper;
  var originalImage;
  $$('.change-image').on('click', function() {
    //if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
    //  app.alert("Image upload is only supported for Android version 5.0 and greater");
    //  return;
    //}
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      if (!originalImage || originalImage == "") {
        app.alert("Unable to open Image");
        return;
      }
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert(err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;
  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');

    var options = new FileUploadOptions();
    options.fileName = Math.random() + '.jpg';
    options.mimeType = "image/jpeg";
    options.fileKey = "file";
    options.httpMethod = "POST";
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
      uploading = true;
    };
    ft.upload(originalImage, encodeURI(Server.userImageUpload), function(data) {
      //app.hideProgressbar();
      //data = JSON.parse(data.response.path);
      var item = {
        cropX: Math.round(imageData.x),
        cropY: Math.round(imageData.y),
        cropW: Math.round(imageData.width),
        cropH: Math.round(imageData.height)
      };

      data = data.response.split(':');
      var path = data[1];
      path = path.substring(1, path.length - 2 );
      //alert(path);
      //$$('#user-image-id').prop('src', imageURI);
      $$('#user-imagePath').val(path);
      var request = {
        src: path,
        imgType: 'users',
        userId: user.id,
        images: [item],
      };
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 20 * 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          }
          uploading = false;
          app.hideProgressbar();
        },
        error: function(status, xhr) {
          app.hideProgressbar();
          uploading = false;
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
      uploading = false;
      err = JSON.stringify(err);
      if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
        app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
      } else {
        app.alert("Oops! Something went wrong. Please Try Again.");
      }
    }, options);
  });
});


app.onPageInit('update-organization', function(page) {

  if (user.organization) {
    app.formFromJSON('#update-organization-form', user.organization);
  }

  $$('.save-user').on('click', function() {
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if (!userService.validateForm('#update-organization-form') ) {return;}
    if ( $$('.url-check').hasClass('icon-wrong') ) { return;}
    var data = app.formToJSON('#update-organization-form');
    data.description = data.description.replace(/\r?\n/g, '<br />');
    var request = userService.createUpdateRequest ({
      area: "organization",
      data: data,
    });
    request.captcha = config.secret;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          storage.setItem('userData', JSON.stringify(user));
          app.hidePreloader();
          mainView.router.back({
            url: 'views/user/profile.html',
            context: user,
            force: true,
          });
          //alert(satus + " " +JSON.stringify(result));
        } else {
          app.hidePreloader();
          app.alert("User Update Failed!");
        }

      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Update Failed!");
      },
    });
  });

  $$('#orgurl').on('keyup keydown change', function() {
    var url = $$(this).val().trim();
    var nocache = "&t="+moment().unix();
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/orgurl?orgUrl=" + url + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          if (data == "true") {
            $$('.url-check').removeClass('icon-wrong');
            $$('.url-check').addClass('icon-checked-green');
          } else {
            $$('.url-check').addClass('icon-wrong');
            $$('.url-check').removeClass('icon-checked-green');
          }
        } else {
          $$('.url-check').addClass('icon-wrong');
          $$('.url-check').removeClass('icon-checked-green');
        }
      },
      error: function (xhr, status){
        $$('.url-check').addClass('icon-wrong');
        $$('.url-check').removeClass('icon-checked-green');
      },

    });
  });

  var cropper;
  var originalImage;
  $$('.change-image').on('click', function() {
    //if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
    //  app.alert("Image upload is only supported for Android version 5.0 and greater");
    //  return;
    //}
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      if (!originalImage || originalImage == "") {
        app.alert("Unable to open Image");
        return;
      }
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert(err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;
  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');

    var options = new FileUploadOptions();
    options.fileName = Math.random() + '.jpg';
    options.mimeType = "image/jpeg";
    options.fileKey = "file";
    options.httpMethod = "POST";
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
      uploading = true;
    };
    ft.upload(originalImage, encodeURI(Server.userImageUpload), function(data) {
      //app.hideProgressbar();
      //data = JSON.parse(data.response.path);
      var item = {
        cropX: Math.round(imageData.x),
        cropY: Math.round(imageData.y),
        cropW: Math.round(imageData.width),
        cropH: Math.round(imageData.height)
      };

      data = data.response.split(':');
      var path = data[1];
      path = path.substring(1, path.length - 2 );
      //alert(path);
      //$$('#user-image-id').prop('src', imageURI);
      $$('#user-imagePath').val(path);
      var request = {
        src: path,
        imgType: 'organizations',
        userId: user.id,
        images: [item],
      };
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 20 * 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          }
          app.hideProgressbar();
          uploading = false;
        },
        error: function(status, xhr) {
          app.hideProgressbar();
          uploading = false;
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
      uploading = false;
      err = JSON.stringify(err);
      if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
        app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
      } else {
        app.alert("Oops! Something went wrong. Please Try Again.");
      }
    }, options);
  });
});

app.onPageInit('update-venue', function(page) {
  var venueAddress;
  if (user.venue) {
    venueAddress = user.venue.address +" "+user.venue.city+" "+user.venue.country;
    //alert(venueAddress);
    app.formFromJSON('#update-venue-form', user.venue);
  }
  var updateMapLink = function(data) {
    var latitude = data.latLng.lat();
    var longitude = data.latLng.lng();
    var newMapLink = "https://maps.google.com/?ie=UTF8&hq=&ll="+latitude+","+longitude+"&z=15";
    $$('#venue-maplink').val(newMapLink);
  };
  var map;
  geolocation.getCurrentPosition (function (position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    map = new GMaps({
      div: '#venue-map',
      lat: latitude,
      lng: longitude
    });
    GMaps.geocode({
      address: venueAddress,
      callback: function(results, status) {
        var latlng;
        if (status == 'OK') {
          latlng = results[0].geometry.location;
          map.setCenter(latlng.lat(), latlng.lng());
          updateMapLink( {
            latLng: {
              lat: latlng.lat,
              lng: latlng.lng,
            },
          });
          map.addMarker({
            lat: latlng.lat(),
            lng: latlng.lng(),
            title: 'My Venue',
            draggable: true,
            infoWindow: {
              content: '<p>My Venue</p>'
              },
            dragend: updateMapLink,
          });
        } else {
          var newMapLink = "https://maps.google.com/?ie=UTF8&hq=&ll="+latitude+","+longitude+"&z=15";
          $$('#venue-maplink').val(newMapLink);
          map.addMarker({
            lat: latitude,
            lng: longitude,
            title: 'My Location',
            draggable: true,
            infoWindow: {
              content: '<p>My Location</p>'
              },
            dragend: updateMapLink,
          });
        }
      }
    });
  }, function (err) {
  console.log ('geolocation error '+ JSON.stringify(err));
  map = new GMaps({
    div: '#venue-map',
  });
  GMaps.geocode({
    address: user.addresscountry,
    callback: function(results, status) {
      var latlng;
      latlng = results[0].geometry.location;
      map.setCenter(latlng.lat(), latlng.lng());
      updateMapLink( {
        latLng: {
          lat: latlng.lat,
          lng: latlng.lng,
        },
      });
      map.addMarker({
        lat: latlng.lat(),
        lng: latlng.lng(),
        title: 'My Venue',
        draggable: true,
        infoWindow: {
          content: '<p>My Venue</p>'
          },
        dragend: updateMapLink,
      });
    },
  });
}, { enableHighAccuracy: true, timeout: 30000 });

  var userCountry = appPickers.countries("user-venue-country");
  $$('#user-venue-country').on('click', function() {
    userCountry.open();
  });

  $$('.save-user').on('click', function() {
    if (!userService.validateForm('#update-venue-form') ) {return;}
    var data = app.formToJSON('#update-venue-form');
    var request = userService.createUpdateRequest ({
      area: "venue",
      data: data,
    });
    request.captcha = config.secret;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          storage.setItem('userData', JSON.stringify(user));
          app.hidePreloader();
          mainView.router.back({
            url: 'views/user/profile.html',
            context: user,
            force:true,
          });
        } else {
          app.hidePreloader();
          app.alert("User Update Failed!");
        }

      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Update Failed!");
      },
    });
  });
});

app.onPageInit('update-password', function(page) {
  $$('.save-user').on('click', function() {
    if (!userService.validateForm('#update-password-form') ) {return;}
    if (!userService.validatePasswords('#update-password-form')) {return;}
    var data = app.formToJSON('#update-password-form');
    var request = userService.createUpdateRequest ({
      area: "password",
      data: data,
    });
    request.captcha = config.secret;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200){

          user = JSON.parse(data);
          app.hidePreloader();
          storage.setItem('userData', JSON.stringify(user));
          storage.setItem('userPassword', user.password);
          mainView.router.back({
            url: 'views/user/profile.html',
            context: user,
            force:true,
          });
        } else {
          app.hidePreloader();
          app.alert("User Update Failed!");
        }

      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Update Failed!");
      },
    });
  });
});


//$$('.login-screen').on('open', function () {
var doLogin = function() {
  var formData = app.formToJSON('#loginForm');
  $$(document).find('.login-password').val("");
  storage.setItem('userPassword', formData.password);
  var nocache = "?t="+moment().unix();
  app.showPreloader("Logging In");
  var result = {};
  $$.ajax({
    async: true,
    url: config.server + "/api/userinfo" + nocache,
    method: "POST",
    timeout: 20 * 1000,
    contentType: "application/x-www-form-urlencoded",
    data: formData,
    success: function(data, status, xhr) {
      app.hidePreloader();
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        if (result && result.id > 0) {
          user = result;
          storage.setItem('userData', JSON.stringify(user));
          storage.setItem('userPassword', formData.password);
          //storage.setItem('userEmail', user.email);
          showAvatar();
          Template7.global.user = user;
          //socket = io.connect(config.server);
          //socket.on('connect', socketManager);
          $$(document).find('.logout-menu').show();
          if (user.mobilephone == "" || user.mobilephone == "null" || user.mobilephone == null) {
            mainView.router.load({
              url: 'views/user/complete-registration.html',
            });
          } else if (requestedPage) {
            if (requestedPage == "events") {
              eventsMenuClick(null, requestedArea);
            } else if (requestedPage == "tickets") {
              ticketsMenuClick();
            } else if (requestedPage == "user") {
              userMenuClick();
            }
          }
        }

      } else {
        app.alert("Oops! Something went wrong");
      }
    },
    error: function (xhr, status){
      app.hidePreloader();
      storage.removeItem("userPassword");
      app.alert("User Login Failed! Please check your email and/or password");
      return;
    },
  });
};

$$('.login-screen').on('keydown', function (e) {
  //$$(document).keypress(function (e) {
  if(e.which == 13) {
    app.closeModal('.login-screen');
    if (!navigator.onLine) {
      app.addNotification({
        message: "There was a problem connecting to the Internet.  Please check your connection",
      });
      return;
    }
    doLogin();
  }
  //});
});

$$('.login-submit').on('click', function(){
  if (!navigator.onLine) {
    app.addNotification({
      message: "There was a problem connecting to the Internet.  Please check your connection",
    });
    return;
  }
  doLogin();
});

$$('.create-new-account').on('click', function () {
  mainView.router.load({
    url: 'views/user/create-user.html'
  });
});

$$('.create-new-facebook-integration').on('click', function() {
  facebookConnectPlugin.getLoginStatus(function(success) {
      if(success.status === 'connected'){
        userService.facebookLoginSuccess(success);
        // The user is logged in and has authenticated your app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed request, and the time the access token
        // and signed request each expire
        console.log('getLoginStatus', JSON.stringify(success));
      } else {
        // If (success.status === 'not_authorized') the user is logged in to Facebook,
				// but has not authenticated your app
        // Else the person is not logged into Facebook,
				// so we're not sure if they are logged into this app or not.
        facebookConnectPlugin.login(userService.facebookPermissions, userService.facebookLoginSuccess, userService.facebookLoginFail);
      }
  });
});

var forgotPassword = function () {
  app.prompt('Enter your account email', function (value) {
    var request = {
      email: value,
    };
    app.showPreloader("Please Wait...");
    var nocache = "?t="+moment().unix();
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/forgotpassword" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      success: function(data, status, xhr) {
        if (status == 200){
          app.hidePreloader();
          result = JSON.parse(data);
          app.alert("An email has been sent to you you with the instructions to reset your password");
        }
        return;
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.modal({
          title: config.appName,
          text: language.USER_AREA.FORGOT_PASSWORD_FAILED,
          verticalButtons: true,
          buttons: [
            {
              text: language.OTHER.CANCEL,
              close: true,
            },
            {
              text: language.OTHER.TRY_AGAIN,
              //close:true,
              onClick: function() {
                forgotPassword();
              }
            },
          ]
        });
      },
    });
  });
};



$$('.forgot-password').on('click',  forgotPassword);


$$(document).on('click','.logout',  function () {
  //storage.removeItem("userId");
  storage.removeItem("userData");
  storage.removeItem("userPassword");
  user = null;
  Template7.global.user = null;
  showLoginOrCreate();
  mainView.router.loadPage("home.html");
  var nocache = "?t="+moment().unix();
  app.showPreloader("Logging Out");
  var result = {};
  $$.ajax({
    timeout: 20 * 1000,
    async: true,
    url: config.server + "/api/user/logout" + nocache,
    method: "POST",
    contentType: "application/x-www-form-urlencoded",
    //header: {"Get-Cookie" : storedUser.session},
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        app.hidePreloader();

      }

    },
    error: function (xhr, status){
      app.hidePreloader();
    },
  });
});

$$(document).on('click','.login',  function () {
  app.loginScreen();
});



$$(document).on('click','.create-new-user',  function () {
    mainView.router.load({
      url: 'views/user/create-user.html'
    });
});

$$(document).on('click','.back-user', function () {
  mainView.router.back({
    url: 'views/user/profile.html',
    //ignoreCache: true,
    force: true,
    context:user,
  });
});
