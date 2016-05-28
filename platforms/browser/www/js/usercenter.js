app.onPageInit('create-new-user', function(page) {
  // $$('.form-error').hide();
  $$('input#user-country').on('focus', function() {
    var userCountry = appPickers.countries('user-country');
    userCountry.open();
  });

  $$('input#title-field').on('focus', function () {
    var titlePicker = appPickers.userTitle();
    titlePicker.open();
  });

  $$('.create-user').on('click', function() {
    //alert('here');
    if (!userService.validateForm('#create-new-user-form') ) {return;}
    //if (!userService.validateForm('#create-new-user-form')) return;
    var request = app.formToJSON('#create-new-user-form');
    request.captcha = config.secret;
    user = JSON.parse(Server.registerUser(request));
    Template7.global.user = user;
  });

  var cropper;
  var originalImage;
  $$('.edit-image').on('click', function() {
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert("Camera Error: " + err);
    }, cameraOptions);
  });

  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');

    var options = new FileUploadOptions();
    options.fileName = Math.random() + '.jpg';
    options.mimeType = "image/jpeg";
    options.fileKey = "file";
    options.httpMethod = "POST";
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
    };
    ft.upload(originalImage, encodeURI(Server.userImageUpload), function(data) {
      app.hideProgressbar();
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
      var result = JSON.parse(Server.userImageSave(request));
    }, function (err) {
      app.hideProgressbar();
      err = JSON.stringify(err);
      app.alert("Unable to upload image: "+ err);
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
    Server.updateUser(formData);
  });
});

app.onPageInit('update-details', function (page) {
  $$('#right-panel-menu').html(Menus.user);
  app.formFromJSON('#update-details-form', user);

  $$('input#title-field').on('focus', function () {
    var titlePicker = appPickers.userTitle();
    titlePicker.open();
  });

  $$('input#user-country').on('focus', function() {
    var userCountry = appPickers.countries('user-country');
    userCountry.open();
  });

  $$('.save-user').on('click', function () {
    if (!userService.validateForm('#update-details-form') ) {return;}
    var formData = app.formToJSON('#update-details-form');
    Server.updateUser(formData);
  });

  var cropper;
  var originalImage;
  $$('.change-image').on('click', function() {
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert("Camera Error: " + err);
    }, cameraOptions);
  });

  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');

    var options = new FileUploadOptions();
    options.fileName = Math.random() + '.jpg';
    options.mimeType = "image/jpeg";
    options.fileKey = "file";
    options.httpMethod = "POST";
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
    };
    ft.upload(originalImage, encodeURI(Server.userImageUpload), function(data) {
      app.hideProgressbar();
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
      var result = JSON.parse(Server.userImageSave(request));
    }, function (err) {
      app.hideProgressbar();
      err = JSON.stringify(err);
      app.alert("Unable to upload image: "+ err);
    }, options);
  });
});

app.onPageInit('update-organization', function(page) {
  $$('.save-user').on('click', function() {
    if (!userService.validateForm('#update-organization-form') ) {return;}
    if ( Server.orgUrlAvailable( $$(this).val().trim()) == "false") { return;}
    var data = app.formToJSON('#update-organization-form');
    var request = userService.createUpdateRequest ({
      area: "organization",
      data: data,
    });
    request.captcha = config.secret;
    user = JSON.parse(Server.updateUser(request));
  });

  $$('#orgurl').on('keyup keydown change', function() {
    //var isAvailable = Server.orgUrlAvailable($$(this).val());
    if ( Server.orgUrlAvailable( $$(this).val().trim()) == "true") {
      $$('.url-check').removeClass('icon-wrong');
      $$('.url-check').addClass('icon-checked-green');
    } else {
      $$('.url-check').addClass('icon-wrong');
      $$('.url-check').removeClass('icon-checked-green');
    }
  });
});

app.onPageInit('update-venue', function(page) {
  $$('.save-user').on('click', function() {
    if (!userService.validateForm('#update-venue-form') ) {return;}
    var data = app.formToJSON('#update-venue-form');
    var request = userService.createUpdateRequest ({
      area: "venue",
      data: data,
    });
    request.captcha = config.secret;
    user = JSON.parse(Server.updateUser(request));
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
    user = JSON.parse(Server.updateUser(request));
  });
});

$$(document).on('click', '.login-submit', function(){
  //
  app.closeModal('.login-screen');
  var formData = app.formToJSON('#loginForm');
  if (formData.server == "Live") {
    config.server = "https://www.suntixx.com";
  }
  user = JSON.parse(Server.loginUser(formData));
  //alert(requestedArea);
  //alert(JSON.stringify(user));
  if (user.id > 0) {
    showAvatar();
    Template7.global.user = user;
    $$(document).find('.logout-menu').show();
    //alert(requestedPage);
    if (requestedPage) {
      if (requestedPage == "events") {
        eventsMenuClick(requestedArea);
      } else if (requestedPage == "tickets") {
        ticketsMenuClick();
      } else if (requestedPage == "user") {
        userMenuClick();
      }

    }
    //storage.setItem('userId', user.id);
  //  storage.setItem('userEmail', user.email);
    //return true;
  //  app.hidePreloader();
  }
  //return false;
});

$$(document).on('click','.cancel-login', function(){
  app.closeModal('.login-screen');
});


$$(document).on('click','.logout',  function () {
  //localStorage.clear();
  user = null;
  Template7.global.user = null;
  Server.logoutUser();
  showLoginOrCreate();
});

$$(document).on('click','.login',  function () {
  app.loginScreen();
});

$$(document).on('click','.forgot-password',  function () {
  app.alert("Not configured Yet! :)");
});

$$(document).on('click','.create-user',  function () {
    mainView.router.load({
      url: 'views/user/create-user.html'
    });
});

$$(document).on('click','.back-user', function () {
  //$$(document).find('.view-form').hide();
  //$$(document).find('.view-main').show();
  mainView.router.back({
    url: 'views/user/update-details.html',
    ignoreCache: true,
    force: true,
    context:user,
  });
});
