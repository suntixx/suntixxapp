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
   return invalidFields == 0;
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
