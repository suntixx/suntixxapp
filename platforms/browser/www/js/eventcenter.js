
app.onPageAfterAnimation('event-main', function(page) {
  $$('#right-panel-menu').html(Menus.event);

  $$('.back-events').on('click', function () {
    //alert('back');
  //  allEvents = JSON.parse(Server.getEvents(user.id));
    mainView.router.back ({
      url: 'views/events/myevents.html',
      context: allUserEvents,
      force: true,
      ignoreCache: true,
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
  });
  $$('.committee-events').on('click', function() {
    app.accordionClose('.managed-events');
    app.accordionClose('.access-events');
  });
  $$('.access-events').on('click', function() {
    app.accordionClose('.committee-events');
    app.accordionClose('.managed-events');
  });

  $$('.event-link').on('click', function () {
    var eventId = $$(this).attr('event-id');
    //var selectedEvent = SEARCHJS.matchArray(myEvents.managedEventList, {id: eventId });
    selectedEventLocal = JSON.parse(Server.getEvent(eventId));
    //alert(JSON.stringify(selectedEventLocal));
    mainView.router.load({
      url: 'views/events/event.html',
      context: selectedEventLocal,
    });
  });

  $$('.committee-event-link').on('click', function () {
    selectedEventId = $$(this).attr('event-id');
    selectedEventLocal = JSON.parse(Server.getEvent(selectedEventId));
    var request = {
      eventId: selectedEventId,
      userId: user.id,
    };
    var sellerTickets = JSON.parse(Server.getUserTickets(request));
    var data = {
      tickets: sellerTickets,
      event: selectedEventLocal,
    };
    //alert (JSON.stringify(sellerTickets));
    mainView.router.load({
      url: 'views/selltickets/committee-home.html',
      context: data,
    });
  });

  $$('.create-event').on('click',  function () {
    mainView.router.load({
      url: 'views/events/create-event.html',
    });
  });

  $$('.home').on('click', function () {
    //allEvents = JSON.parse(Server.getEvents(user.id));
    mainView.router.back ({
      url: 'home.html',
      force: true,
      ignoreCache: true,
    });
  });

  $$(".add-new-purchaser").on('click', function() {
    var purchaserInfo = app.formToJSON('#add-purchaser-form');
    var purchaserAccount = JSON.parse(Server.getUserByEmail(purchaserInfo));
    if (purchaserAccount == null) {
      purchaserAccount = purchaserInfo;
    }
    var request = {
      eventId: selectedEventId,
      userId: user.id,
    };
    var sellerTickets = JSON.parse(Server.getUserTickets(request));
    var data = {
      tickets: sellerTickets,
      purchaser: purchaserAccount
    };
    mainView.router.load({
      url: 'views/selltickets/select-quantity.html',
      context: data,
    });
  });

  $$('.scanning-event-link').on('click', function () {
    var eventId = $$(this).attr('event-id');
    selectedEventLocal = JSON.parse(Server.getEvent(eventId));
    mainView.router.load({
      url: 'views/access/assigned-access-home.html',
      context: selectedEventLocal,
    });
  });
});

app.onPageInit('event-details', function(page) {
  var thisEvent = page.context;
  var location = eventsService.getEventLocation(thisEvent.maplink);
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

  $$('.facebook-link').on('click', function() {
    window.open(thisEvent.facebook, "_system", "");
  });

  $$('.twitter-link').on('click', function() {
    window.open(thisEvent.twitter, "_system", "");
  });

  $$('.purchase-tickets').on('click', function () {
    if (!user) {
     app.loginScreen();
      return;
    }
    mainView.router.load({
      url: 'views/purchase/select-quantity.html',
      context: thisEvent,
    });
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

  $$('#currency').on('focus', function() {
    eventCurrency.open();
  });

  $$('#event-host').on('focus', function() {
    eventHost.open();
  });



  $$('.add-venue').on('click', function() {
    //alert(JSON.stringify(eventHost.displayValue));
    if ( !eventsService.validateForm('#create-event-details-form') ) {return;}
    var eventDetails = app.formToJSON('#create-event-details-form');
    var host = eventHost.displayValue;
    if (!host || host[0] == "personal") { eventDetails.hostedby = 0; }
    else { eventDetails.hostedby = 1; }
    var venueList = JSON.parse(Server.getVenueList());
    mainView.router.load({
      url: 'views/events/add-venue.html',
      context: {
        newEvent: eventDetails,
        venues: venueList,
      },
    });
  });

  var cropper;
  var thumbnailCropper;
  var originalImage;
  var croppedImageData;
  $$('.edit-image').on('click', function() {
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      app.popup('.image-popup');
      $$('#imageCropper').prop('src', imageURI);
        var image = document.getElementById('imageCropper');
        cropper = Images.cropper(image, 27/10);
    }, function (err) {
      cropper.destroy();
      app.alert("Camera Error: " + err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

  $$('.crop-image').on('click', function() {

      if ($$(this).text() == 'Save') {
        $$(document).find('#add-event-image').prop('src', cropper.getCroppedCanvas().toDataURL('image/jpeg'));
        croppedImageData = cropper.getData();
        cropper.destroy();
        $$(this).text('Done');
        var image = document.getElementById('imageCropper');
        thumbnailCropper = Images.cropper(image, 106/46, 0.75);
        return;
      }

      //$$(document).find('#add-event-thumbnail').prop('src', thumbnailCropper.getCroppedCanvas().toDataURL('image/jpeg'));
      var croppedThumbnailData = thumbnailCropper.getData();
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
      ft.upload(originalImage, encodeURI(Server.eventImageUpload), function(data) {
        app.hideProgressbar();
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
        formatedImageData.push({});
        formatedImageData.push(formatImageData(croppedImageData));

        var request = {
          src: [imageServerPath, ' '],
          images: [formatImageData(croppedThumbnailData), ' ', formatImageData(croppedImageData)],
          eventId: selectedEventLocal.id
        };
        var result = JSON.parse(Server.eventImageSave(request));
      }, function (err) {
        app.hideProgressbar();
        cropper.destroy();
        err = JSON.stringify(err);
        app.alert("Oops! Something went wrong");
      }, options);
  });


});

app.onPageInit('add-venue', function (page) {

  var venueAddress = selectedEventLocal.venue +" "+selectedEventLocal.city+" "+selectedEventLocal.country;
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
      title: 'My Location',
      draggable: false,
      infoWindow: {
        content: '<p>My Location</p>'
        },
      dragend: updateMapLink,
    });
  }, function (err) {
  alert('geolocation error '+err);
  }, { enableHighAccuracy: true, timeout: 5000 });


  var countries = appPickers.countries('venue-country');
  $$('#venue-country').on('click', function() {
    countries.open();
  });

  var venueType = appPickers.venueType('venue-type');
  $$('#venue-type').on('click', function() {
    venueType.open();
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
            app.alert("We cannot locate your address.  Please drag the marker to the event location");
            map.setDraggable(true);
            map.setTitle("My Venue");
            return;
          }
        },
      });
    }
    var request = eventsService.generateNewEventRequest(eventDetails, venueDetails);
    if (selectedEventLocal) {
      mainView.router.load({
        url: 'views/events/event.html',
        context: selectedEventLocal
      });
    } else {
      app.alert("The was an error while trying to create your event");
      mainView.router.back();
    }
  });
});


