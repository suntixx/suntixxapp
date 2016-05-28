
app.onPageAfterAnimation('event-main', function(page) {
  $$('#right-panel-menu').html(Menus.event);

  $$('.back-events').on('click', function () {
    allEvents = JSON.parse(Server.getEvents(user.id));
    mainView.router.back ({
      //url: 'views/events/events.html',
      context: allEvents,
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
    } else if (myEvents.commiteeEventList.length > 0) {
      app.accordionOpen('.committee-events');
    } else if (myEvents.scanningEventList.length > 0) {
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
      url: 'views/events/committee-home.html',
      context: data,
    });
  });

  /*$$('.back-home').on('click', function () {
    allEvents = JSON.parse(Server.getEvents(user.id));
    mainView.router.back ({
      url: 'home.html',
      force: true,
      ignoreCache: true,
    });
  });*/

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
      url: 'views/access/access-home.html',
      context: selectedEventLocal,
    });
  });
});

app.onPageInit('event-details', function(page) {
  var thisEvent = page.context;

  $$('.purchase-tickets').on('click', function () {
    if (!user) {
     app.loginScreen();
      return;
    }
    $$(document).find('.view-main').hide();
    $$(document).find('.view-form').show();
    formView.router.load({
      url: 'views/purchase/select-quantity.html',
      context: thisEvent,
    });
  });
});

//===========================New Event===================================
app.onPageInit('create-new-event', function(page) {




  //var eventHost = appPickers.hostedBy();

  $$('#event-category').on('focus', function() {
    var eventCategories = appPickers.eventCategories('event-category');
    eventCategories.open();
  });

  $$('#event-restriction').on('focus', function() {
    var eventRestrictions = appPickers.eventRestrictions('event-restriction');
    eventRestrictions.open();
  });

  $$('#event-dresscode').on('focus', function() {
    var eventDresscode = appPickers.eventDresscode('event-dresscode');
    eventDresscode.open();
  });

  $$('#currency').on('focus', function() {
    var eventCurrency = appPickers.currency('currency');
    eventCurrency.open();
  });

  var eventHost;
  $$('#event-host').on('focus', function() {
    //alert('here');
    eventHost = appPickers.hostedBy();
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
    formView.router.load({
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

      $$(document).find('#add-event-thumbnail').prop('src', thumbnailCropper.getCroppedCanvas().toDataURL('image/jpeg'));
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
        app.alert("Unable to upload image: "+ err);
      }, options);
  });


});

app.onPageInit('add-venue', function (page) {

  $$('#venue-country').on('focus', function() {
    var countries = appPickers.countries('venue-country');
    countries.open();
  });

  $$('#venue-type').on('focus', function() {
    var venueType = appPickers.venueType('venue-type');
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
    var request = eventsService.generateNewEventRequest(eventDetails, venueDetails);
    //alert(JSON.stringify(request));
    //var selectedEventLocal = JSON.parse(Server.createEvent(request));
    if (selectedEventLocal) {
      $$(document).find('.view-form').hide();
      $$(document).find('.view-main').show();
      mainView.router.load({
        url: 'views/events/event.html',
        context: selectedEventLocal
      });
    } else {
      app.alert("The was an error while trying to create your event");
      formView.router.back();
    }
  });
});


//******************************************************************************



//===========================Sell Tickets

app.onPageInit('sell-quantity', function(page) {
  var userTickets = page.context.tickets;
  var purchaser = page.context.purchaser;

  $$('#ticket-limit').on('focus', function() {
      var ticketLimit = appPickers.ticketLimit();
      ticketLimit.open();
  });

  $$('.save-ticket-quantity').on('click', function() {
    var data = app.formToJSON('#ticket-quantity-form');
    data = util.getQtySummary(data);
    var ticketList = [];
    var totalPrice = 0;
    var tickets = [];
    for(var i=0;i<data.length;i++) {
      var ticketId = Number(data[i].ticketid);
      //alert(data[i].ticketId);
      var thisTicket = SEARCHJS.matchArray(userTickets, {id: ticketId});
      //alert(JSON.stringify(thisTicket));
      var item = {
        id: thisTicket[0].ticket.id,
        tickettype: thisTicket[0].ticket.tickettype,
        price: thisTicket[0].ticket.price,
        name: "",
      };
      var quantity = Number(data[i].quantity);
      if (quantity > 0) {
        tickets.push(thisTicket[0].ticket);
      //  alert(JSON.stringify(thisTicket));


        for(var n=0;n<quantity;n++) {
          ticketList.push(item);
          totalPrice += item.price;
        }
      }
    }
    //alert(JSON.stringify(tickets));
    mainView.router.load ({
      url: 'views/selltickets/ticket-names.html',
      context: {
        purchaser: purchaser,
        cart: ticketList,
        total: totalPrice,
        tickets: tickets,
      },
    });
  });
});

