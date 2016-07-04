var showAvatar = function () {
  var name;
  if (user) {
    name = user.name2+" "+user.name4;
  }
  var organization = user.organization ? user.organization.name : '' ;

  var html = '<div class="list-block media-list user-avatar">' +
              '<ul>' +
               '<li class="item-content">' +
                  '<div class="item-media row">' +
                    '<img class="user-image" src="' + config.server + '/thumbnails/users/' + user.id + '/portrait.png" width="44">' +
                  '</div>' +
                  '<div class="item-inner row">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title">' + name.trim() +'</div>' +
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
showLoginOrCreate();


document.addEventListener('online', checkLogin, false);
function checkLogin () {
  if (user && Number(user.id) > 0 && !user.name2) {
    if (!navigator.onLine) {
      app.addNotification({
        message: "There was a problem connecting to the Internet.  Please check your connection",
      });
    } else {
      var nocache = "?t="+moment().unix();
      user.password = storage.getItem('userPassword');
      app.showIndicator();
      var result = {};
      $$.ajax({
        async: true,
        url: config.server + "/api/userinfo" + nocache,
        method: "POST",
        timeout: 10 * 1000,
        contentType: "application/x-www-form-urlencoded",
        data: user,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            user = JSON.parse(data);
            if (user.mobilephone == "" || user.mobilephone == "null" || user.mobilephone == null) {
              mainView.router.load({
                url: 'views/user/complete-registration.html',
              });
            } else {
              showAvatar();
            }
          }
          app.hideIndicator();
        },
        error: function (xhr, status){
          app.hideIndicator();
          app.addNotification({
            message: "Failed to sycronize with Sun Tixx Server! You may need to login again",
            hold: 1500,
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
checkLogin();

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
    //alert('here');
    if (!userService.validateForm('#create-new-user-form') ) {return;}
    //if (!userService.validateForm('#create-new-user-form')) return;
    var request = app.formToJSON('#create-new-user-form');
    request.captcha = config.secret;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Registering User");
    var result = {};
    $$.ajax({
      timeout: 5 * 1000,
      async: true,
      url: config.server + "/api/register/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          user = JSON.parse(data);
          Template7.global.user = user;
          app.hidePreloader();
          mainView.router.loadPage('home.html');
        } else {
          app.hidePreloader();
          app.alert("Registration Failed!");
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
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
      app.alert("Camera Error: " + err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
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
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
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
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 10 * 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          } else {
            app.alert("There was an error saving your image");
          }
        },
        error: function(status, xhr) {
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
      err = JSON.stringify(err);
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
      timeout: 5 * 1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: formData,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          app.hidePreloader();
          mainView.router.loadPage('home.html');
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
});

app.onPageInit('update-details', function (page) {
  $$('#right-panel-menu').html(Menus.user);
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
    if (!userService.validateForm('#update-details-form') ) {return;}
    var formData = app.formToJSON('#update-details-form');
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      timeout: 5*1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: formData,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          app.hidePreloader();
          mainView.router.loadPage('home.html');
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
    /*if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
      app.alert("Image upload is only supported for Android version 5.0 and greater");
      return;
    }*/
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      if (!originalImage || originalImage == "") {
        app.alert("Unable to open Image");
        return;
      }
      //alert(originalImage);
      //if (originalImage.slice(0,4) != "file") {
      //  originalImage = "file://"+originalImage
    //  }
      //alert(originalImage);
      //console.log(originalImage);
      $$('#imageCropper').prop('src', imageURI);
      var image = document.getElementById('imageCropper');
      app.popup('.image-popup');
      cropper = Images.cropper(image, 178/272, 0.75);
    }, function (err) {
      app.alert("Camera Error: " + err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  $$('.crop-image').on('click', function() {
    var imageData = cropper.getData();
    $$('#user-image-id').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
    app.closeModal('.image-popup');
    window.resolveLocalFileSystemURL(originalImage, function(fileEntry){
      var thisFile = fileEntry.toURL();
      console.log(fileEntry.toURL());
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
      };
      ft.upload(thisFile, encodeURI(Server.userImageUpload), function(data) {
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
        var nocache = "?t="+moment().unix();
        $$.ajax({
          timeout: 10* 1000,
          async: true,
          url: config.server + "/api/userimages" + nocache,
          method: "POST",
          contentType: "application/x-www-form-urlencoded",
          data: request,
          xhrFields: { withCredentials: true },
          success: function(data, status, xhr) {
            if (status == 200){
              var result = data;
            } else {
              app.alert("There was an error saving your image");
            }
          },
          error: function(status, xhr) {
            app.alert("There was an error saving your image");
          }
        });
      }, function (err) {
        app.hideProgressbar();
        console.log(JSON.stringify(err));
        if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
          app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
        } else {
          app.alert("Oops! Something went wrong. Please Try Again.");
        }
      }, options);

    }, function(error){
        console.log(error.code);
    });
    /*window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
      function (fs) {
        fs.root.getFile(originalImage, { create: false, exclusive: false },
          function (fileEntry) {
            originalImage = fileEntry.toURL();
            alert(JSON.stringify("file: "+originalImage));
          },
          function(err){
            alert("err "+JSON.stringify(err));
          }
        )},
        function(err) {
          alert(err);
        }
      );*/
    /*var options = new FileUploadOptions();
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
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 10* 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          } else {
            app.alert("There was an error saving your image");
          }
        },
        error: function(status, xhr) {
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
      console.log(JSON.stringify(err));
      app.alert("Oops! Something went wrong");
    }, options);*/
  });
});

app.onPageInit('complete-registration', function (page) {

  app.formFromJSON('#update-details-form', user);
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
        storage.removeItem("userEmail");
        storage.removeItem("userPassword");
        user = null;
        Template7.global.user = null;
        showLoginOrCreate();
        mainView.router.loadPage("home.html");
        var nocache = "?t="+moment().unix();
        app.showPreloader("Logging Out");
        $$.ajax({
          timeout: 5* 1000,
          async: true,
          url: config.server + "/api/user/logout" + nocache,
          method: "POST",
          contentType: "application/x-www-form-urlencoded",
          //header: {"Get-Cookie" : storedUser.session},
          success: function(data, status, xhr) {
            if (status == 200 || status == 0 ){
              // do nothing
            }
          },
        });
      },
      function () {
        //if user continues, do nothing
      }
    );
  });

  $$('.save-user').on('click', function () {
    if (!userService.validateForm('#update-details-form') ) {return;}
    var formData = app.formToJSON('#update-details-form');
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      async: true,
      timeout: 10* 1000,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: formData,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
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
      app.alert("Camera Error: " + err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
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
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
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
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 10* 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          } else {
            app.alert("There was an error saving your image");
          }
        },
        error: function(status, xhr) {
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
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
  $$('.save-user').on('click', function() {
    if (!userService.validateForm('#update-organization-form') ) {return;}
    if ( $$('.url-check').hasClass('icon-wrong') ) { return;}
    var data = app.formToJSON('#update-organization-form');
    var request = userService.createUpdateRequest ({
      area: "organization",
      data: data,
    });
    request.captcha = config.secret;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      timeout: 10* 1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          app.hidePreloader();
          mainview.router.loadPage('home.html');
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
      timeout: 5* 1000,
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
      app.alert("Camera Error: " + err);
    }, cameraOptions);
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
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
    options.chunkedMode = false;
    options.headers = {
         Connection: "close"
       };
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
        imgType: 'organizations',
        userId: user.id,
        images: [item],
      };
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 10* 1000,
        async: true,
        url: config.server + "/api/userimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {
          if (status == 200){
            var result = data;
          } else {
            app.alert("There was an error saving your image");
          }
        },
        error: function(status, xhr) {
          app.alert("There was an error saving your image");
        }
      });
    }, function (err) {
      app.hideProgressbar();
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
    app.formFromJSON('#update-venue-form', user.venue);
  }
  var updateMapLink = function(data) {
    var latitude = data.latLng.lat();
    var longitude = data.latLng.lng();
    var newMapLink = "https://maps.google.com/?ie=UTF8&hq=&ll="+latitude+","+longitude+"&z=15";
    $$('#venue-maplink').val(newMapLink);
  };
  geolocation.getCurrentPosition (function (position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var map = new GMaps({
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
  alert('geolocation error '+err);
  }, { enableHighAccuracy: true, timeout: 5000 });

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
      timeout: 10* 1000,
      async: true,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          user = JSON.parse(data);
          app.hidePreloader();
          mainview.router.loadPage('home.html');
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
      timeout: 5* 1000,
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
          storage.setItem('userPassword', data.password);
          mainView.router.loadPage('home.html');
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
      timeout: 10 * 1000,
      contentType: "application/x-www-form-urlencoded",
      data: formData,
      success: function(data, status, xhr) {
        app.hidePreloader();
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          if (result && result.id > 0) {
            user = result;
            storage.setItem('userId', user.id);
            storage.setItem('userEmail', user.email);
            showAvatar();
            Template7.global.user = user;
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

  $$('.forgot-password').on('click',  function () {
    app.prompt('Enter your account email', function (value) {
      var request = {
        email: value,
      };
      var nocache = "?t="+moment().unix();
      var result = {};
      $$.ajax({
        timeout: 10* 1000,
        async: true,
        url: config.server + "/api/forgotpassword" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        success: function(data, status, xhr) {
          if (status == 200){
            result = JSON.parse(data);
            app.alert("An email has been sent to you you with the instructions to reset your password");
          } else {
            app.alert("Oops! We could not find your email address.  Please try again");
          }
          return;
        },
        error: function (xhr, status){
          app.alert("Oops! We could not find your email address.  Please try again");
          return;
        },

      });
    }, function (value) {
      app.closeModal('.forgot-password');
    });
  });
//});


$$(document).on('click','.logout',  function () {
  storage.removeItem("userId");
  storage.removeItem("userEmail");
  storage.removeItem("userPassword");
  user = null;
  Template7.global.user = null;
  showLoginOrCreate();
  mainView.router.loadPage("home.html");
  var nocache = "?t="+moment().unix();
  app.showPreloader("Logging Out");
  var result = {};
  $$.ajax({
    timeout: 5* 1000,
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
    url: 'views/user/update-details.html',
    ignoreCache: true,
    force: true,
    context:user,
  });
});