//******************************************************************************



//===========================Sell Tickets

app.onPageInit('sell-quantity', function(page) {
  var userTickets = page.context.tickets;
  var ticketLimit = null;
  $$('#ticket-limit').on('click', function() {
    var available = $$(this).attr('quantity');
    if (available > 10) {
      available = 10;
    }
    if (!ticketLimit) {
      ticketLimit = appPickers.limitPicker('ticket-limit', available );
    }
    ticketLimit.open();
  });

  $$('.save-ticket-quantity').on('click', function() {
    var data = app.formToJSON('#ticket-quantity-form');
    data = util.getQtySummary(data);
    var ticketList = [];
    var userTicketList =[];
    var totalPrice = 0;
    for(var i=0;i<data.length;i++) {
      var ticketId = Number(data[i].ticketid);
      var userTicket = SEARCHJS.matchArray(userTickets, {id: ticketId});

      userTicket = userTicket[0];
      var quantity = Number(data[i].quantity);
      if (quantity > 0) {
        userTicketList.push(userTicket);
        for(var n=0;n< quantity;n++) {
          ticketList.push(userTicket);
          totalPrice += Number(userTicket.ticket.price);
        }
      }
    }
    if (ticketList.length == 0) {
      app.alert("A Quantity is required to continue");
      return;
    }
    mainView.router.load ({
      url: 'views/selltickets/ticket-names.html',
      context: {
        cart: ticketList,
        total: totalPrice,
        userTickets: userTicketList,
        event: selectedEventLocal,
      },
    });
  });
});