app.onPageInit('sell-ticket-names', function(page) {
  var purchaser = page.context.purchaser;
  var total = page.context.total;
  var tickets = page.context.tickets;
  $$('.save-ticket-names').on('click', function() {
    var cartInfo = app.formToJSON("#ticket-names-form");
    cartInfo = util.getCartSummary(cartInfo);
    var checkoutCart =[];
    //alert(JSON.stringify(cartInfo));
    for( var i=0;i<tickets.length;i++) {
      var id = tickets[i].id;
      //alert(id);
      var cartItem = SEARCHJS.matchArray(cartInfo, {ticketid: id.toString()});
      //alert(JSON.stringify(cartItem));
      if (cartItem.length >0) {
        var lineTotal = cartItem.length * tickets[i].price;
        var lineTicketType = tickets[i].tickettype;
        var lineQuantity = cartItem.length;
        var lineTicketId = id;
        var linePrice = tickets[i].price;
        var lineNames =[];
        //var n;
        for (var n=0;n<cartItem.length;n++) {
          lineNames.push(cartItem[n].nameonticket);
        }
        var cartLineItem = {
          price: linePrice,
          lineTotal: lineTotal,
          ticketType: lineTicketType,
          quantity: lineQuantity,
          ticketId: id,
          names: lineNames,
        };
      //  alert(JSON.stringify(cartLineItem));
        checkoutCart.push(cartLineItem);
      }
      //alert(JSON.stringify(checkoutCart));
    }
    mainView.router.load({
      url: 'views/selltickets/checkout.html',
      context: {
        purchaser: purchaser,
        total: total,
        cart: checkoutCart,

      },
    });
  });
});


//*******************************************************************************


//=============================Event Tickets===========================================
app.onPageAfterAnimation('event-tickets', function(page) {
  var pageData = page.context;
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
    selectedTicket = SEARCHJS.matchArray(pageData.tickets, {id: Number(ticketId)});
    selectedTicket = selectedTicket[0];
    $$('.view-popup').html(editTicket(selectedTicket));
    app.popup('.form-popup');
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
    selectedEventLocal = JSON.parse(Server.updateEvent(selectedEventLocal.id, data));
    mainView.router.back({
      url: 'views/events/event-tickets.html',
      context: selectedEventLocal,
      force: true,
      ignoreCache: true,
    });
  });


  $$('input#ticket-limit').on('focus', function () {
    var ticketLimitPicker = appPickers.ticketLimit();
    ticketLimitPicker.open();
  });

});



app.onPageInit('add-tickets', function(page) {
  var ticketCategoryPicker = appPickers.ticketCategory();
  var ticketLimitPicker = appPickers.ticketLimit();
  var cropper;
  $$('input#ticket-category').on('click', function () {
    //appPickers.ticketCategory.open();
    ticketCategoryPicker.open();
  });

  $$('input#ticket-limit').on('click', function () {
    //appPickers.ticketLimit.open();
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

  //$$('.crop-image').on('click', Images.cropImage(cropper, "ticket"));

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
      //cropper.destroy();
      err = JSON.stringify(err);
      app.alert("Unable to upload image: "+ err);
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
    selectedEventLocal = JSON.parse(Server.updateEvent(eventId, data));
    //alert(JSON.stringify(result));
    //mainView.router.refreshPreviousPage();
    //mainView.router.back();
    mainView.router.back({
      url: 'views/events/event-tickets.html',
      context: selectedEventLocal,
      force: true,
      ignoreCache: true,
    });
  });

});

//*******************************************************************************


app.onPageInit('update-venue-details', function(page) {
  var venueType = appPickers.venueType('venue-type');
  var venueCountry = appPickers.countries('venue-country');
  //app.formFromJSON('#update-event-details-form', selectedEventLocal);

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
    var eventId = $$(this).attr('event-id');
    var selectedEvent = JSON.parse(Server.getEvent(eventId));
    var newDetails = app.formToJSON('#update-venue-details-form');
    var options = {
      area: "venue",
      data: newDetails,
    };
    var data = eventsService.generateUpdateEventRequest(selectedEvent, options);
    //alert(selectedEvent.starttime.substring(0,19));
    alert(JSON.stringify(data));
    Server.updateEvent(eventId, data);
  });

});


