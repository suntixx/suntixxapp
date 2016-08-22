var updateEvent = function(data, redirect) {
  var nocache = "?t="+moment().unix();
  app.showPreloader("Updating Event");
  console.log(JSON.stringify(data));
  var returnEvent = {};
  $$.ajax({
    async: true,
    url: config.server + "/api/event/" + selectedEventLocal.id + nocache,
    method: "PUT",
    timeout: 20 * 1000,
    //contentType: "application/x-www-form-urlencoded",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
    //data: data,
    xhrFields: { withCredentials: true },
    //header: {"Get-Cookie" : storedUser.session},
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        app.hidePreloader();
        app.alert("Event Update Successful!");
        returnEvent = JSON.parse(data);
        if (returnEvent && returnEvent.id) {
          selectedEventLocal = returnEvent;
          mainView.router.back({
            url: redirect,
            context: selectedEventLocal,
            force: true,
          });
        }
      }
    },
    error: function (xhr, status){
      app.hidePreloader();
      app.alert("Event Update Failed!");
    },
  });
};
app.onPageAfterAnimation('event-main', function(page) {
  if (page.context.previous) {
    $$('#right-panel-menu').html(Menus.previousEvent);
  } else {
    $$('#right-panel-menu').html(Menus.event);
  }

  $$('.create-new-event').on('click',  function () {
    mainView.router.load({
      url: 'views/events/create-event.html',
    });
  });

  $$('.back-events').on('click', function () {
    mainView.router.back ({
      url: 'views/events/myevents.html',
      context: allUserEvents,
      force: true,
    });
  });
});

//===============Show All Events Functions==============
app.onPageAfterAnimation('all-user-events', function (page) {
  var selectedEventId;
  var myEvents = page.context;
  var autoOpen = page.query.area;
  if (autoOpen) {
    if (autoOpen == 'committee') {
      app.accordionOpen('.committee-events');
    } else if (autoOpen == 'access') {
      app.accordionOpen('.access-events');
    }
  } else {
    if (myEvents.managedEventList.length > 0) {
      app.accordionOpen('.managed-events');
    } else if (myEvents.commiteeEventList && myEvents.commiteeEventList.length > 0) {
      app.accordionOpen('.committee-events');
    } else if (myEvents.scanningEventList && myEvents.scanningEventList.length > 0) {
      app.accordionOpen('.access-events');
    }
  }

  $$('.managed-events').on('click', function() {
    app.accordionClose('.committee-events');
    app.accordionClose('.access-events');
    app.accordionClose('.previous-events');
  });
  $$('.committee-events').on('click', function() {
    app.accordionClose('.managed-events');
    app.accordionClose('.access-events');
    app.accordionClose('.previous-events');
  });
  $$('.access-events').on('click', function() {
    app.accordionClose('.committee-events');
    app.accordionClose('.managed-events');
    app.accordionClose('.previous-events');
  });
  $$('.previous-events').on('click', function() {
    app.accordionClose('.committee-events');
    app.accordionClose('.managed-events');
    app.accordionClose('.access-events');
  });

  $$('.my-event-link').on('click', function () {
    var eventId = $$(this).attr('event-id');
    var nocache = "?t="+moment().unix();
    var result;
    app.showPreloader(language.SYSTEM.LOADING);
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/event/" + eventId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        app.hidePreloader();
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          if (result && result.id>0) {
            selectedEventLocal = result;
            selectedEventLocal.previous = false;
            mainView.router.load({
              url: 'views/events/event.html',
              context: selectedEventLocal,
            });
          }
        }
      },
      error: function (xhr, status) {
        app.hidePreloader();
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },

    });
  });

  $$('.previous-event-link').on('click', function () {
    var eventId = $$(this).attr('event-id');
    var nocache = "?t="+moment().unix();
    var result;
    app.showPreloader(language.SYSTEM.LOADING);
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/event/" + eventId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        app.hidePreloader();
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          if (result && result.id>0) {
            selectedEventLocal = result;
            selectedEventLocal.previous = true;
            mainView.router.load({
              url: 'views/events/event.html',
              context: selectedEventLocal,
            });
          }
        }
      },
      error: function (xhr, status) {
        app.hidePreloader();
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },

    });
  });

  $$('.committee-event-link').on('click', function () {
    selectedEventId = $$(this).attr('event-id');
    var nocache = "?t="+moment().unix();
    var result;
    app.showPreloader(language.SYSTEM.LOADING);
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/event/" + selectedEventId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          if (result && result.id>0) {
            selectedEventLocal = result;
            $$.ajax({
              async: true,
              timeout: 20 * 1000,
              url: config.server + "/api/getusertickets/"+ selectedEventId+ "/"+user.id + nocache,
              method: "GET",
              xhrFields: { withCredentials: true },
              success: function(data, status, xhr) {
                app.hidePreloader();
                if (status == 200){
                  var sellerTickets = JSON.parse(data);
                  mainView.router.load({
                    url: 'views/selltickets/committee-home.html',
                    context: {
                      tickets: sellerTickets,
                      event: selectedEventLocal,
                    }
                  });
                }
              },
              error: function (xhr, status) {
                app.hidePreloader();
                alert(language.SYSTEM.GENERAL_SERVER_ERROR);
              },
            });
          }
        }
      },
      error: function (xhr, status) {
        app.hidePreloader();
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },
    });

  });

  $$('.create-event').on('click',  function () {
    mainView.router.load({
      url: 'views/events/create-event.html',
    });
  });

  $$('.home').on('click', function () {
    app.removeFromCache('home.html');
    mainView.router.back ({
      url: 'home.html',
      force: true,
      ignoreCache: true,
    });
  });

  $$('.scanning-event-link').on('click', function () {
    var eventId = $$(this).attr('event-id');
    var nocache = "?t="+moment().unix();
    var result;
    app.showPreloader(language.SYSTEM.LOADING);
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/event/" + eventId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        app.hidePreloader();
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          if (result && result.id>0) {
            selectedEventLocal = result;
            mainView.router.load({
              url: 'views/access/assigned-access-home.html',
              context: selectedEventLocal,
            });
          }
        }
      },
      error: function (xhr, status) {
        app.hidePreloader();
        alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      },
    });
  });
});

