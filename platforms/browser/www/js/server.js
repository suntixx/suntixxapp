var Server = {

  loginUser: function(userInfo, redirect) {
    var nocache = "?t="+moment().unix();

    app.showPreloader("Logging In");
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/userinfo" + nocache,
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
        app.alert("User Login Failed! Please check your email and/or password", "Suntixx Scanner");
      },
    });
    //alert(result);
    return result;
  },

  logoutUser: function() {
    var nocache = "?t="+moment().unix();
checkInternetConnection();
    app.showPreloader("Logging Out");
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/user/logout" + nocache,
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

  forgotPassword: function(request) {
    var nocache = "?t="+moment().unix();
    var result = {};
    $$.ajax({
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
    return;
  },

  registerUser: function(userInfo) {
    var nocache = "?t="+moment().unix();
  checkInternetConnection();
    app.showPreloader("Registering User");
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/register/" + nocache,
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
    var nocache = "?t="+moment().unix();
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
    var nocache = "?t="+moment().unix();
checkInternetConnection();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/userinfo/" + userId + nocache,
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
    var nocache = "?t="+moment().unix();
checkInternetConnection();
    var result = null;
    $$.ajax({
      async: false,
      url: config.server + "/api/getuserbyemail" + nocache,
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

  getEvents: function(userId, redirect) {
checkInternetConnection();
var nocache = "?t="+moment().unix();
    app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: true,
      url: config.server + "/api/getprofileevents/" + userId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          allUserEvents = result;
          result.scanningEventList = eventsService.addScanCondition(result.scanningEventList);
          mainView.router.load({
            url: redirect,
            context: result,
          });
          app.hidePreloader();
        }
      }
    });
  },

  orgUrlAvailable: function(url) {
    var nocache = "&t="+moment().unix();
checkInternetConnection();
    //app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/orgurl?orgUrl=" + url + nocache,
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

  searchEvents: function(request, redirect) {
    var nocache = "?t="+moment().unix();
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
      async: true,
      url: config.server + "/api/searcheventlist/" + category +"/"+ country +"/"+ sort +"/"+ keywords + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          result = util.formatSearchResults(result);
          if (result.length > 0) {
            $$(redirect).html(Template7.templates.eventsTemplate(result));
          } else {
            $$('.oops-image').attr('src', 'img/oops-icon.png');
          }
          app.hidePreloader();
        }
      }

    });
  //  app.hidePreloader();
  //  return result;
  },

  getPurchases: function(userId, condition) {
    var nocache = "?t="+moment().unix();
checkInternetConnection();
    app.showPreloader("Loading Purchases");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/purchases/" + condition + "/" + userId + nocache,
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
    var nocache = "?t="+moment().unix();
checkInternetConnection();
    app.showPreloader("Loading Tickets");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/purchasedtickets/" + eventId + "/" + purchaseId + "/" + user.id + nocache,
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
    var nocache = "?t="+moment().unix();
    checkInternetConnection();
    //app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: true,
      url: config.server + "/api/eventswidget/" + condition + nocache,
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
var nocache = "?t="+moment().unix();
    app.showPreloader("Loading Event");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/event/" + eventId + nocache,
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
  var nocache = "?t="+moment().unix();
    app.showPreloader("Creating Event");
    var result = null;
    $$.ajax({
      async: false,
      url: config.server + "/api/event/" + nocache,
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
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating Event");
    //alert(JSON.stringify(eventInfo));
    var result = {};
    $$.ajax({
      async: false,
      url: config.server + "/api/event/" + eventId,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      //contentType: "application/json; charset=utf-8",
      //data: JSON.stringify(eventInfo),
      data: eventInfo,
      xhrFields: { withCredentials: true },
      //header: {"Get-Cookie" : storedUser.session},
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          app.alert("Event Update Successful!");
          result = data;
        }
        app.hidePreloader();
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Event Update Failed! Error Response:" + status);

      },
      /*complete: function (xhr, status) {
        if (status == 200) {
          app.alert("Event Update Successful!");
        } else {
            app.alert("Event Update Failed! Server Response:" + status);
        }
        //usercenterView.router.back();
        //return result;
      },*/

    });

    return result;

  },

  disableTicket: function(request) {
checkInternetConnection();
var nocache = "?t="+moment().unix();
    //app.showPreloader("Assigning Tickets");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/disableticket/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      //xhrFields: { withCredentials: true },
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

  deleteTicket: function(request) {
checkInternetConnection();
var nocache = "?t="+moment().unix();
    //app.showPreloader("Assigning Tickets");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/deleteticket/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      //xhrFields: { withCredentials: true },
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

  addScanners: function(request) {
checkInternetConnection();
var nocache = "?t="+moment().unix();
      app.showPreloader("Adding Scanners");
      var result;
    $$.ajax({
      //async: false,
      url: config.server + "/api/addscanners/" + nocache,
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
    var nocache = "?t="+moment().unix();
checkInternetConnection();
      app.showPreloader("Deleting Scanner");
      var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/deletescanner/"+request.eventId+"/"+request.scannerId + nocache,
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
    var nocache = "?t="+moment().unix();
checkInternetConnection();
    app.showPreloader("Adding Committee Members");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/addcommittee/" + nocache,
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
      var nocache = "?t="+moment().unix();
  checkInternetConnection();
      app.showPreloader("Adding Ticket");
      var result;
      $$.ajax({
        async: true,
        url: config.server + "/api/addcommitteeticket/" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        xhrFields: { withCredentials: true },
        data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            selectedEventLocal = JSON.parse(data);

            mainView.router.back({
              url: 'views/events/committee-tickets.html',
              reload: true,
              reloadPrevious: true,
              context: selectedEventLocal,
              force: true,
            });
            app.hidePreloader();

          } else {
            app.alert("Oops! Something went wrong.");
            app.hidePreloader();
            return;
          }
        },
        error: function(status, xhr) {
          app.alert("Oops! Something went wrong.");
          app.hidePreloader();
          return;
        }
      });
    },

    assignTickets: function(request) {
  checkInternetConnection();
  var nocache = "?t="+moment().unix();
      app.showPreloader("Assigning Tickets");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/assigntickets/"+ request.eventId+ "/"+request.ticketIds+"/"+request.userId + nocache,
        method: "GET",
        //contentType: "application/x-www-form-urlencoded",
        xhrFields: { withCredentials: true },
        //data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            result = JSON.parse(data);
            mainView.router.back({
              url: 'views/events/committee-settings.html',
              reload: true,
              reloadPrevious: true,
              context: result,
              force: true,
            });
          } else {
            app.alert("Oops! Something went wrong.");
            app.hidePreloader();
            return;
          }
          app.hidePreloader();
        },
        error: function(status, xhr) {
          app.alert("Oops! Something went wrong.");
          app.hidePreloader();
          return;
        }
      });
    },

    getUserTickets: function(request) {
  checkInternetConnection();
  var nocache = "?t="+moment().unix();
      app.showPreloader("Getting Tickets");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/getusertickets/"+ request.eventId+ "/"+request.userId + nocache,
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
  var nocache = "?t="+moment().unix();
      app.showPreloader("Updating Ticket");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/updateuserticket" + nocache,
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

    deleteUserTicket: function(userTicketId) {
  checkInternetConnection();
  var nocache = "?t="+moment().unix();
      app.showPreloader("Updating Ticket");
      var result;
      $$.ajax({
        async: false,
        url: config.server + "/api/deleteuserticket/" + userTicketId + nocache,
        method: "GET",
        //contentType: "application/x-www-form-urlencoded",
        //xhrFields: { withCredentials: true },
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
var nocache = "?t="+moment().unix();
      app.showPreloader("Deleting Committee Member");
      var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/deletecommittee/"+request.eventId+"/"+request.commUserId + nocache,
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
var nocache = "?t="+moment().unix();
      app.showPreloader("Verifying Barcode");
      var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/updatepurchasedticketsstatus/" + code + "/" + eventId + "/" + userId + "/" + ticketTypeId + "/" + scannedTime + nocache,
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
    var nocache = "?t="+moment().unix();
    app.showPreloader("Downloading Data");
    var result;
    //alert("there");
    $$.ajax({
      async: false,
      url: config.server + "/api/poslist/" + nocache,
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
    var nocache = "?t="+moment().unix();
    //alert("here");
    //this.checkInternetConnection();
    app.showPreloader("Downloading Data");
    var result;
    //alert("there");
    $$.ajax({
      async: false,
      url: config.server + "/api/venuelist/" + nocache,
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
var nocache = "?t="+moment().unix();
    app.showPreloader("Downloading Data");
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/Download/EventReports/Json/" + eventId + "/" + userId + nocache,
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
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/ticketimages" + nocache,
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
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/eventimages" + nocache,
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
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/userimages" + nocache,
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

  getExchangeRate: function(currency) {
    checkInternetConnection();
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/currency/"+ currency + nocache,
      method: "GET",
      //contentType: "application/x-www-form-urlencoded",
      //data: request,
      //xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }

    });
    return result;
  },

  mobilePayment: function(request) {
    checkInternetConnection();
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: false,
      url: config.server + "/api/savemobilepayment" + nocache,
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

  commPayment: function(request) {
    checkInternetConnection();
    app.showPreloader("Completing Payment")
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      url: config.server + "/api/savecommpayment" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          app.hidePreloader();
          app.alert("Sale was successful. Don't forget to collect the money", function() {
            mainView.router.back({
              url: 'home.html',
              force:true,
            });
          });


        }
      },
      error: function(status, xhr) {
        app.hidePreloader();
        app.alert("Oops! Something went wrong");
        return;
      },
    });
  },

  //checkInternetConnection: function() {
    /*while (navigator.connection.type == Connection.NONE) {
      app.showPreloader("Searching for Network");
    }
    app.hidePreloader();*/

  //},


};

if (Number(user.id) > 0) {
  user = JSON.parse(Server.loginUser(user));
} else {
  user = null;
}


function checkInternetConnection () {
/*  if (connection)
 {
   alert("here");
   app.alert(connection.type);

 }
  /*while (connection.type.toLowerCase() == "none" || connection.type.toLowerCase() == "unknown"){
    app.showPreloader("Searching for Internet");
  }
  app.hidePreloader();*/
  return;
}
