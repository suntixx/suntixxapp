var ticketsService = {
  downloadTickets: function(background) {
    $$.ajax({
      async: true,
      cache: false,
      timeout: 1000 * 30,
      url: config.server + "/api/getprofiletickets",
      method: "POST",
      data: { userid: user.id },
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          allUserTickets = JSON.parse(data);
          storage.setItem('myTickets', data);
          if (!background) {
            ticketsView.router.load({
              url: 'views/tickets/purchases.html',
              context: {
                tickets: allUserTickets,
                commevents: allUserEvents.committeeEventList,
              },
            });
          }
        }
      },
      error: function (status, xhr) {
        if (!background) {
          ticketsView.router.load({
            url: 'views/tickets/purchases.html',
            context: {
              tickets: allUserTickets,
              commevents: allUserEvents.committeeEventList,
            },
          });
        }
      }
    });
  }
};

ticketsService.scanCode = function(callback) {

  cordova.plugins.barcodeScanner.scan(
    function (result) {
      callback(null, result);
    },
    function (error) {
      callback(error);
    }, {
        "preferFrontCamera" : false, // iOS and Android
        "showFlipCameraButton" : false, // iOS and Android
        "prompt" : "Place a barcode inside the scan area", // supported on Android only
        //"formats" : "QR_CODE,CODE_39,CODE_128", // default: all but PDF_417 and RSS_EXPANDED
        "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
  });
};

ticketsService.qrcodeOptions = function(code, container) {
  var width = $$(document).find('.'+container).width();
  width = Number(width)/2;

  var options = {
    text: code,
    width: width,
    height: width,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  };
  return options;
};

ticketsService.selectTickettype = function(thisEvent) {
  var ticketTypes = [language.TICKETS.GENERAL, language.TICKETS.VIP, language.OTHER.OTHER];
  var ticketTypesDisplay = null;
  if (thisEvent.tickets && thisEvent.tickets.length > 0) {

    ticketTypes = _.map(thisEvent.tickets, function(item) {
      return item.tickettype+ ' - ' +item.price.toFixed(2)+ ' '+ thisEvent.currency;
    });
    //tickeyTypes = _.map(thisEvent.tickets, function(item) {
    //  return item.tickettype;
  //  });
    ticketTypes.push(language.OTHER.OTHER);
  }
  var picker = app.picker({
    scrollToInput: false,
    closeByOutsideClick: false,
    input: '#',
    toolbarCloseText: language.OTHER.SELECT,
    toolbarTemplate: '<div class="toolbar">'+
                      '<div class="toolbar-inner">'+
                        '<div class="left">&nbsp;'+language.TICKETS.SELECT_TICKETTYPE+'</div>'+
                        '<div class="right">'+
                          '<a href="#" class="link close-picker">{{closeText}}</a>'+
                        '</div>'+
                      '</div>'+
                    '</div>',
    cols: [
      {
        textAlign: 'center',
        values: ticketTypes,
        //displayValues: ticketTypesDisplay,
        onChange: function(p, value, displayValue) {
          //thisTicket.tickettype = value;
          $$(document).find('#wallet-barcode-tickettype').html(value);
        }
      }
    ],
    onClose: function(p) {
      app.accordionOpen($$(document).find('.accordion-item.wallet'));
      if ($$(document).find('#wallet-barcode-tickettype').html() == language.OTHER.OTHER) {
        app.prompt(language.TICKETS.ENTER_TICKETTYPE, function(ticketType) {
          //thisTicket.tickettype = ticketType;
          $$(document).find('#wallet-barcode-tickettype').html(ticketType);
        }, function() {
          p.open();
        });
      }
    }
  });
  picker.open();
  return picker;
};

ticketsService.showTools = function (eventId) {
  var editTools = '<a href="#" class="close-edit-toolbar icon-only"><i class="icon icon-back"></i></a>'+
                  '<a href="#" class="delete-item icon-only" event-id="'+ eventId +'"><i class="icon icon-delete-message"></i></a>'+
                  '<a href="#" class="icon-only"><i class="icon icon-nothing"></i></a>';
  $$('.edit-toolbar .toolbar-inner').html(editTools);
  app.sizeNavbars('.view-tickets');
};

ticketsService.hideTools = function(html, callback) {
  $$('.edit-toolbar .toolbar-inner').html(html);
  app.sizeNavbars('.view-tickets');
  callback();
};