app.onPageInit('event-details', function(page) {
  var thisEvent = page.context;
  var location = null;
  if (thisEvent.maplink) {
    location = eventsService.getEventLocation(thisEvent.maplink);
  }
  var map;
  var isFloat = function(n) {
   return n % 1 !== 0;
  }
  if (location && isFloat(location.latitude) && isFloat(location.longitude) ) {
     map = new GMaps({
      div: '#event-map',
      lat: location.latitude,
      lng: location.longitude
    });
    map.addMarker({
      lat: location.latitude,
      lng: location.longitude,
      title: thisEvent.venue,
      draggable: false,
    });
  } else {
    var venueAddress = thisEvent.venue +" "+thisEvent.city+" "+thisEvent.country;
    GMaps.geocode({
      address: venueAddress,
      callback: function(results, status) {
        var latlng;
        if (status == 'OK') {
          latlng = results[0].geometry.location;
          map = new GMaps({
           div: '#event-map',
           lat: latlng.lat(),
           lng: latlng.lng()
         });
          map.addMarker({
            lat: latlng.lat(),
            lng: latlng.lng(),
            title: thisEvent.venue,
            draggable: false,
          });
        } else {
          venueAddress = thisEvent.city+" "+thisEvent.country;
          GMaps.geocode({
            address: venueAddress,
            callback: function(results, status) {
              var latlng;
              if (status == 'OK') {
                latlng = results[0].geometry.location;
                map = new GMaps({
                 div: '#event-map',
                 lat: latlng.lat(),
                 lng: latlng.lng()
               });
                map.addMarker({
                  lat: latlng.lat(),
                  lng: latlng.lng(),
                  title: thisEvent.venue,
                  draggable: false,
                });
              }
            }
          });
        }
      }
    });
  }

  $$('.user-profile').on('click', function() {
    /*var thisId = $$(this).attr('user-id');
    thisEvent.user.isOrg = $$(this).attr('profile') === "1";
    //thisProfile.isOrg = isOrg;\
    alert(thisEvent.user.isOrg);
    mainView.router.load({
      url: 'views/user/user-profile.html',
      context: thisEvent.user,
    });*/
    app.showTab('#eventPromoterTab');
  });


  $$('#eventPromoterTab').on('show', function() {
    //thisEvent.user.notMe = true;
    //if (user && thisEvent.user.id == user.id) {
      thisEvent.user.notMe = true;
      //alert("here");
      if (thisEvent.user.organization && thisEvent.hostedby == "1" || (thisEvent.user.organization && thisEvent.hostedby.trim() == thisEvent.user.organization.name.trim() ) ) {
        $$('#eventPromoterTab .profile').html(Template7.templates.userOrganizationTemplate(thisEvent.user));
      } else  {
        $$('#eventPromoterTab .profile').html(Template7.templates.userProfileTemplate(thisEvent.user));
      }
    //  delete user.notMe;
  /*  } else {
      var nocache = "?t="+moment().unix();
      $$.ajax({
        async: true,
        timeout: 20 * 1000,
        url: config.server + "/api/userinfo/"+thisEvent.user.id + nocache,
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            var thisProfile = JSON.parse(data);
            thisProfile.notMe = true;
            //alert("here");
            if (thisProfile.organization && thisEvent.hostedby == "1" || (thisProfile.organization && thisEvent.hostedby.trim() == thisProfile.organization.name.trim() ) ) {
              $$('#eventPromoterTab .profile').html(Template7.templates.userOrganizationTemplate(thisProfile));
            } else  {
              $$('#eventPromoterTab .profile').html(Template7.templates.userProfileTemplate(thisProfile));
            }
          }
        },
        error: function(status, xhr) {
          //app.hidePreloader();
          app.alert(language.SYSTEM.GENERAL_SERVER_ERROR, function() {
            app.showTab('#eventDetailsTab');
          });
        },
      });
    }*/
   //alert(thisEvent.hostedby);
  // else {
    //  $$('#eventPromoterTab .profile').html(Template7.templates.userProfileTemplate(thisEvent.user));
  //  }
  });

  $$('.page-content').on('scroll', function() {
    $$('.floating-button').hide();
    setTimeout(function() {
      $$('.floating-button').show();
    }, 2000);
  });

  if (user && SEARCHJS.matchObject(thisEvent.attending, {id: Number(user.id)})) {
    $$('.attending').removeClass("color-gray");
    $$('.attending').attr("attending", "true");
  }
  var updatingAttending = false;

  $$('.attending').on('click', function() {
    if (updatingAttending) return;
    if (!user) {
      app.loginScreen();
      return;
    }
    updatingAttending = true;
    var remove = 0;
    if ($$(this).attr("attending")  == "true") {
      remove = 1;
    }
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      url: config.server + "/api/attending/" + user.id +"/"+ thisEvent.id +"/1/"+ remove + nocache,
      method: "GET",
      timeout: 20 * 1000,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          thisEvent = JSON.parse(data);
          if (remove == 1) {
            $$('.attending').addClass("color-gray");
            $$('.attending').attr("attending", "false");
          } else {
            $$('.attending').removeClass("color-gray");
            $$('.attending').attr("attending", "true");
            $$('.interested').addClass("color-gray");
            $$('.interested').attr("interested", "false");
          }
          $$('.attending-count').html(thisEvent.attending.length);
          $$('.interested-count').html(thisEvent.interested.length);
          updatingAttending = false;
        }
      },
      error: function (xhr, status){

      },
    });
  });

  if(user && SEARCHJS.matchObject(thisEvent.interested, {id: Number(user.id)})) {
    $$('.interested').removeClass("color-gray");
    $$('.interested').attr("interested", "true");
  }
  var updatingInterested = false;
  $$('.interested').on('click', function() {
    if (updatingInterested || $$('.attending').attr("attending") == "true") return;
    if (!user) {
      app.loginScreen();
      return;
    }
    updatingInterested = true;
    var remove = 0;
    if ($$(this).attr("interested")  == "true") {
      remove = 1;
    }
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      url: config.server + "/api/attending/" + user.id +"/"+ thisEvent.id +"/2/"+ remove + nocache,
      method: "GET",
      timeout: 20 * 1000,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          thisEvent = JSON.parse(data);
          if (remove == 1) {
            $$('.interested').addClass("color-gray");
            $$('.interested').attr("interested", "false");
          } else {
            $$('.interested').removeClass("color-gray");
            $$('.interested').attr("interested", "true");
          }
          $$('.interested-count').html(thisEvent.interested.length);
          updatingInterested = false;
        }
      },
      error: function (xhr, status){

      },
    });
  });
  //get quantity of persons in chat room
  if (socket) {
    socket.emit('room-count', {
      room: 'room-'+thisEvent.id
    });
  }

  $$('.show-chat').on('click', function() {
    if (!user) {
      app.loginScreen();
      return;
    }
    //var eventId = $$(this).attr('event-id');
    mainView.router.load({
      url: 'views/user/chat.html',
      context : {eventId: thisEvent.id},
    });
  });

  $$('#eventDetailsTab').on('show', function() {
    //app.showTab('#eventDetailsTab');
    $$('.center').text(language.OTHER.DETAILS);
    $$('.floating-button').show();
  });

  $$('#eventSellersTab').on('show', function() {
    //app.showTab('#eventSellersTab');
    $$('.center').text(language.EVENTS.SELLERS);
    $$('#eventSellersTab').html(Template7.templates.eventSellersTemplate(thisEvent));
    $$('.floating-button').hide();

    $$('.message-seller').on('click', function() {
      if (!user) {
        app.loginScreen();
        return;
      }
      var seller = $$(this).attr('user-id');
      mainView.router.load({
        url: 'views/user/chat.html',
        context : {
          receiver: seller
        },
      });
    });

    $$('.show-seller-profile').on('click', function() {
      var thisId = $$(this).attr('user-id');
      var nocache = "?t="+moment().unix();
      $$.ajax({
        async: true,
        url: config.server + "/api/userinfo/" + thisId + nocache,
        method: "GET",
        timeout: 20 * 1000,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            var thisProfile = JSON.parse(data);
            mainView.router.load({
              url: 'views/user/user-profile.html',
              context: thisProfile,
            });
          }
        },
        error: function (xhr, status){
          app.addNotification({
            message: language.USER_ARE.USER_NOT_FOUND,
            hold: 1500,
          });
        },
      });
    });
  });

  $$('#eventActivityTab').on('show', function() {
    //app.showTab('#eventActivityTab');
    $$('.center').text(language.OTHER.ACTIVITY);
    $$('#eventActivityTab').html(Template7.templates.eventActivityTemplate(thisEvent));
    $$('.floating-button').hide();
  });

  $$('.facebook-link').on('click', function() {
    window.open(thisEvent.facebook, "_system", "");
  });

  $$('.twitter-link').on('click', function() {
    window.open(thisEvent.twitter, "_system", "");
  });



  $$('.purchase-event-tickets').on('click', function () {
    if (!user) {
     app.loginScreen();
      return;
    }

    storeView = app.addView('.view-store', {
      allowDuplicateUrls: true
    });
    storeView.router.load({
      url: 'views/purchase/select-quantity.html',
      context: thisEvent,
      //ignoreCache:true,
      reload:true,
    });
    app.showTab('#store-tab');

  });
});