app.onPageInit('sell-ticket-names', function(page) {
  var total = page.context.total;
  var userTickets = page.context.userTickets;
  $$('.save-ticket-names').on('click', function() {
    var tickets =[];
    var cartInfo = app.formToJSON("#ticket-names-form");
    cartInfo = util.getCartSummary(cartInfo);
    var checkoutCart =[];
    for( var i=0;i<userTickets.length;i++) {
      var ticket = userTickets[i].ticket;
      var cartItem = SEARCHJS.matchArray(cartInfo, {ticketid: userTickets[i].id.toString()});
      if (cartItem.length >0) {

        var lineTotal = cartItem.length * ticket.price;
        var lineTicketType = ticket.tickettype;
        var lineQuantity = cartItem.length;
        var lineTicketId = ticket.id;
        var linePrice = ticket.price;
        var lineNames =[];
        for (var n=0;n<cartItem.length;n++) {
          if (cartItem[n].nameonticket.trim() == "") {
            lineNames.push("Admit One");
            ticket.nameonticket = "Admit One";
            ticket.userticketid = userTickets[i].id;
            tickets.push(ticket);
          } else {
            lineNames.push(cartItem[n].nameonticket);
            ticket.nameonticket = cartItem[n].nameonticket;
            ticket.userticketid = userTickets[i].id;
            tickets.push(ticket);
          }
        }

        var cartLineItem = {
          price: linePrice,
          lineTotal: lineTotal,
          ticketType: lineTicketType,
          quantity: lineQuantity,
          id: tickets[i].id,
          names: lineNames,
        };
        checkoutCart.push(cartLineItem);
      }
    }
    mainView.router.load({
      url: 'views/selltickets/checkout.html',
      context: {
        total: total,
        cart: checkoutCart,
        event: selectedEventLocal,
        tickets: tickets,
      },
    });
  });
});

app.onPageInit('sell-checkout', function (page) {
  var checkoutCart = page.context;
  $$('.confirm-sale').on('click', function() {
    var purchaser = app.formToJSON('#add-purchaser-form');
    var capitalize = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    var firstname = capitalize(purchaser.fname);
    var lastname = capitalize(purchaser.lname);
    var request = {
      user_id: 0,
      event_id: selectedEventLocal.id,
		  pos_user_id: user.id,
		  cardtype: "Committee-Mobile",
		  nameoncard: firstname +" "+lastname,
      email: purchaser.email,
  		fname: firstname,
  		lname: lastname,
  		ticketsquantity: checkoutCart.tickets.length,
  		totalprice: checkoutCart.total,
      currency: selectedEventLocal.currency,
      tickets: checkoutCart.tickets,
      order: checkoutCart.cart,
    };
    //alert(JSON.stringify(request));
    Server.commPayment(request);
  });
});