app.onPageInit('update-event-details', function(page) {
  var eventCategories = appPickers.eventCategories('event-category');
  var eventRestrictions = appPickers.eventRestrictions('event-restriction');
  var eventDresscode = appPickers.eventDresscode('event-dresscode');
  var eventCurrency = appPickers.currency('currency');
  var cropper;
  var thumbnailCropper;
  var originalImage;
  var croppedImageData
  //app.formFromJSON('#update-event-details-form', selectedEventLocal);

  $$('input#currency').on('click', function () {
    eventCurrency.open();
  });

  $$('input#event-category').on('click', function () {
    eventCategories.open();
  });

  $$('input#event-restriction').on('click', function () {
    eventRestrictions.open();
  });

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
    newDetails.description = $$('#description').text();
    alert(newDetails.description);
    var options = {
      area: "details",
      data: newDetails,
    };
    var data = eventsService.generateUpdateEventRequest(selectedEventLocal, options);
    Server.updateEvent(selectedEventLocal.id, data);
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
    $$.get('views/events/add-committee-ticket.html',
      function(data) {
        $$('.view-popup').html(data);
      });

  });
});


app.onPageInit('committee-settings', function(page) {
  var userId = page.context.commuserid;
  var assignedUserTickets = page.context.tickets;
  $$('.assign-tickets').on('click', function() {
    var committee = selectedEventLocal.commuser;
    var assignedUserTicketIds = [];
    var i;
    for (i=0;i<assignedUserTickets.length;i++) {
      assignedUserTicketIds.push(assignedUserTickets[i].ticket.id);
    }
    var unassignedTickets = SEARCHJS.matchArray(selectedEventLocal.tickets,  {id: assignedUserTicketIds, _not:true});

    mainView.router.load({
      url: 'views/events/assign-committee-tickets.html?user='+userId,
      context: unassignedTickets,
    });

  });

  $$('.disable').on('click', function () {
    var status = $$(this).attr("status");
    var userTicketId = $$(this).attr("userTicketId");
    var request = {
      enable: 0,
      userticketid: userTicketId,
    };
    alert(status);
    if (status == "false") {
      request.enable = 1;
    }
    alert(JSON.stringify(request));
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
    var data = JSON.parse(Server.assignTickets(request));
    mainView.router.back();
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
    var result = JSON.parse(Server.addCommitteeTicket(data));
    mainView.router.back();
  });
});

app.onPageInit('update-committee',  function(page) {
  $$('.add-member').on('click', function() {
    $$.get('views/events/add-committee.html',
      function(data) {
        $$('.view-popup').html(data);
      }
    );
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
  $$('#commuserItem').hide();
  var numberOfEntries = 1;

  $$('.add-another').on('click', function () {
    numberOfEntries++;
    $$('#commuserItem .fname').attr('name', 'fname'+numberOfEntries);
    $$('#commuserItem .lname').attr('name', 'lname'+numberOfEntries);
    $$('#commuserItem .email').attr('name', 'email'+numberOfEntries);
    var commuserItem = $$('#commuserItem').html();
    $$('#commuserItem .fname').removeAttr('name');
    $$('#commuserItem .lname').removeAttr('name');
    $$('#commuserItem .email').removeAttr('name');
    $$('#commuser-info').append(commuserItem);
  });

  $$('.save-committee').on('click', function() {
    var formData = app.formToJSON('#add-committee-form');
    var data = {
      committeeList: [],
      userId: user.id,
      eventId : eventId,
    };
    for (var i = 1;i <= numberOfEntries; i++) {
      var item ={};
      item.fname = (formData['fname'+ i]);
      item.lname = (formData['lname'+ i]);
      item.email = (formData['email'+ i]);
      data.committeeList.push(item);
    }
    selectedEventLocal = JSON.parse(Server.addCommittee(data));
    app.closeModal();
  });
});

//===============Access Control Actions=====================================
app.onPageInit('update-access-list', function(page) {
  $$('.add-scanners').on('click', function() {
    $$.get('views/events/add-scanners.html',
      function(data) {
        $$('.view-popup').html(data);
        app.popup('.form-popup');
      }
    );

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
    $$('#scanuserItem .fname').attr('name', 'fname'+numberOfEntries);
    $$('#scanuserItem .lname').attr('name', 'lname'+numberOfEntries);
    $$('#scanuserItem .email').attr('name', 'email'+numberOfEntries);
    var scanuserItem = $$('#scanuserItem').html();
    $$('#scanuserItem .fname').removeAttr('name');
    $$('#scanuserItem .lname').removeAttr('name');
    $$('#scanuserItem .email').removeAttr('name');
    $$('#scanuser-info').append(scanuserItem);
  });

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
    selectedEventLocal = JSON.parse(Server.addScanners(data));
    mainView.router.back ({
      reloadPrevious: true,
      reload: true,
      //force: true,
      ignoreCache: true,
      //context: selectedEventLocal,
      //url: 'views/events/update-access.html',
    });

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