//===========================New Event===================================
app.onPageInit('create-new-event', function(page) {


  var eventCategories = appPickers.eventCategories('event-category');
  var eventRestrictions = appPickers.eventRestrictions('event-restriction');
  var eventDresscode = appPickers.eventDresscode('event-dresscode');
  var eventCurrency = appPickers.currency('currency');
  var eventHost = appPickers.hostedBy();


  $$('#event-category').on('click', function() {
    eventCategories.open();
  });

  $$('#event-restriction').on('click', function() {
    eventRestrictions.open();
  });

  $$('#event-dresscode').on('click', function() {
    eventDresscode.open();
  });

  $$('#currency').on('click', function() {
    eventCurrency.open();
  });

  $$('#event-host').on('click', function() {
    eventHost.open();
  });

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });

  $$('.add-venue').on('click', function() {
    //alert(JSON.stringify(eventHost.displayValue));
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if ( !eventsService.validateForm('#create-event-details-form') ) {return;}
    var eventDetails = app.formToJSON('#create-event-details-form');
    eventDetails.description = eventDetails.description.replace(/\r?\n/g, '<br />');
    var host = eventHost.displayValue;
    if (!host || host[0] == "personal") { eventDetails.hostedby = 0; }
    else { eventDetails.hostedby = 1; }
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/venuelist/" + nocache,
      method: "GET",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var venueList = JSON.parse(data);
          mainView.router.load({
            url: 'views/events/add-venue.html',
            context: {
              newEvent: eventDetails,
              venues: venueList,
            },
          });
        }
      },
      error: function (xhr, status){
        app.alert("There was a problem collecting the venue information");
      },
    });
  });

  var cropper;
  var thumbnailCropper;
  var originalImage;
  var croppedImageData;
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
      app.popup('.image-popup');
      $$('.crop-image').text('Save');
      $$('.cropper-label').text("Main Image");
      $$('#imageCropper').prop('src', imageURI);
        var image = document.getElementById('imageCropper');
        cropper = Images.cropper(image, 27/10);
        $$('.cropper-label').text("Main Image");
    }, function (err) {
      cropper.destroy();
      app.alert(err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    $$('#add-event-image').prop('src', config.server+"/thumbnails/events/0/landscape.png");
    cropper.destroy();
    if (thumbnailCropper) {
      thumbnailCropper.destroy();
    }
  });
  var uploading = false;
  $$('.crop-image').on('click', function() {

      if ($$(this).text() == 'Save') {
        $$(document).find('#add-event-image').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
        croppedImageData = cropper.getData();
        cropper.destroy();
        $$(this).text('Done');
        var image = document.getElementById('imageCropper');
        thumbnailCropper = Images.cropper(image, 106/46, 0.75);
        $$('.cropper-label').text("Thumbnail Image");
        return;
      }

      var croppedThumbnailData = thumbnailCropper.getData();
      thumbnailCropper.destroy();
      //var resetCropper = function() {

    //  };
      //ßresetCropper();
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
      ft.upload(originalImage, encodeURI(Server.eventImageUpload), function(data) {
        //app.hideProgressbar();
        data = data.response.split(':');
        var imageServerPath = data[1];
        imageServerPath = imageServerPath.substring(1, imageServerPath.length - 2 );
        //alert(imageServerPath);
        $$(document).find('#add-event-image-path').val(imageServerPath);
        $$(document).find('#add-event-image-landscapepath').val(imageServerPath);
        var formatedImageData = [];
        var formatImageData = function (imageData) {
          var item = {
            cropX: Math.round(imageData.x),
            cropY: Math.round(imageData.y),
            cropW: Math.round(imageData.width),
            cropH: Math.round(imageData.height)
          };
          return item;
        }
        formatedImageData.push(formatImageData(croppedThumbnailData));
        //formatedImageData.push({});
        formatedImageData.push(formatImageData(croppedImageData));

        var request = {
          src: [imageServerPath, "/thumbnails/events/0/portrait.png"],
          images: [formatImageData(croppedThumbnailData), ' ', formatImageData(croppedImageData)],
        };
        var nocache = "?t="+moment().unix();
        $$.ajax({
          async: true,
          timeout: 20 * 1000,
          url: config.server + "/api/eventimages" + nocache,
          method: "POST",
          contentType: "application/x-www-form-urlencoded",
          data: request,
          xhrFields: { withCredentials: true },
          success: function(data, status, xhr) {
            if (status == 200 || status == 0 ){
              var result = data;
              app.hideProgressbar();
              uploading = false;
            }
          },
          error: function(status, xhr) {
            app.alert("There was a problem saving the event images");
            app.hideProgressbar();
            uploading = false;
          }
        });
      }, function (err) {
        app.hideProgressbar();
        uploading = false;
        if (cropper) {
          cropper.destroy();
        }
        if (thumbnailCropper) {
          thumbnailCropper.destroy();
        }
        err = JSON.stringify(err);
        if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
          app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
        } else {
          app.alert("Oops! Something went wrong. Please Try Again.");
        }
      }, options);
  });


});

app.onPageInit('add-venue', function (page) {
  var eventDetails = page.context.newEvent;
  var updateMapLink = function(data) {
    var latitude = data.latLng.lat();
    var longitude = data.latLng.lng();
    var newMapLink = "http://maps.google.com/?ie=UTF8&hq=&ll="+latitude+","+longitude+"&z=15";
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
    map.addMarker({
      lat: latitude,
      lng: longitude,
      title: 'Venue Location',
      draggable: true,
      infoWindow: {
        content: '<p>Venue Location</p>'
        },
      dragend: updateMapLink,
    });
  }, function (err) {
  console.log('geolocation error '+ JSON.stringify(err));
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


  var countries = appPickers.countries('venue-country');
  $$('#venue-country').on('click', function() {
    countries.open();
  });

  var venueType = appPickers.venueType('venue-type');
  $$('#venue-type').on('click', function() {
    venueType.open();
  });

  $$('input').on('change', function() {
    $$('#venue-select').val(0);
    $$('.smart-select .item-after').text('Custom');
  });

  $$('#venue-select').on('change', function() {
    var venueId = Number($$(this).val());
    var venueList = page.context.venues.Venue_Names;
    var venue = SEARCHJS.matchArray(venueList, {value: venueId});
    venue = venue[0];
    $$('#venue-address').val(venue.address);
    $$('#venue-city').val(venue.city);
    $$('#venue-country').val(venue.country);
    $$('#venue-maplink').val(venue.maplink);
    $$('#venue-name').val(venue.label);

  });

  $$('.save-new-event').on('click', function () {
    if ( !eventsService.validateForm('#add-venue-form') ) {return;}
    var eventDetails = page.context.newEvent;
    var venueDetails = app.formToJSON('#add-venue-form');
    var saveEvent = function() {

      var venueDetails = app.formToJSON('#add-venue-form');
      var request = eventsService.generateNewEventRequest(eventDetails, venueDetails);
      //alert(JSON.stringify(request));
      //return;
      var nocache = "?t="+moment().unix();
      app.showIndicator();
      var result = null;
      $$.ajax({
        async: true,
        timeout: 60 * 1000,
        url: config.server + "/api/event/" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        xhrFields: { withCredentials: true },
        data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ) {
            var nocache = "?t="+moment().unix();
            $$.ajax({
              async: true,
              timeout: 30 * 1000,
              url: config.server + "/api/getprofileevents/" + user.id + nocache,
              method: "GET",
              success: function(data, status, xhr) {
                if (status == 200 || status == 0 ){
                  allUserEvents = JSON.parse(data);
                  //allUserEvents = result;
                  allUserEvents.scanningEventList = eventsService.addScanCondition(allUserEvents.scanningEventList);
                  app.hideIndicator();
                  mainView.router.load({
                    url: 'views/events/myevents.html',
                    context: allUserEvents,
                  });
                }
              }, error: function (xhr, status){
                app.hideIndicator();
                mainView.router.loadPage('home.html');
              },
            });
          }
        },
        error: function (xhr, status){
          app.hideIndicator();
          app.alert("The was an error while trying to create your event");
        },
      });
    };
    if(venueDetails.maplink == "") {
      var venueAddress = venueDetails.address +" "+venueDetails.city+" "+venueDetails.country;
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
            /*map.addMarker({
              lat: latlng.lat(),
              lng: latlng.lng(),
              title: 'My Venue',
              draggable: true,
              infoWindow: {
                content: '<p>My Venue</p>'
                },
              dragend: updateMapLink,
            });*/
            saveEvent();
          } else {
            app.alert("We cannot locate your address.  Please drag the marker to the event location");
            app.hideIndicator();
            map.setDraggable(true);
            map.setTitle("My Venue");
            return;
          }
        },
      });
    } else {
      saveEvent();
    }
  });
});




