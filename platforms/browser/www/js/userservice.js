var userService = {
  validateForm: function(formid) {
    //alert('here');
    $$(formid).find('.form-error').each(function () {
      $$(this).text('');
    });
    var invalidFields = 0;
    $$(formid).find('input').each(function () {
      if ($$(this).prop('required') == true) {
        var name = $$(this).attr('name');
        var type = $$(this).attr('type');
        var value = $$(this).val().trim();
        if ( type == "text" && value == "" || value == "" ) {
          $$('.'+name).text('This Field Is Required');
          invalidFields++;
          //next();
        } else if (type == "email" && !validateEmail(value)) {
          $$('.'+name).text('Error in your email');
          invalidFields++;
          //next();
        } else if (type == "tel" && !validatePhone(value)) {
          $$('.'+name).text('Error in your phone number');
          invalidFields++;
        //  next();
        } else if (type == "date" && !validateAge(value)) {
          $$('.'+name).text('You must be over 18');
          invalidFields++;
        //  next();
        }
     }
   });
   if(invalidFields > 0) {
     app.alert(language.OTHER.FORM_ERRORS, function() {
       return false;
     });
   } else {
     return true;
   }
 },

   validatePasswords: function(formid) {
     $$(formid).find('.form-error').each(function () {
       $$(this).text('');
     });
     var passwords = [];
     $$(formid).find('input[type="password"]').each(function () {
       passwords.push($$(this).val().trim());
     });
     if (passwords[0] == passwords[1]) {
       return true;
     } else {
       $$('.password').text("Passwords do not match");
       $$(formid).find('input[type="password"]').each(function () {
         $$(this).val('');
       });
       return false;
     }
   },

  createUpdateRequest: function(options) {
    var tmp = JSON.parse(JSON.stringify(user));
    var area = options.area;
    var data = options.data;
    if (area == "organization") {
      tmp.org = data;
    } else if ( area =="venue") {
      tmp.venue = data;
    } else if (area == "password"){
      tmp.password = data.password;
      tmp.proile_confirmpassword = data.profile_confirmpassword;
      tmp.passwordIsChanged = 1;
    }
    delete tmp.id;
    return tmp;
  },

  getFacebookProfileInfo : function (authResponse) {
    facebookConnectPlugin.api('/me?fields=email,name,first_name,last_name,birthday,location,middle_name,gender&access_token=' + authResponse.accessToken, null,
      function (response) {
				console.log("getProfileInfo", JSON.stringify(response));
        if (user && user.mobilephone) {
          //contact server and add facebook integration
        } else {
          //contact server, create user, add facebook integration and login user
        }
        console.log("facebookFriends", JSON.stringify(response.friends));
        //storage.setItem('facebookId', response.id);
      //  storage.setItem('facebookEmail', response.email);
        //storage.setItem('facebookImage', "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large");
        return response;
      },
      function (response) {
				console.log(JSON.stringify(response));
        return response;
      }
    );
  },

  /*facebookAddSuccess: function (response) {
    console.log("loginSuccess", JSON.stringify(response));
    if (!response.authResponse){
     facebookLoginFail("Cannot find the authResponse");
     return;
    }
    var authResponse = response.authResponse;
    var request = {
     facebook: authResponse,
     userid: user.id
    };
    app.showIndicator();
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      url: config.server + "/api/facebooklogin" + nocache,
      method: "POST",
      timeout: 20 * 1000,
      contentType: "application/x-www-form-urlencoded",
      data: request,
      success: function(data, status, xhr) {
       if (status == 200 || status == 0 ){
         app.hideIndicator();
         var returnUser = JSON.parse(data);
         if (returnUser.id) {
           user = returnUser;
           Template7.global.user = user;
           storage.setItem('userData', JSON.stringify(user));
           app.showTab('#userDetailsTab');
         }
       }
     },
     error: function (xhr, status){
       app.hideIndicator();
     },
   });
 },*/

  facebookLoginSuccess: function (response) {
  console.log("loginSuccess", JSON.stringify(response));
   if (!response.authResponse){
     userService.facebookLoginFail("Cannot find the authResponse");
     return;
   }
   //console.log("loginSuccess", JSON.stringify(response));
   var authResponse = response.authResponse;
   var request = {
     facebook: authResponse
   };
   if (user && user.id) {
     request.userid = user.id;
   }
   if(!response.background) {
     app.showIndicator();
   }
   var nocache = "?t="+moment().unix();
   $$.ajax({
     async: true,
     url: config.server + "/api/facebooklogin" + nocache,
     method: "POST",
     timeout: 20 * 1000,
     contentType: "application/x-www-form-urlencoded",
     data: request,
     success: function(data, status, xhr) {
       if (status == 200 || status == 0 ){
         app.hideIndicator();
         var returnUser = JSON.parse(data);
         if (returnUser.id && returnUser.mobilephone) {
           user = returnUser;
           Template7.global.user = user;
           storage.setItem('userData', JSON.stringify(user));
           socket = io.connect(config.server);
           socket.on('connect', socketManager);
           showAvatar();
           if(!response.background) {
             mainView.router.load({
               url: 'views/user/profile.html',
               context: user,
               reload:true,
             });
           }
         } else if (returnUser.newuser) {
           console.log("new facebook user");
           mainView.router.load({
             url: 'views/user/complete-facebook-registration.html',
             context: returnUser,
           });
         } else {
           user = returnUser;
           console.log("existing facebook user");
           Template7.global.user = user;
           showAvatar();
           storage.setItem('userData', JSON.stringify(user));
           mainView.router.load({
             url: 'views/user/complete-registration.html',
             context: user,
           });
         }
       }
     },
     error: function (xhr, status){
       app.hideIndicator();
       /*if(!response.background) {
         facebookConnectPlugin.logout(userService.facebookLogoutSuccess, userService.facebookLogoutFail);
       }*/
       showLoginOrCreate();
       user = null;
       Template7.global.user = null;
       app.addNotification({
         message: language.SYSTEM.SERVER_ERROR,
         hold: 2000,
       });
     },
   });
 },

 facebookLoginFail: function(error) {
   app.alert(language.USER_AREA.FACEBOOK_ERROR);
   console.log('fbLoginError', error);
 },

 facebookLogoutSuccess: function() {
   //call server and delete database entry
   app.showIndicator();
   var nocache = "?t="+moment().unix();
   $$.ajax({
     async: true,
     url: config.server + "/api/removefacebook" + nocache,
     method: "POST",
     timeout: 20 * 1000,
     contentType: "application/x-www-form-urlencoded",
     data: {},
     success: function(data, status, xhr) {
       if (status == 200 || status == 0 ){
         user = JSON.parse(data);
         storage.setItem('userData', user);
         Template7.global.user = user;
         app.hideIndicator()
         mainView.router.load({
           url: 'views/user/profile.html',
           context: user,
           reload:true,
         });
       }
     },
     error: function (xhr, status){
       app.hideIndicator();
       if (user) {
         delete user.social;
         delete user.social_id;
       }
       storage.setItem('userData', user);
       Template7.global.user = user;
       mainView.router.back({
         url: 'home.html',
         force:true,
         reload:true,
       });
     },
   });
 },

 facebookLogoutFail: function(error) {
   app.alert(language.USER_AREA.FACEBOOK_ERROR);
 },


 //facebookPermissions: ['email', 'public_profile', 'user_friends', 'user_events', 'rsvp_events', 'user_actions.music'],
 facebookPermissions: ['email', 'public_profile', 'user_friends'],
};

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validatePhone(phone) {
  var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  return re.test(phone);
}

function validateAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age > 18;
}