//*******************************************************************************


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
    mainView.router.load ({
      url: 'views/events/event.html',
      context: selectedEventLocal
    });
  });

  $$('.add-ticket').on('click', function () {
    var eventId = $$(this).attr('event-id');
    $$('.view-popup').html(addTicket({id:eventId}));
    app.popup('.form-popup');
  });

  $$('.edit-ticket').on('click', function() {
    var ticketId = $$(this).attr('ticket-id');

    var selectedTicket;
    selectedTicket = SEARCHJS.matchArray(selectedEventLocal.tickets, {id: Number(ticketId)});
    selectedTicket = selectedTicket[0];
    $$('.view-popup').html(editTicket(selectedTicket));
    app.popup('.form-popup');
  });

  $$('.disable-ticket').on('click', function() {
    var ticketId = $$(this).attr('ticket-id');
    var enabled = $$(this).attr('enabled');
    var request = {
      ticketId: ticketId,
      captcha: config.secret,
    };
    var result= Server.disableTicket(request);
    //alert(JSON.stringify(returnEvent));
    if (result == "true") {
      if (enabled == 1) {
        $$(this).attr('enabled', 0);
        $$(this).html('<i class="icon icon-disabled"></i>');
      } else {
        $$(this).attr('enabled', 1);
        $$(this).html('<i class="icon icon-enabled"></i>');
      }
    } else {
      app.alert("There was a problem completing your request");
    }
  });

  $$('.delete-ticket').on('click', function() {

    var ticketId = $$(this).attr('ticket-id');
    var onConfirmDelete = function () {
      var request = {
        eventId: selectedEventLocal.id,
        ticketId: ticketId,
        captcha: config.secret,
      };
      var returnEvent = JSON.parse(Server.deleteTicket(request));
      //alert(JSON.stringify(returnEvent));
      if (returnEvent && returnEvent.id) {
        selectedEventLocal = returnEvent;
        mainView.router.load({
          url: 'views/events/event-tickets.html',
          //ignoreCache: true,
          context: selectedEventLocal,
          reload: true,
        });
      }
    };

    var onCancelDelete = function() {
      return;
    };

    app.confirm("Are you sure you want to delete this ticket? This action cannot be undone!", config.appName, onConfirmDelete, onCancelDelete);
  });

});