//=============================Event Tickets===========================================
app.onPageInit('event-tickets', function(page) {
  //var pageData = page.context;
  $$(document).find('.ticket-image').each(function () {
    var imageSrc = $$(this).prop('src');
    var http = new XMLHttpRequest();
    http.open('HEAD', imageSrc, false);
    http.send();
      if (http.status == 404) {
        $$(this).prop('src', config.server +'/thumbnails/tickets/0/portrait.png');
      }
  });

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });

  $$('.add-ticket').on('click', function () {
    mainView.router.load ({
      url: "views/events/add-ticket.html",
    });
    //$$('.view-popup').html(addTicket({id:eventId}));
    //app.popup('.form-popup');
  });

  $$('.edit-ticket').on('click', function() {
    var ticketId = $$(this).attr('ticket-id');

    var selectedTicket = SEARCHJS.matchArray(selectedEventLocal.tickets, {id: Number(ticketId)});
    selectedTicket = selectedTicket[0];
    mainView.router.load({
      url: "views/events/edit-ticket.html",
      context: selectedTicket,
    });
  });

  $$('.disable-ticket').on('click', function() {
    var ticketId = $$(this).attr('ticket-id');
    var enabled = $$(this).attr('enabled');
    var thisLink = $$(this);
    var request = {
      ticketId: ticketId,
      captcha: config.secret,
    };
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/disableticket/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 ){
          result = data;
          if (result == "true") {
            if (enabled == 'true') {
              thisLink.attr('enabled', false);
              thisLink.html('<i class="icon icon-disabled"></i>');
            } else {
              thisLink.attr('enabled', true);
              thisLink.html('<i class="icon icon-enabled"></i>');
            }
          } else {
            app.alert("There was a problem completing your request");
          }
        }
      },
      error: function (xhr, status){
        app.alert("There was a problem completing your request");
      },
    });

  });

  $$('.delete-ticket').on('click', function() {

    var ticketId = $$(this).attr('ticket-id');
    var onConfirmDelete = function () {
      var request = {
        eventId: selectedEventLocal.id,
        ticketId: ticketId,
        captcha: config.secret,
      };
      var nocache = "?t="+moment().unix();
      var returnEvent;
      $$.ajax({
        async: true,
        timeout: 20 * 1000,
        url: config.server + "/api/deleteticket/" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        //xhrFields: { withCredentials: true },
        data: request,
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            returnEvent = JSON.parse(data);
            if (returnEvent && returnEvent.id) {
              selectedEventLocal = returnEvent;
              mainView.router.load({
                url: 'views/events/event-tickets.html',
                //ignoreCache: true,
                context: selectedEventLocal,
                reload: true,
              });
            } else {
              app.alert("There was an error deleting this ticket");
            }
          }
        },
        error: function (xhr, status){
          app.alert("There was an error deleting this ticket");
        },
      });

    };

    var onCancelDelete = function() {
      return;
    };

    app.confirm("Are you sure you want to delete this ticket? This action cannot be undone!", onConfirmDelete, onCancelDelete);
  });

});


