var Server = {

  loginUser: function(userInfo) {
checkInternetConnection();
    app.showPreloader("Logging In");
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/userinfo",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: userInfo,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          //storedUser.session = xhr.getResponseHeader("Set-Cookie");
          result = data;
          //alert(xhr.getAllResponseHeaders());
        }
        app.hidePreloader();
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Login Failed! Please check your email and/or password", "Suntixx Scanner");

      },

    });
    //alert(result);
    return result;
  },

  logoutUser: function() {
checkInternetConnection();
    app.showPreloader("Logging Out");
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/user/logout",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      //header: {"Get-Cookie" : storedUser.session},
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          //storedUser.session = xhr.getResponseHeader("Set-Cookie");
          //localStorage.clear();
          result = data;
          //alert(xhr.getAllResponseHeaders());
        }
        app.hidePreloader();
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Logout Failed!", "Suntixx Scanner");

      },

    });
    //alert(result);
    return result;
  },

  registerUser: function(userInfo) {
  checkInternetConnection();
    app.showPreloader("Registering User");
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/register/",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: userInfo,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          result = data;
        }
        app.hidePreloader();
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Register Failed! Error Response:" + status);

      },
      complete: function (xhr, status) {
        //alert(status);
        app.hidePreloader();
        if (status == 200) {
          app.alert("User Registration Successful!");
        } else {
            app.alert("User Registration Failed! Server Response:" + status);
        }
        return result;
      },

    });
  },

  updateUser: function(userInfo) {
checkInternetConnection();
    app.showPreloader("Updating User");
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/register/" + user.id,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: userInfo,
      xhrFields: { withCredentials: true },
      //header: {"Get-Cookie" : storedUser.session},
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          result = data;
          //alert(satus + " " +JSON.stringify(result));
        }
        app.hidePreloader();
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("User Update Failed! Error Response:" + status, "Suntixx Scanner");

      },
      complete: function (xhr, status) {
        //alert(status);
        app.hidePreloader();
        if (status == 200) {
          app.alert("User Update Successful!", "Suntixx Scanner");
        } else {
            app.alert("User Update Failed! Server Response:" + status , "Suntixx Scanner");
        }
        //usercenterView.router.back();
        return result;
      },

    });
    //alert(result);
    //return result;
  },

  getUser: function(userId) {
checkInternetConnection();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/userinfo/" + userId,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      },
      error: function (xhr, status){
        app.alert("Cannot find user", "Sun Tixx");
      },

    });
    return result;
  },

  getUserByEmail: function(request) {
checkInternetConnection();
    var result = null;
    $$.ajax({
      async: false,
      url: config.server + "/api/getuserbyemail",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      },
      error: function (xhr, status){
        result = null;
      },

    });
    return result;
  },

  getEvents: function(userId) {
checkInternetConnection();
    app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/getprofileevents/" + userId,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  orgUrlAvailable: function(url) {
checkInternetConnection();
    //app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/orgurl?orgUrl=" + url,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    //app.hidePreloader();
    return result;
  },

  searchEvents: function(request) {
checkInternetConnection();
    var category = 0;
    var country = 0;
    var sort = 1;
    var keywords = 0;
    if (request.category) {
      category = request.category;
    }
    if (request.country) {
      country = request.country;
    }
    if (request.keywords) {
      keywords = request.keywords;
    }
    if (request.sort) {
      sort = request.sort;
    }
    //alert(category);
    app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/searcheventlist/" + category +"/"+ country +"/"+ sort +"/"+ keywords,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  getPurchases: function(userId, condition) {
checkInternetConnection();
    app.showPreloader("Loading Purchases");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/purchases/" + condition + "/" + userId,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  getTickets: function(purchaseId, eventId) {
checkInternetConnection();
    app.showPreloader("Loading Tickets");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/purchasedtickets/" + eventId + "/" + purchaseId + "/" + user.id,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  getHomepageEvents: function(condition) {
    checkInternetConnection();
    //app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/eventswidget/" + condition,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    //app.hidePreloader();
    return result;
  },

  getEvent: function(eventId) {
checkInternetConnection();
    app.showPreloader("Loading Event");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/event/" + eventId,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  createEvent: function(eventInfo) {
  checkInternetConnection();
    app.showPreloader("Creating Event");
    var result = null;
    $$.ajax({
      async: false,
      url: config.server + "/api/event/",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      data: eventInfo,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;

        }
        app.hidePreloader();
          return result;
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Create Failed! Error Response:" + status);

      },

    });
    return result;
  },

  updateEvent: function(eventId, eventInfo) {
    checkInternetConnection();
    app.showPreloader("Updating Event");
    //alert(JSON.stringify(eventInfo));
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/event/" + eventId,
      method: "PUT",
      //contentType: "application/x-www-form-urlencoded",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(eventInfo),
      xhrFields: { withCredentials: true },
      //header: {"Get-Cookie" : storedUser.session},
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){

          result = data;
        }
        app.hidePreloader();
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Event Update Failed! Error Response:" + status);

      },
      complete: function (xhr, status) {
        if (status == 200) {
          app.alert("Event Update Successful!");
        } else {
            app.alert("Event Update Failed! Server Response:" + status + " " + xhr.responseText);
        }
        //usercenterView.router.back();
        return result;
      },

    });

  },

  addScanners: function(request) {
checkInternetConnection();
      app.showPreloader("Adding Scanners");
      var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/addscanners/",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      //contentType: "application/json; charset=utf-8",
      xhrFields: { withCredentials: true },
      //data: JSON.stringify(request),
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  deleteScanner: function(request) {
checkInternetConnection();
      app.showPreloader("Deleting Scanner");
      var result;
    $$.ajax({
      async: true,
      url: config.server + "/api/deletescanner/"+request.eventId+"/"+request.scannerId,
      method: "GET",
      //contentType: "application/x-www-form-urlencoded",
      //contentType: "application/json; charset=utf-8",
      xhrFields: { withCredentials: true },
      //data: JSON.stringify(request),
      //data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  addCommittee: function(request) {
checkInternetConnection();
    app.showPreloader("Adding Committee Members");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/addcommittee/",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },


    addCommitteeTicket: function(request) {
  checkInternetConnection();
      app.showPreloader("Adding Ticket");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/addcommitteeticket/",
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        xhrFields: { withCredentials: true },
        data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            result = data;
          }
        }

      });
      app.hidePreloader();
      return result;
    },

    assignTickets: function(request) {
  checkInternetConnection();
      app.showPreloader("Assigning Tickets");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/assigntickets/"+ request.eventId+ "/"+request.ticketIds+"/"+request.userId,
        method: "GET",
        //contentType: "application/x-www-form-urlencoded",
        xhrFields: { withCredentials: true },
        //data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            result = data;
          }
        }

      });
      app.hidePreloader();
      return result;
    },

    getUserTickets: function(request) {
  checkInternetConnection();
      app.showPreloader("Getting Tickets");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/getusertickets/"+ request.eventId+ "/"+request.userId,
        method: "GET",
        //contentType: "application/x-www-form-urlencoded",
        xhrFields: { withCredentials: true },
        //data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            result = data;
          }
        }

      });
      app.hidePreloader();
      return result;
    },

    updateUserTicket: function(request) {
  checkInternetConnection();
      app.showPreloader("Updating Ticket");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/updateuserticket",
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        xhrFields: { withCredentials: true },
        data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            result = data;
          }
        }

      });
      app.hidePreloader();
      return result;
    },


  deleteCommittee: function(request) {
checkInternetConnection();
      app.showPreloader("Deleting Committee Member");
      var result;
    $$.ajax({
      async: true,
      url: config.server + "/api/deletecommittee/"+request.eventId+"/"+request.commUserId,
      method: "GET",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  verifyScan: function(code, eventId, userId, ticketTypeId, scannedTime) {
checkInternetConnection();
      app.showPreloader("Verifying Barcode");
      var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/updatepurchasedticketsstatus/" + code + "/" + eventId + "/" + userId + "/" + ticketTypeId + "/" + scannedTime,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;
  },

  getPOSList: function() {
    //alert("here");
    //this.checkInternetConnection();
    app.showPreloader("Downloading Data");
    var result;
    //alert("there");
    $$.ajax({
      async: false,
      url: config.server + "/api/poslist/",
      method: "GET",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
          //alert(status);
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Failed to get POS Data! Error Response:" + status, "Suntixx Scanner");
      },

    });
    app.hidePreloader();
    return result;

  },

  getVenueList: function() {
    //alert("here");
    //this.checkInternetConnection();
    app.showPreloader("Downloading Data");
    var result;
    //alert("there");
    $$.ajax({
      async: false,
      url: config.server + "/api/venuelist/",
      method: "GET",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
          //alert(status);
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Failed to get Venue Data! Error Response:" + status, "Suntixx Scanner");
      },

    });
    app.hidePreloader();
    return result;

  },

  downloadServerDatabase: function (eventId, userId) {
checkInternetConnection();
    app.showPreloader("Downloading Data");
    var result;
    $$.ajax({
      async: true,
      url: config.server + "/Download/EventReports/Json/" + eventId + "/" + userId,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    app.hidePreloader();
    return result;

  },

  eventImageUpload: config.server + "/api/uploadify/1",
  userImageUpload: config.server + "/api/useruploadify",
  ticketImageUpload: config.server + "/api/ticketuploadify",

  ticketImageSave: function(request) {
    checkInternetConnection();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/ticketimages",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    return result;
  },

  eventImageSave: function(request) {
    checkInternetConnection();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/eventimages",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    return result;
  },

  userImageSave: function(request) {
    checkInternetConnection();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/userimages",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    return result;
  },



  //checkInternetConnection: function() {
    /*while (navigator.connection.type == Connection.NONE) {
      app.showPreloader("Searching for Network");
    }
    app.hidePreloader();*/

  //},


};

function checkInternetConnection () {
  //app.alert(connection.type);
  /*while (connection.type == "none") {
    app.showPreloader("Searching for Internet");
  }
  app.hidePreloader();
  return;*/
}
