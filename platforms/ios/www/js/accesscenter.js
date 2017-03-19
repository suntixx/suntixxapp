
//var ticketList;
var syncWithServer = null;

app.onPageInit('scanner-result', function (page) {
  var selectedTickets = [];
  var ticketList;
  var selectedTicketsArray;
  if (selectedEventLocal.user.id == user.id) {
    $$('#right-panel-menu').html(Menus.ownerScan);
  } else {
    $$('#right-panel-menu').html(Menus.scan);
  }
  console.log(page.fromPage.url);
  app.accordionOpen(".choose-tickets");

  //console.log(selectedTicketsArray.toString());
  //Scanner.open();
  setTimeout(function () {
    syncWithServer = setInterval(accessService.garbageCollector, 60000);
  }, 2000);

  $$('.barcode').prop("disabled", true);
  setTimeout(function () {
    cordova.plugins.Keyboard.close();
  }, 500);


  accessService.downloadBarcodes();

  $$('.accordion-item').on('opened', function() {
      $$('.manual-scan-button').hide();
  });

  $$('.accordion-item').on('closed', function() {
    $$('.manual-scan-button').show();
  });

  $$('.select-all').on('click change', function() {
      $$('.ticket-checkbox').prop('checked', $$(this).prop('checked'));
  });

  $$('.ticket-checkbox').on('click change', function() {
      if ($$(this).prop('checked') == false) {
          $$('.select-all').prop('checked', false);
      }
  });

  $$('.select-tickets').on('click', function() {
    var selectedGates = app.formToJSON('#select-gates-form');
    delete selectedGates.select_all;
    var selected = 0;
    for (var i in selectedGates) {
      if (selectedGates[i].length > 0) {
        selected++;
      }
    }
    if (selected == 0) {
      app.alert("Plese select ticket(s)");
      return;
    }
    app.accordionClose(".choose-tickets");
    ticketList = util.serializeTicketTypes(selectedGates);
    selectedTicketsArray = ticketList.split('-');
    var quantity = {
        total: 0,
        scanned: 0
    };

    $$('.barcode').prop('disabled', false);
    $$('.barcode').focus();

    db.executeSql("SELECT COUNT(*) AS totalquantity FROM localScan WHERE tickettypeid IN ("+ util.stringifyTicketTypes(selectedGates)+ ")", [], function(res) {
      //console.log(res);
      quantity.total = res.rows.item(0).totalquantity;
      db.executeSql("SELECT COUNT(*) AS scannedquantity FROM localScan WHERE tickettypeid IN ("+ util.stringifyTicketTypes(selectedGates)+ ") AND scancount != 0", [], function(res) {
        //console.log(res);
        quantity.scanned = res.rows.item(0).scannedquantity;
        console.log(quantity);
        $$('.scanned-quantity').html(quantity.scanned);
        $$('.total-quantity').html(quantity.total);
      }, function (e) {
          console.log("Cannot get unscanned tickets: "+ e.message);
          //app.hideIndicator();
      });
    }, function (e) {
        console.log("Cannot get total tickets: "+ e.message);
        //app.hideIndicator();
    });
  });

  //manual scan button Handler
  $$('.manual-scan-button').on('click', function () {
      var code = $$('.barcode').val().trim().toUpperCase();
      var scannedTime = moment(new Date()).toISOString();
        if (code == "") {
            accessService.autoScan(ticketList);
        } else if (config.settings.onlineScan) {
            accessService.serverScan(code, scannedTime, ticketList);
        } else {
              accessService.localScan(code, scannedTime, ticketList);
        }
  });

  $$('.scan-page-content').on('keydown', function(e) {
    //console.log(e.which);
    if(e.which == 13) {
        var code = $$('.barcode').val().trim().toUpperCase();
        var scannedTime = moment(new Date()).toISOString();
        if (code == "") {
             app.addNotification({
                message: language.ACCESS.BARCODE_NOT_FOUND,
                button: {
                    text: language.OTHER.CLOSE,
                },
                onClose: function () {
                    $$('.barcode').focus();
                }
            });
        } else if (config.settings.onlineScan) {
            accessService.serverScan(code, scannedTime, ticketList);
        } else {
            accessService.localScan(code, scannedTime, ticketList);
        }
    }
  });


  $$('.online-scan').prop('checked', config.settings.onlineScan);
  if (config.settings.onlineScan) {
    $$('.icon-internet').addClass('active');
  }

  $$('.online-scan').on('change', function () {
    if ($$(this).prop('checked') == true) {
      if (navigator.onLine) {
        config.settings.onlineScan = true;
        $$('.icon-internet').addClass('active');
      } else {
        app.addNotification({
          message: language.SYSTEM.INTERNET_ERROR,
          hold: 2000
        });
        config.settings.onlineScan = false;
        $$('.online-scan').prop('checked', config.settings.onlineScan);
      }
    } else {
      config.settings.onlineScan = false;
      $$('.icon-internet').removeClass('active');
    }
    storage.setItem('settings', JSON.stringify(config.settings));
  });


  $$('.auto-scan').prop('checked', config.settings.autoScan);

  $$('.auto-scan').on('change', function () {
    if ($$(this).prop('checked') == true) {
      config.settings.autoScan = true;
      accessService.autoScan(ticketList);
    } else {
      config.settings.autoScan = false;
    }
    storage.setItem('settings', JSON.stringify(config.settings));
  });

  if ($$('.auto-scan').attr('checked') == 'checked') {
      accessService.autoScan(ticketList);
  }

  $$('.scan-history').on('opened', function () {
    var loading = false;
    var scanHistory = page.context.scanhistory.data;
    var lastIndex = $$('.list-block li').length;
    var maxItems = scanHistory.length;
    var itemsPerLoad = 20;

    // Attach 'infinite' event handler
    $$('.infinite-scroll').on('infinite', function () {
      if (loading) return;
      loading = true;
      // Emulate 1s loading
      setTimeout(function () {
        loading = false;
        if (lastIndex >= maxItems) {
          app.detachInfiniteScroll($$('.infinite-scroll'));
          $$('.infinite-scroll-preloader').remove();
          return;
        }
        // Generate new items HTML
        var html = '';
        for (var i = lastIndex + 1; i <= lastIndex + itemsPerLoad; i++) {
          html += '<li class="item-content">'+
                    '<div class="item-inner color-' + scanHistory[i].scancolor+'">'+
                     '<div class="item-title-row">'+
                       '<div class="item-title">'+scanHistory[i].code+'</div>'+
                     '</div>'+
                     '<div class="item-subtitle">'+scanHistory[i].scandate+'</div>'+
                     '<div class="item-text">'+scanHistory[i].scanresponse.toUpperCase()+'!</div>'+
                   '</div>'+
                  '</li>';
        }

        $$('.list-block ul').append(html);
        lastIndex = $$('.list-block li').length;
      }, 1000);
    });
  });

  $$('.back-events').on('click', function () {
    eventsView.router.back ({
      url: 'views/events/myevents.html',
      context: allUserEvents,
      force:true,
    });
  });

  $$(document).on('click', '.open-scan-history', function () {
    if (!db) {
      app.alert("Scan History is unavailable");
      return;
    }
    var scanHistory = [];
    db.executeSql("SELECT * FROM scanhistory ORDER BY created_on DESC", [], function(resultSet) {
      for(var x = 0; x < resultSet.rows.length; x++) {
        scanHistory.push(resultSet.rows.item(x));
      }
      var scanHistoryDisplay = {
        data: scanHistory,
        scroll: false,
      };
      if (scanHistory.length > 20) {
        //scanHistoryDisplay.data = scanHistory.slice(0,20);
        scanHistoryDisplay.scroll = true;
      }
      app.popup(Template7.templates.scanHistoryTemplate({
          event: selectedEventLocal,
          scanhistory: scanHistoryDisplay,
        })
      );
    }, function(error) {
      console.log(error);
      app.alert("There was a problem retrieving the scan history.");
    });
  });

});