app.onPageInit('edit-ticket', function(page) {
  var cropper = null;
  var thisTicket = app.formToJSON('#edit-ticket-form');
  var imageType = "ticket";
  $$('.edit-image').on('click', function() {
  //  if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
    //  app.alert("Image upload is only supported for Android version 5.0 and greater");
    //  return;
  //  }
    var cameraOptions = Images.cameraOptions();
    //alert(JSON.stringify(cameraOptions));
    camera.getPicture(function(imageURI) {
      //alert(imageURI);
      app.popup('.image-popup');
      $$('#imageCropper').prop('src', imageURI);
        var image = document.getElementById('imageCropper');
        cropper = Images.cropper(image, 27/10);
    }, function (err) {
      cropper.destroy();
      app.alert(err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;

 $$('.crop-image').on('click', function() {
    uploading = true;
    var image = cropper.getCroppedCanvas().toDataURL('image/jpeg')
    var originalImage = $$(document).find('#imageCropper').prop('src');
    //var blob = util.dataToBlob(image);
    var cropData = cropper.getData();
    cropper.destroy();
    $$(document).find('#edit-ticket-image').prop('src', image);
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
    ft.upload(originalImage, encodeURI(Server.ticketImageUpload), function(data) {
      //app.hideProgressbar();
      data = data.response.split(':');
      var imageServerPath = data[1];
      imageServerPath = imageServerPath.substring(1, imageServerPath.length - 2 );
      $$('#edit-ticket-image-path').val(imageServerPath);
      var imageData = [];
      var item = {
        cropX: Math.round(cropData.x),
        cropY: Math.round(cropData.y),
        cropW: Math.round(cropData.width),
        cropH: Math.round(cropData.height)
      };
      imageData.push(item);
      var request = {
        ticketId: thisTicket.id,
        ticketType: thisTicket.tickettype,
        src: imageServerPath,
        images: imageData,
        eventId: selectedEventLocal.id
      };
      var nocache = "?t="+moment().unix();
      var result;
      $$.ajax({
        async: true,
        timeout: 20 * 1000,
        url: config.server + "/api/ticketimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {

          if (status == 200 || status == 0 ){
            app.hideProgressbar();
            uploading = false;
            result = data;
          }
        },
        error: function(status, xhr) {
          app.hideProgressbar();
          uploading = false;
          app.alert("There was a problem saving the ticket image");
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

  $$('.update-ticket').on('click', function () {
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if ( !eventsService.validateForm('#edit-ticket-form') ) {return;}
    var updatedTicket = app.formToJSON('#edit-ticket-form');
    updatedTicket.eventid = selectedEventLocal.id;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating Ticket");
    var returnEvent = {};
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/editticket/" +nocache,
      method: "POST",
      timeout: 20 * 1000,
      contentType: "application/x-www-form-urlencoded",
      data: updatedTicket,
      //data: data,
      xhrFields: { withCredentials: true },
      //header: {"Get-Cookie" : storedUser.session},
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          app.hidePreloader();
          if (cropper) {
            cropper.destroy();
          }
          app.alert("Ticket Update Successful!");
          returnEvent = JSON.parse(data);
          if (returnEvent && returnEvent.id) {
            selectedEventLocal = returnEvent;

          //  alert(JSON.stringify(selectedEventLocal));
            mainView.router.back({
              url: 'views/events/event-tickets.html',
              force: true,
              context: selectedEventLocal,
              reload: true,
              reloadPrevious: true,
            });
          }
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Oops! Something went wrong");
      },
    });
  });

  var ticketLimitPicker = appPickers.ticketLimit();
  $$('input#ticket-limit').on('click', function () {
    ticketLimitPicker.open();
  });

});



app.onPageInit('add-tickets', function(page) {
  var ticketCategoryPicker = appPickers.ticketCategory();
  var ticketLimitPicker = appPickers.ticketLimit();
  var cropper;
  $$('#ticket-category').on('focusin click', function () {
    ticketCategoryPicker.open();
  });

  $$('#ticket-limit').on('focusin click', function () {
    ticketLimitPicker.open();
  });

  $$('#ticket-category').on('change', function() {
    var category = $$(this).val();
    if (category == "Donation") {
      $$('#tickettype').val("DONATION");
      $$('#tickettype').addClass('disabled');
    } else if (category == "Reserve (free)") {
      $$('#tickettype').val("RESERVE");
      $$('#tickettype').addClass('disabled');
      $$('#ticketprice').val("0.00");
      $$('#ticketprice').addClass('disabled');
    } else if (category == "Paid") {
      $$('#tickettype').val("");
      $$('#tickettype').removeClass('disabled');
      //$$('#ticketprice').val("0.00");
      $$('#ticketprice').removeClass('disabled');
    }

  });

  $$('.edit-image').on('click', function() {
    //if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
    //  app.alert("Image upload is only supported for Android version 5.0 and greater");
    //  return;
    //}
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      app.popup('.image-popup');
      $$('#imageCropper').prop('src', imageURI);
        var image = document.getElementById('imageCropper');
        cropper = Images.cropper(image, 27/10);
    }, function (err) {
      cropper.destroy();
      app.alert(err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;
  $$('.crop-image').on('click', function() {
    var image = cropper.getCroppedCanvas().toDataURL('image/jpeg')
    var originalImage = $$(document).find('#imageCropper').prop('src');
  //  var blob = util.dataToBlob(image);
    var cropData = cropper.getData();
    cropper.destroy();
    $$(document).find('#add-ticket-image').prop('src', image);
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
    ft.upload(originalImage, encodeURI(Server.ticketImageUpload), function(data) {
      //app.hideProgressbar();
      data = data.response.split(':');
      var imageServerPath = data[1];
      imageServerPath = imageServerPath.substring(1, imageServerPath.length - 2 );
      //alert(imageServerPath);
      $$('#add-ticket-image-path').val(imageServerPath);
      var imageData = [];
      var item = {
        cropX: Math.round(cropData.x),
        cropY: Math.round(cropData.y),
        cropW: Math.round(cropData.width),
        cropH: Math.round(cropData.height)
      };
      imageData.push(item);
      var request = {
        ticketId: 0,
        //ticketType: thisTicket.tickettype,
        src: imageServerPath,
        images: imageData,
        //eventId: selectedEventLocal.id
      };
      var nocache = "?t="+moment().unix();
      var result;
      $$.ajax({
        async: true,
        timeout: 20 * 1000,
        url: config.server + "/api/ticketimages" + nocache,
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        data: request,
        xhrFields: { withCredentials: true },
        success: function(data, status, xhr) {

          if (status == 200 || status == 0 ){
            app.hideProgressbar();
            uploading = false;
            result = data;
            //alert(JSON.stringify(data));
          }
          //app.hidePreloader();
        },
        error: function(status, xhr) {
          app.hideProgressbar();
          uploading = false;
          app.alert("There was a problem saving the ticket image");
        }

      });
    }, function (err) {
      app.hideProgressbar();
      uploading = false;
      cropper.destroy();
      err = JSON.stringify(err);
      if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
        app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
      } else {
        app.alert("Oops! Something went wrong. Please Try Again.");
      }
    }, options);
  });

  $$('.save-ticket').on('click', function () {
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if ( !eventsService.validateForm('#add-ticket-form') ) {return;}
    var newTicket = app.formToJSON('#add-ticket-form');
    newTicket.eventId = selectedEventLocal.id;
    //alert(JSON.stringify(data));
    var nocache = "?t="+moment().unix();
    app.showPreloader("Adding Ticket");
    var returnEvent = {};
    $$.ajax({
      async: true,
      url: config.server + "/api/addticket/" + nocache,
      method: "POST",
      timeout: 30 * 1000,
      contentType: "application/x-www-form-urlencoded",
      data: newTicket,
      xhrFields: { withCredentials: true },
      //header: {"Get-Cookie" : storedUser.session},
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          app.hidePreloader();
          app.alert("Ticket Added Successfully!");
          returnEvent = JSON.parse(data);
          if (returnEvent && returnEvent.id) {
            selectedEventLocal = returnEvent;
            mainView.router.back({
              url: 'views/events/event-tickets.html',
              context: selectedEventLocal,
              force: true,
            });
          }
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Oops! Something went wrong");
      },
    });
  });

});

//*******************************************************************************


app.onPageAfterAnimation('update-venue-details', function(page) {

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });




  var venueAddress = selectedEventLocal.venue +" "+selectedEventLocal.city+" "+selectedEventLocal.country;
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
}, { enableHighAccuracy: true, timeout: 30000 });


  var venueType = appPickers.venueType('venue-type');
  var venueCountry = appPickers.countries('venue-country');
  $$('input#venue-type').on('click', function () {
    venueType.open();
  });

  $$('input#venue-country').on('click', function () {
    venueCountry.open();
  });

  $$('input').on('change', function() {
    $$('#venue-select').val(0);
    $$('.smart-select .item-after').text('Custom');
  });

  $$('#venue-select').on('change', function() {
    var venueId = Number($$(this).val());
    if (venueId > 0) {
      var venues = page.context.venues.Venue_Names;
      var venue = SEARCHJS.matchArray(venues, {value: venueId});
      venue = venue[0];
      $$('#venue-address').val(venue.address);
      $$('#venue-city').val(venue.city);
      $$('#venue-country').val(venue.country);
      $$('#venue-maplink').val(venue.mapLink);
    }

  });

  $$('.save-event').on('click', function () {
    if ( !eventsService.validateForm('#update-venue-details-form') ) {return;}
    var newDetails = app.formToJSON('#update-venue-details-form');
    var options = {
      area: "venue",
      data: newDetails,
    };
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    updateEvent(data, 'views/events/event.html' );
  });

});


app.onPageInit('update-event-details', function(page) {

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });


  var cropper = null;
  var thumbnailCropper;
  var originalImage;
  var croppedImageData
  //app.formFromJSON('#update-event-details-form', selectedEventLocal);

  var eventCurrency = appPickers.currency('currency');
  $$('input#currency').on('click', function () {
    eventCurrency.open();
  });

  var eventCategories = appPickers.eventCategories('event-category');
  $$('input#event-category').on('click', function () {
    eventCategories.open();
  });
  var eventRestrictions = appPickers.eventRestrictions('event-restriction');
  $$('input#event-restriction').on('click', function () {
    eventRestrictions.open();
  });

  var eventDresscode = appPickers.eventDresscode('event-dresscode');
  $$('input#event-dresscode').on('click', function () {
    eventDresscode.open();
  });

  $$('.edit-image').on('click', function() {
  //  if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
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
      app.popup('.image-popup');
      $$('.crop-image').text('Save');
      $$('.cropper-label').text("Main Image");
      $$('#imageCropper').prop('src', imageURI);
        var image = document.getElementById('imageCropper');
        cropper = Images.cropper(image, 27/10);
    }, function (err) {
      cropper.destroy();
      app.alert(err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  var uploading = false;
  $$('.crop-image').on('click', function() {

      if ($$(this).text() == 'Save') {
        $$(document).find('#edit-event-image').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
        croppedImageData = cropper.getData();
        cropper.destroy();
        $$(this).text('Done');
        var image = document.getElementById('imageCropper');
        thumbnailCropper = Images.cropper(image, 106/46, 0.75);
        return;
      }

      //$$(document).find('#edit-event-thumbnail').prop('src', thumbnailCropper.getCroppedCanvas().toDataURL('image/jpeg'));
      var croppedThumbnailData = thumbnailCropper.getData();
      /*var resetCropper = function() {
        $$(this).text('Save');
        $$('.cropper-label').text("Main Image");
      };*/
      resetCropper();
      thumbnailCropper.destroy();
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
      ft.upload(originalImage, encodeURI(Server.eventImageUpload), function(data) {
        //app.hideProgressbar();
        data = data.response.split(':');
        var imageServerPath = data[1];
        imageServerPath = imageServerPath.substring(1, imageServerPath.length - 2 );
        var formatedImageData = [];
        var formatImageData = function (imageData) {
          var item = {
            cropX: Math.round(imageData.x),
            cropY: Math.round(imageData.y),
            cropW: Math.round(imageData.width),
            cropH: Math.round(imageData.height)
          };
          return item;
        }
        formatedImageData.push(formatImageData(croppedThumbnailData));
        formatedImageData.push({});
        formatedImageData.push(formatImageData(croppedImageData));

        var request = {
          src: [imageServerPath, ' '],
          images: [formatImageData(croppedThumbnailData), ' ', formatImageData(croppedImageData)],
          eventId: selectedEventLocal.id
        };
        var nocache = "?t="+moment().unix();
        $$.ajax({
          async: true,
          timeout: 20 * 1000,
          url: config.server + "/api/eventimages" + nocache,
          method: "POST",
          contentType: "application/x-www-form-urlencoded",
          data: request,
          xhrFields: { withCredentials: true },
          success: function(data, status, xhr) {
            if (status == 200 || status == 0 ){
              var result = data;
              if (cropper) {
                cropper.destroy();
              }
              if (thumbnailCropper) {
                thumbnailCropper.destroy();
              }
              app.hideProgressbar();
              uploading = false;
            //} else {
            //  app.alert("There was a problem saving the event images")
            }
          },
          error: function(status, xhr) {
            app.hideProgressbar();
            uploading = false;
            app.alert("There was a problem saving the event images")
          }
        });
      }, function (err) {
        app.hideProgressbar();
        uploading = false;
        if (cropper) {
          cropper.destroy();
        }
        if (thumbnailCropper) {
          thumbnailCropper.destroy();
        }
        err = JSON.stringify(err);
        if (device.platform.toLowerCase() == "android" && parseFloat(device.version) < 5) {
          app.alert("Oops! Something went wrong. Android v"+device.version+" is not fully supported. Please modify your image using suntixx.com");
        } else {
          app.alert("Oops! Something went wrong. Please Try Again.");
        }
      }, options);
  });

  $$('.save-event').on('click', function () {
    if (uploading)  {
      app.alert(language.OTHER.PLEASE_WAIT_UPLOADING);
      return;
    }
    if ( !eventsService.validateForm('#update-event-details-form') ) {return;}
    var newDetails = app.formToJSON('#update-event-details-form');
    newDetails.description = newDetails.description.replace(/\r?\n/g, '<br />');
    //newDetails.description = $$('#description').text();
    //alert(JSON.stringify(newDetails));
    if (cropper) {
      cropper.destroy();
    }
    if (thumbnailCropper) {
      thumbnailCropper.destroy();
    }
    var options = {
      area: "details",
      data: newDetails,
    };
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    //alert(JSON.stringify(data));
    updateEvent(data, 'views/events/event.html');
  });

});

//==================Manage Event POS==========================
$$(document).on('change', 'select#pos-select', function () {
  var selectedPOS = app.formToJSON('#pos-list-form');
  //alert(JSON.stringify(selectedPOS));
  var name2;
  var name4;
  var htmlPOSList = "";
  for (var i=0;i<selectedPOS.posList.length;i++) {
    for(var n=0;n<posList.length;n++) {
      //alert(selectedPOS.posList[i]);
      if (selectedPOS.posList[i] == posList[n].id) {
        name2 = posList[n].name2;
        name4 = posList[n].name4;
        var html = '<li>' +
          '<div class="item-content">' +
            '<div class="item-inner">' +
              '<div class="item-title">'+ name2 +'&nbsp;'+ name4 +'</div>' +
            '</div>'+
          '</div>'+
        '</li>';
        htmlPOSList += html;
        break;
      }
    }
  }
  $$(document).find('#pos-list').html(htmlPOSList);
});

app.onPageInit('update-pos-list', function(page) {
  $$('.save-pos').on('click', function() {
    var posFormData = app.formToJSON('#pos-list-form');
    var options = {
      area: "pos",
      data: posFormData,
    };
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    updateEvent(data);
    //alert(JSON.stringify(result));
  });
});
//==============================================================

//=================Committee Members Actions==================================
app.onPageInit('sell-tickets-list', function(page) {
  var sellerTickets = page.context.tickets;
    //alert(JSON.stringify(sellerTickets));
  $$('.start-selling').on('click', function () {
    var selectedTickets = app.formToJSON('#select-tickets-form');
    var selected = 0;
    for (var i in selectedTickets) {
      if (selectedTickets[i].length > 0) {
        selected++;
      }
    }
    if (selected == 0) {
      app.alert("Plese select ticket(s)");
      return;
    }
    var tickets = util.getTicketsToSell(selectedTickets, sellerTickets);
    //alert(JSON.stringify(tickets));
    // = app.addView('.view-store', {});
    mainView.router.load ({
      url: 'views/selltickets/select-quantity.html',
      context: {
        event:selectedEventLocal,
        tickets: tickets,
        sellerTickets: sellerTickets,
      },
      //ignoreCache: true,
    });
  });

  $$('.back-events').on('click', function () {
    mainView.router.back ({
      url: 'views/events/myevents.html',
      context: allUserEvents,
      force: true,
    });
  });
});

app.onPageInit('purchase-committee-plan', function(page) {
  $$('.add-committee-plan').on('click', function() {
    var planId = $$(this).attr('plan-id');
    var nocache = "?t="+moment().unix();
    var request = {
      planid: planId,
      eventid: selectedEventLocal.id,
      userid: user.id,
    };
    app.showIndicator();
    var result = {};
    $$.ajax({
      timeout: 20 * 1000,
      async: true,
      url: config.server + "/api/addcommitteeplan/"+nocache,
      method: "PUT",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          app.hideIndicator();
          if (result && result.id) {
            selectedEventLocal = result;
            var commTickets = [];
            if (selectedEventLocal.tickets) {
              commTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2});
            }
            mainView.router.load({
              url: 'views/events/committee-tickets.html',
              context: {
                event: selectedEventLocal,
                commTickets: commTickets,
              }
            });
          }
        } else {
          app.hideIndicator();
          app.alert("Oops! Something went wrong");
        }
      },
      statusCode: {
        404: function (xhr) {
          app.hideIndicator();
          app.alert("This Plan is no longer available.  You may need to upgrade this app. For further information, please contact Suntixx Caribbean Limited");
        }
      },
      error: function(status, xhr) {
        app.hidePreloader();
        app.alert("Oops! Something went wrong");
      }
    });
  });
});

app.onPageInit('committee-tickets-list', function(page) {
  $$('.edit-ticket-link').on('click', function() {
    var ticketId = $$(this).attr('ticket-id');
    var tickets = selectedEventLocal.tickets;
    var ticket = SEARCHJS.matchArray(tickets, {id: Number(ticketId)});
    ticket = ticket[0];
    mainView.router.load({
      url: "views/events/edit-committee-ticket.html",
      context: ticket,
    })
    //$$('.view-popup').html(editCommTicket(ticket));
    //app.popup('.form-popup');
  });

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });

  $$('.add-committee-tickets').on('click', function () {
    mainView.router.load ({
      url: 'views/events/add-committee-ticket.html',
    });
  });

  $$('.swipeout').on('delete', function () {
    var ticketId = $$(this).attr('ticketId');
    var request = {
      ticketId: ticketId,
      eventId: selectedEventLocal.id,
      captcha: config.secret
    };
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/deleteticket/" + nocache,
      method: "POST",
      data: request,
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          if (result && result.id) {
            selectedEventLocal = result;
          }
        }
      },
      error: function(status, xhr) {
        app.alert("Oops! There was a problem deleting this Ticket");
      }
    });
  });

  $$('.disable').on('click', function () {
    var ticketId = $$(this).attr('ticketId');
    var enabled = $$(this).attr('status');
    var thisTicket = $$(this);
    var request = {
      ticketId: ticketId,
      captcha: config.secret,
    };
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/disableticket/" + nocache,
      method: "POST",
      data: request,
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          if (enabled == "true") {
            thisTicket.attr('status', 'false');
            $$('#ticket-content-'+ticketId).find('.disable').html('<i class="icon icon-disabled"></i>');
          } else {
            thisTicket.attr('status', 'true');
            $$('#ticket-content-'+ticketId).find('.disable').html('<i class="icon icon-enabled"></i>');
          }
          $$('#ticket-content-'+ticketId).toggleClass('color-gray');
        }
      },
      error: function(status, xhr) {
        app.alert("Oops! There was a problem updating this Ticket");
      }
    });
  });
});