app.onPageInit('edit-ticket', function(page) {
  var cropper;
  var thisTicket = app.formToJSON('#edit-ticket-form');
  var imageType = "ticket";
  $$('.edit-image').on('click', function() {
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
      app.alert("Camera Error: " + err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

 $$('.crop-image').on('click', function() {
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
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
      app.showPreloader("Uploading Image");
    };
    ft.upload(originalImage, encodeURI(Server.ticketImageUpload), function(data) {
      app.hideProgressbar();data = data.response.split(':');
      var imageServerPath = data[1];
      imageServerPath = imageServerPath.substring(1, imageServerPath.length - 2 );
      $$(document).find('#edit-ticket-image-path').val(imageServerPath);
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
      var result = JSON.parse(Server.ticketImageSave(request));
      app.hidePreloader();
    }, function (err) {
      app.hideProgressbar();
      app.hidePreloader();
      err = JSON.stringify(err);
      app.alert("Unable to upload image: "+ err);
    }, options);
  });

  $$('.update-ticket').on('click', function () {
    var newTicket = app.formToJSON('#edit-ticket-form');
    var options = {
      edit: true,
      data: newTicket,
      area: "tickets"
    };
    app.closeModal();
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    var returnEvent = JSON.parse(Server.updateEvent(selectedEventLocal.id, data));

    if (returnEvent && returnEvent.id) {
      selectedEventLocal = returnEvent;
      mainView.router.back({
        url: 'views/events/event-tickets.html',
        ignoreCache: true,
        context: selectedEventLocal,
        force: true,
      });
    }
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
  $$('input#ticket-category').on('click', function () {
    ticketCategoryPicker.open();
  });

  $$('input#ticket-limit').on('click', function () {
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
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      app.popup('.image-popup');
      $$('#imageCropper').prop('src', imageURI);
        var image = document.getElementById('imageCropper');
        cropper = Images.cropper(image, 27/10);
    }, function (err) {
      cropper.destroy();
      app.alert("Camera Error: " + err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

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
    var container = $$('body');
    var ft = new FileTransfer();
    ft.onprogress = function(progressEvent) {
      app.showProgressbar(container, 'yellow');
    };
    ft.upload(originalImage, encodeURI(Server.ticketImageUpload), function(data) {
      app.hideProgressbar();data = data.response.split(':');
      var imageServerPath = data[1];
      imageServerPath = imageServerPath.substring(1, imageServerPath.length - 2 );
      $$(document).find('#add-ticket-image-path').val(imageServerPath);
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
      var result = JSON.parse(Server.ticketImageSave(request));
    }, function (err) {
      app.hideProgressbar();
      cropper.destroy();
      err = JSON.stringify(err);
      app.alert("Something went wrong");
    }, options);
  });

  $$('.save-ticket').on('click', function () {
    var eventId = $$(this).attr('event-id');
    //var selectedEvent = JSON.parse(Server.getEvent(eventId));
    var newTicket = app.formToJSON('#add-ticket-form');
    var options = {
      add: true,
      data: newTicket,
      area: "tickets"
    };
    app.closeModal();
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    //alert(JSON.stringify(data));
    var returnEvent = JSON.parse(Server.updateEvent(eventId, data));
    //alert(JSON.stringify(result));
    //mainView.router.refreshPreviousPage();
    //mainView.router.back();
    if (returnEvent && returnEvent.id) {
      selectedEventLocal = returnEvent;
      mainView.router.back({
        url: 'views/events/event-tickets.html',
        ignoreCache: true,
        context: selectedEventLocal,
        force: true,
      });
    }
  });

});

//*******************************************************************************


app.onPageAfterAnimation('update-venue-details', function(page) {

  var venueAddress = selectedEventLocal.venue +" "+selectedEventLocal.city+" "+selectedEventLocal.country;
  var updateMapLink = function(data) {
    var latitude = data.latLng.lat();
    var longitude = data.latLng.lng();
    var newMapLink = "http://maps.google.com/?ie=UTF8&hq=&ll="+latitude+","+longitude+"&z=15";
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
          var newMapLink = "http://maps.google.com/?ie=UTF8&hq=&ll="+latitude+","+longitude+"&z=15";
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


  var venueType = appPickers.venueType('venue-type');
  var venueCountry = appPickers.countries('venue-country');
  $$('input#venue-type').on('click', function () {
    venueType.open();
  });

  $$('input#venue-country').on('click', function () {
    venueCountry.open();
  });

  $$('#venue-select').on('change', function() {
    //mainView.router.back();
    var venueId = $$(this).val();
    //alert(venueId);
    var i;
    for (i=0; i < venueList.Venue_Names.length; i++) {
      if (venueList.Venue_Names[i].value == venueId) {
          $$('#venue-address').val(venueList.Venue_Names[i].address);
          $$('#venue-city').val(venueList.Venue_Names[i].city);
          $$('#venue-country').val(venueList.Venue_Names[i].country);
          $$('#venue-maplink').val(venueList.Venue_Names[i].mapLink);
          break;

      }
    }
  });

  $$('.save-event').on('click', function () {
    //var eventId = $$(this).attr('event-id');
    //var selectedEvent = JSON.parse(Server.getEvent(eventId));
    var newDetails = app.formToJSON('#update-venue-details-form');
    var options = {
      area: "venue",
      data: newDetails,
    };
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    var returnEvent = JSON.parse(Server.updateEvent(selectedEventLocal.id, data));

    if (returnEvent && returnEvent.id) {
      selectedEventLocal = returnEvent;
      mainView.router.back({
        url: 'views/events/event.html',
        ignoreCache: true,
        context: selectedEventLocal,
        force: true,
      });
    }
  });

});


app.onPageInit('update-event-details', function(page) {




  var cropper;
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
    var cameraOptions = Images.cameraOptions();
    camera.getPicture(function(imageURI) {
      originalImage = imageURI;
      app.popup('.image-popup');
      $$('#imageCropper').prop('src', imageURI);
        var image = document.getElementById('imageCropper');
        cropper = Images.cropper(image, 27/10);
    }, function (err) {
      cropper.destroy();
      app.alert("Camera Error: " + err);
    },
      cameraOptions
    );
  });

  $$('.crop-cancel').on('click', function () {
    cropper.destroy();
  });

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
      ft.upload(originalImage, encodeURI(Server.eventImageUpload), function(data) {
        app.hideProgressbar();
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
        var result = JSON.parse(Server.eventImageSave(request));
      }, function (err) {
        app.hideProgressbar();
        cropper.destroy();
        err = JSON.stringify(err);
        app.alert("Unable to upload image: "+ err);
      }, options);
  });

  $$('.save-event').on('click', function () {
    var newDetails = app.formToJSON('#update-event-details-form');
    //newDetails.description = $$('#description').text();
    //alert(JSON.stringify(newDetails));
    var options = {
      area: "details",
      data: newDetails,
    };
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    //alert(JSON.stringify(data));
    var returnEvent = JSON.parse(Server.updateEvent(selectedEventLocal.id, data));

    //alert(JSON.stringify(selectedEventLocal));
    if (returnEvent && returnEvent.id) {
      selectedEventLocal = returnEvent;
      mainView.router.back({
        url: 'views/events/event.html',
        ignoreCache: true,
        context: selectedEventLocal,
        force: true,
      });
    }
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
    var result = JSON.parse(Server.updateEvent(selectedEventLocal.id, data));
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
    mainView.router.load ({
      url: 'views/selltickets/select-quantity.html',
      context: {
        event:selectedEventLocal,
        tickets: tickets,
      },
      //ignoreCache: true,
    });
  });

  $$('.back-events').on('click', function () {
    //alert('back');
  //  allEvents = JSON.parse(Server.getEvents(user.id));
    mainView.router.back ({
      url: 'views/events/myevents.html',
      context: allUserEvents,
      force: true,
      ignoreCache: true,
    });
  });
});

app.onPageInit('committee-tickets-list', function(page) {
  $$('.edit-ticket-link').on('click', function() {
    var ticketId = $$(this).attr('ticket-id');
    var tickets = selectedEventLocal.tickets;
    var ticket = SEARCHJS.matchArray(tickets, {id: Number(ticketId)});
    ticket = ticket[0];
    $$('.view-popup').html(editCommTicket(ticket));
    app.popup('.form-popup');
  });

  $$('.add-committee-tickets').on('click', function () {
  ////  $$.get('views/events/add-committee-ticket.html',
  //    function(data) {
    //    $$('.view-popup').html(data);
    //  });
    mainView.router.load ({
      url: 'views/events/add-committee-ticket.html',
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
    var committeeTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {permissions: 9});
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

    //alert(JSON.stringify(request));
    var updatedUserTickets = JSON.parse(Server.deleteUserTicket(userTicketId));
    mainView.router.load({
      url: 'views/events/committee-settings.html',
      reload: true,
      context: updatedUserTickets,
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
    var updatedUserTickets = JSON.parse(Server.updateUserTicket(request));
    mainView.router.load({
      url: 'views/events/committee-settings.html',
      reload: true,
      context: updatedUserTickets,
    });
  });

  $$('.save-quantity').on('click', function () {
    var userTicketId = $$(this).attr("userTicketId");
    var newQuantity = $$('#newquantity-'+userTicketId).val();
    //alert(userTicketId);
    var request = {
      newquantity: newQuantity,
      userticketid: userTicketId,
    };
    //alert(JSON.stringify(request));
    var updatedUserTickets = JSON.parse(Server.updateUserTicket(request));
    mainView.router.load({
      url: 'views/events/committee-settings.html',
      reload: true,
      context: updatedUserTickets,
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
    //alert(JSON.stringify(request));
    Server.assignTickets(request);
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
  $$('.save-ticket').on('click', function() {
    var data = app.formToJSON('#add-ticket-form');
    data.eventId = selectedEventLocal.id;
    Server.addCommitteeTicket(data);
  });
});



app.onPageInit('update-committee',  function(page) {
  $$('.add-member').on('click', function() {
    mainView.router.load({
      url: 'views/events/add-committee.html'
    });
  });



  $$('.swipeout').on('delete', function () {
    var data = {};
    data.commUserId = $$(this).attr('commId');
    data.eventId = selectedEventLocal.id
    var result = Server.deleteCommittee(data);
  });

  $$('.committee-settings').on('click', function () {
    var commUserId = $$(this).attr('user-id');
    var request = {
      userId: commUserId,
      eventId: selectedEventLocal.id,
    }
    var userTickets = JSON.parse(Server.getUserTickets(request));
    //alert(JSON.stringify(userTickets));
    var context = {
      tickets: userTickets,
      commuserid: commUserId,
    };
    //alert(JSON.stringify(context));
    //alert(editCommMember(context));
    //$$('.view-popup').html(editCommMember(context));
    //app.popup('.form-popup');
    mainView.router.load({
      url: 'views/events/committee-settings.html',
      context: context,
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
                            '<div class="item-input">' +
                              '<input type="text" placeholder="First Name" class="fname" name="fname'+ offset+'"/>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                        '<div class="item-content col-50">' +
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="text" placeholder="Last Name" class="lname" name="lname'+ offset+'"/>'+
                            '</div>'+
                          '</div>'+
                      '  </div>'+
                      '</div>'+
                      '<div class="row">'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="email" placeholder="Email Address" class="email" name="email'+ offset+'"/>'+
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
    var formData = app.formToJSON('#add-committee-form');
    var data = {
      committeeList: [],
      userId: user.id,
      eventId : selectedEventLocal.id,
    };
    for (var i = 1;i <= numberOfEntries; i++) {
      var item ={};
      item.fname = (formData['fname'+ i]);
      item.lname = (formData['lname'+ i]);
      item.email = (formData['email'+ i]);
      data.committeeList.push(item);
    }
    var returnEvent = JSON.parse(Server.addCommittee(data));
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

  });
});

//===============Access Control Actions=====================================
app.onPageInit('update-access-list', function(page) {
  $$('.add-scanners').on('click', function() {
    /*$$.get('views/events/add-scanners.html',
      function(data) {
        $$('.view-popup').html(data);
        app.popup('.form-popup');
      }
    );*/
    mainView.router.load({
      url: 'views/events/add-scanners.html'
    });

  });

  $$('.swipeout').on('delete', function () {
    var scannerId = $$(this).attr('scannerId');
    var data = {};
    data.scannerId = scannerId;
    data.eventId = selectedEventLocal.id;
    var result = Server.deleteScanner(data);

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
                            '<div class="item-input">' +
                              '<input type="text" placeholder="First Name" class="fname" name="fname'+ offset+'"/>' +
                            '</div>' +
                          '</div>' +
                        '</div>' +
                        '<div class="item-content col-50">' +
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="text" placeholder="Last Name" class="lname" name="lname'+ offset+'"/>'+
                            '</div>'+
                          '</div>'+
                      '  </div>'+
                      '</div>'+
                      '<div class="row">'+
                        '<div class="item-content">'+
                          '<div class="item-inner">'+
                            '<div class="item-input">'+
                              '<input type="email" placeholder="Email Address" class="email" name="email'+ offset+'"/>'+
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
    var formData = app.formToJSON('#add-scanners-form');
    var i;
    var data = {
      scannerList: [],
      userId: user.id,
      eventId : selectedEventLocal.id,
    };
    var scannerList;
    for (i = 1;i <= numberOfEntries; i++) {
      var item ={};
      item.fname = (formData['fname'+ i]);
      item.lname = (formData['lname'+ i]);
      item.email = (formData['email'+ i]);
      data.scannerList.push(item);
    }
    var returnEvent = JSON.parse(Server.addScanners(data));
    /*mainView.router.back ({
      reloadPrevious: true,
      reload: true,
      //force: true,
      ignoreCache: true,
      //context: selectedEventLocal,
      //url: 'views/events/update-access.html',
    });*/
    if (returnEvent && returnEvent.id) {
      selectedEventLocal = returnEvent;
      mainView.router.back({
        url: 'views/events/update-access.html',
        ignoreCache: true,
        context: selectedEventLocal,
        force: true,
      });
    }

  });

});

//======================Report functions==========================
app.onPageInit('report', function (page) {
  $$('.pull-to-refresh-content').on('refresh', function () {
    setTimeout(function () {
      var eventId = $$('.event-report').attr('event-id');
      var selectedEvent = JSON.parse(Server.getEvent(eventId));
      var newReport ="";
      var tickets = selectedEvent.tickets;
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
      $$('#ticket-report-details').html(newReport);
      app.pullToRefreshDone();
    }, 2000 );
  });
});