app.onPageInit('edit-committee-ticket', function (page) {
  $$('.update-committee-ticket').on('click', function() {
    var request = app.formToJSON('#edit-commticket-form');
    request.eventid = selectedEventLocal.id;
    request.ticketid = $$(this).attr('ticket-id');
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/editcommitteeticket/" + nocache,
      method: "POST",
      data: request,
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var returnEvent = JSON.parse(data);
          if (returnEvent  && returnEvent.id) {
            selectedEventLocal = returnEvent;
            var commTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2});
            mainView.router.back({
              url: 'views/events/committee-tickets.html',
              force: true,
              context: {
                event: selectedEventLocal,
                commTickets: commTickets,
              }
            });
          }
        }
      },
      error: function(status, xhr) {
        app.alert("Oops! There was a problem updating this Ticket");
      }
    });
  });
});

app.onPageInit('committee-settings', function(page) {
  var userId = page.context.commuserid;
  var assignedUserTickets = page.context.tickets;
  $$('.assign-tickets').on('click', function() {
    var committee = selectedEventLocal.commuser;
    var assignedUserTicketIds = [];
    //var i;
    var committeeTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2});
    for (var i=0;i<assignedUserTickets.length;i++) {
      assignedUserTicketIds.push(assignedUserTickets[i].ticket.id);
    }
    var unassignedTickets = SEARCHJS.matchArray(committeeTickets,  {id: assignedUserTicketIds, _not:true});

    mainView.router.load({
      url: 'views/events/assign-committee-tickets.html?user='+userId,
      context: unassignedTickets,
    });

  });

  $$('.delete').on('click', function () {
    var userTicketId = $$(this).attr("userTicketId");
    var nocache = "?t="+moment().unix();
    app.showPreloader("Deleting Ticket");
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/deleteuserticket/" + userTicketId + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var updatedUserTickets = JSON.parse(data);
          app.hidePreloader();
          /*mainView.router.load({
            url: 'views/events/committee-settings.html',
            reload: true,
            context: {
              tickets: updatedUserTickets,
              commuserid: userId,
            }
          });*/
        }
      },
    });
  });

  $$('.back-committee-list').on('click', function () {
    mainView.router.back({
      url: 'views/events/update-committee.html',
      context: selectedEventLocal,
      force: true,
    });
  });

  $$('.disable').on('click', function () {
    var status = $$(this).attr("status");
    var userTicketId = $$(this).attr("userTicketId");
    var request = {
      enable: 0,
      userticketid: userTicketId,
    };
    //alert(status);
    if (status == "false") {
      request.enable = 1;
    }
    //alert(JSON.stringify(request));
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating Ticket");
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/updateuserticket" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var updatedUserTickets = JSON.parse(data);
          app.hidePreloader();
          mainView.router.load({
            url: 'views/events/committee-settings.html',
            reload: true,
            context: {
              tickets: updatedUserTickets,
              commmuserid: userId
            }
          });
        }
      }
    });
  });

  $$('.save-quantity').on('click', function () {
    var userTicketId = $$(this).attr("userTicketId");
    var newQuantity = $$('#newquantity-'+userTicketId).val();
    var oldQuantity = $$('#oldquantity-'+userTicketId).val();
    //alert(userTicketId);
    var request = {
      newquantity: newQuantity,
      oldquantity: oldQuantity,
      userticketid: userTicketId,
    };
    var nocache = "?t="+moment().unix();
    app.showPreloader("Updating Ticket");
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/updateuserticket" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var updatedUserTickets = JSON.parse(data);
          app.hidePreloader();
          mainView.router.load({
            url: 'views/events/committee-settings.html',
            reload: true,
            context: {
              tickets: updatedUserTickets,
              commuserid: userId
            },
          });
        }
      },
      error: function (xhr, status) {
        app.hidePreloader();
        app.alert("Oops! Something went wrong");
      }
    });
  });
});

app.onPageInit('committee-tickets-assignment', function(page) {

  var userId = page.query.user;

  $$('.save-committee-ticket-assignments').on('click', function() {
    var data = app.formToJSON('#ticket-assignment-form');
    var tickets = data.tickets;
    var i;
    var ticketIds = tickets[0];
    for(i=1;i<tickets.length;i++){
      ticketIds += "-"+tickets[i];
    }
    var request = {
      userId: userId,
      eventId: selectedEventLocal.id,
      ticketIds: ticketIds,
    };
    var nocache = "?t="+moment().unix();
    app.showPreloader("Assigning Tickets");
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
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
            context: {
              tickets: result,
              commuserid: userId,
            },
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
  });
});

app.onPageInit('committee-menu', function(page) {
  if (selectedEventLocal.commuser.length == 0) {
    app.popup('.enable-committee');
  }

  $$('.committee-terms-agree').on('click', function () {
    app.closeModal('.enable-committee');
  });

  $$('.committee-terms-cancel').on('click', function () {
    app.closeModal('.enable-committee');
    mainView.router.back();
  });

});

app.onPageInit('add-committee-tickets', function(page) {
  var request;
  var saveTicket = function () {
    var nocache = "?t="+moment().unix();
    app.showPreloader("Adding Ticket");
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/addcommitteeticket/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          app.hidePreloader();
          result = JSON.parse(data);
          if (result && result.id) {
            selectedEventLocal = result;
            var commTickets = [];
            if (selectedEventLocal.tickets) {
              commTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2});
            }
            mainView.router.back({
              url: 'views/events/committee-tickets.html',
              force: true,
              context: {
                event: selectedEventLocal,
                commTickets: commTickets,
              }
            });
          }


        } else {
          app.hidePreloader();
          app.alert("Oops! Something went wrong.");
          return;
        }
      },
      error: function(status, xhr) {
        app.hidePreloader();
        app.alert("Oops! Something went wrong.");
        return;
      }
    });
  };


  $$('.save-ticket').on('click', function() {
    if(!eventsService.validateForm('#add-ticket-form')) {return;}
    request = app.formToJSON('#add-ticket-form');
    request.eventId = selectedEventLocal.id;
    saveTicket();
  });

  /*$$('.committee-terms-agree').on('click', function() {
    request.boxofficerequested = 1;
    saveTicket();
  });

  /*$$('.committee-terms-cancel').on('click', function() {
    request = null;
    mainView.router.back({
      url: 'views/events/event.html',
      force: true,
      content: selectedEventLocal,
    });
  });*/
});



app.onPageInit('update-committee',  function(page) {
  $$('.add-member').on('click', function() {
    mainView.router.load({
      url: 'views/events/add-committee.html'
    });
  });

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });

  $$('.swipeout').on('delete', function () {
    var commUserId = $$(this).attr('commId');
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/deletecommittee/"+selectedEventLocal.id+"/"+commUserId + nocache,
      method: "GET",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = data;
        }
      }
    });
  });

  $$('.committee-settings').on('click', function () {
    var commUserId = $$(this).attr('user-id');
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/getusertickets/"+ selectedEventLocal.id+ "/"+commUserId + nocache,
      method: "GET",
      //contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      //data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var userTickets = JSON.parse(data);
          mainView.router.load({
            url: 'views/events/committee-settings.html',
            context: {
              tickets: userTickets,
              commuserid: commUserId,
            },
          });
        }
      },
    });
  });
});



 app.onPageInit('add-committee', function(page) {
  var numberOfEntries = 1;
  $$('.add-another').on('click', function () {
    numberOfEntries++;
    $$('#commuser-info').append(addNew(numberOfEntries));
    mainView.router.reloadPage();
  });

  function addNew (offset) {
    var entry = '<li class="swipeout">' +
                  '<div class="swipeout-content">' +
                  //'  <ul class="no-indent">' +
                      '<div class="row">' +
                        '<div class="item-content  col-50">' +
                          '<div class="item-inner">' +
                          '<i class="icon icon-required"></i>'+
                          '<div class="item-subtitle color-red form-error fname'+ offset+'"></div>'+
                            '<div class="item-input">' +
                              '<input type="text" placeholder="First Name" class="fname" name="fname'+ offset+'" required/>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                        '<div class="item-content col-50">' +
                          '<div class="item-inner">'+
                          '<i class="icon icon-required"></i>'+
                          '<div class="item-subtitle color-red form-error lname'+ offset+'"></div>'+
                            '<div class="item-input">'+
                              '<input type="text" placeholder="Last Name" class="lname" name="lname'+ offset+'" required/>'+
                            '</div>'+
                          '</div>'+
                      '  </div>'+
                      '</div>'+
                      '<div class="row">'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                          '<i class="icon icon-required"></i>'+
                          '<div class="item-subtitle color-red form-error email'+ offset+'"></div>'+
                            '<div class="item-input">'+
                              '<input type="email" placeholder="Email Address" class="email" name="email'+ offset+'" required/>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                    '  </div>'+
                    '<div class="divider"></div>'+
                      //
                  //  '</ul>'+
                  '</div>'+
                  '<div class="swipeout-actions-right">'+
                    '<a href="#" class="swipeout-delete">Delete</a>'+
                  '</div>'+
                '</li>';


          return entry;
        }

  $$('.save-committee').on('click', function() {
    if (!eventsService.validateForm('#add-committee-form')) {return;}
    var formData = app.formToJSON('#add-committee-form');
    var request = {
      committeeList: [],
      userId: user.id,
      eventId : selectedEventLocal.id,
    };
    for (var i = 1;i <= numberOfEntries; i++) {
      var item ={};
      item.fname = (formData['fname'+ i]);
      item.lname = (formData['lname'+ i]);
      item.email = (formData['email'+ i]);
      request.committeeList.push(item);
    }
    //alert(JSON.stringify(request.committeeList));
    //return;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Adding Committee Members");
    var returnEvent;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/addcommittee/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      data: request,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          returnEvent = JSON.parse(data);
          app.hidePreloader();
          if (returnEvent && returnEvent.id) {
            //app.closeModal();
            selectedEventLocal = returnEvent;
            mainView.router.back({
              url: 'views/events/update-committee.html',
              ignoreCache: true,
              context: selectedEventLocal,
              force: true,
            });
          }
        }
      },
      error: function(status, xhr) {
        app.hidePreloader();
        app.alert("There was a problem adding Sellers");
      }
    });

  });
});

//===============Access Control Actions=====================================
app.onPageInit('update-access-list', function(page) {
  $$('.add-scanners').on('click', function() {
    mainView.router.load({
      url: 'views/events/add-scanners.html'
    });
  });

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });

  $$('.swipeout').on('delete', function () {
    var scannerId = $$(this).attr('scannerId');
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/deletescanner/"+selectedEventLocal.id+"/"+scannerId + nocache,
      method: "GET",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          //alert(JSON.stringify(result));
          if (result && result.id) {
            selectedEventLocal = result;
            //alert(JSON.stringify(selectedEventLocal));
          }
        }
      },
      error: function(status, xhr) {
        app.alert("There was a problem deleting this Access Control Device");
      }
    });
  });
});

app.onPageInit('add-scanners', function(page) {
  $$('#scanuserItem').hide();
  var numberOfEntries = 1;

  $$('.add-another').on('click', function () {
    numberOfEntries++;
    $$('#scanuser-info').append(addNew(numberOfEntries));
    mainView.router.reloadPage();
  });

  function addNew (offset) {
    var entry = '<li class="swipeout">' +
                  '<div class="swipeout-content">' +
                  //'  <ul class="no-indent">' +
                      '<div class="row">' +
                        '<div class="item-content  col-50">' +
                          '<div class="item-inner">' +
                          '<i class="icon icon-required"></i>'+
                          '<div class="item-subtitle color-red form-error fname'+ offset+'"></div>'+
                            '<div class="item-input">' +
                              '<input type="text" placeholder="First Name" class="fname" name="fname'+ offset+'" required/>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                        '<div class="item-content col-50">' +
                          '<div class="item-inner">'+
                          '<i class="icon icon-required"></i>'+
                          '<div class="item-subtitle color-red form-error lname'+ offset+'"></div>'+
                            '<div class="item-input">'+
                              '<input type="text" placeholder="Last Name" class="lname" name="lname'+ offset+'" required/>'+
                            '</div>'+
                          '</div>'+
                      '  </div>'+
                      '</div>'+
                      '<div class="row">'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                          '<i class="icon icon-required"></i>'+
                          '<div class="item-subtitle color-red form-error email'+ offset+'"></div>'+
                            '<div class="item-input">'+
                              '<input type="email" placeholder="Email Address" class="email" name="email'+ offset+'" required/>'+
                            '</div>'+
                          '</div>'+
                        '</div>'+
                    '  </div>'+
                    '<div class="divider"></div>'+
                      //
                  //  '</ul>'+
                  '</div>'+
                  '<div class="swipeout-actions-right">'+
                    '<a href="#" class="swipeout-delete">Delete</a>'+
                  '</div>'+
                '</li>';


          return entry;
        }


  $$('.save-scanners').on('click', function() {
    if ( !eventsService.validateForm('#add-scanners-form') ) {return;}
    var formData = app.formToJSON('#add-scanners-form');
    var request = {
      scannerList: [],
      userId: user.id,
      eventId : selectedEventLocal.id,
    };
    for (var i = 1;i <= numberOfEntries; i++) {
      var item ={};
      item.fname = (formData['fname'+ i]);
      item.lname = (formData['lname'+ i]);
      item.email = (formData['email'+ i]);
      request.scannerList.push(item);
    }
    var nocache = "?t="+moment().unix();
    app.showPreloader("Adding Scanners");
    var returnEvent;
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/addscanners/" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      //contentType: "application/json; charset=utf-8",
      xhrFields: { withCredentials: true },
      timeout: 20 * 1000,
      //data: JSON.stringify(request),
      data: request,
      success: function(data, status, xhr) {
        app.hidePreloader();
        if (status == 200){
          returnEvent = JSON.parse(data);
          if (returnEvent && returnEvent.id) {
            selectedEventLocal = returnEvent;
            mainView.router.back({
              url: 'views/events/update-access.html',
              context: selectedEventLocal,
              force: true,
            });
          }
        }
      },
      error: function(status, xhr) {
        app.hidePreloader();
        app.alert("There was a problem saving the Access Control Devices")
      },
    });
  });

});

//======================Report functions==========================
app.onPageInit('report', function (page) {
  $$('.pull-to-refresh-content').on('refresh', function () {
    setTimeout(function () {
      var nocache = "?t="+moment().unix();
      var result;
      $$.ajax({
        async: true,
        timeout: 20 * 1000,
        url: config.server + "/api/event/" + selectedEventLocal.id + nocache,
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            result = JSON.parse(data);
            if (result && result.id>0) {
              selectedEventLocal = result;
              var tickets = {
                onlinetickets: SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 0}),
                preprintedtickets: SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 1}),
                boxofficetickets: SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2}),
              };
              for (var x in tickets) {
                var html = '';
                for (var i=0;i<tickets[x].length;i++) {
                  var tType = tickets[x][i];
                  html+=  '<div class="row no-gutter">' +
                            '<div class="col-40 ticket-details">'+ tType.tickettype + '</div>'+
                            '<div class="col-15 ticket-details">$'+ tType.price.toFixed(2)+'</div>'+
                            '<div class="col-15 ticket-details" style="text-align:center">' + tType.soldquantity+ '</div>'+
                            '<div class="col-15 ticket-details" style="text-align:center">'+ tType.Balance +'</div>'+
                            '<div class="col-15 ticket-details" style="text-align:center">'+ tType.scannedquantity +'</div>'+
                          '</div>';
                }
                $$('#'+x).html(html);
              }
            }
          }
        },
        error: function(status, xhr) {
          app.alert("There was a problem downloading report information");
          return;
        },
      });
      /*var newReport ="";
      var tickets = selectedEventLocal.tickets;
      var x;
      for (x in tickets) {
        var balance = tickets[x].quantity - tickets[x].soldquantity;
        newReport += '<div class="row">';
        newReport += '<div class="col-40 ticket-details">'+ tickets[x].tickettype + '</div>';
        newReport += '<div class="col-15 ticket-details">$'+ tickets[x].price.toFixed(2)+'</div>';
        newReport += '<div class="col-15 ticket-details">' + tickets[x].soldquantity+ '</div>';
        newReport += '<div class="col-15 ticket-details">'+ balance +'</div>';
        newReport += '<div class="col-15 ticket-details">'+ tickets[x].scannedquantity +'</div>';
        newReport += '</div>';
      }
      $$('#ticket-report-details').html(newReport);*/
      app.pullToRefreshDone();
    }, 2000 );
  });

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });
});
