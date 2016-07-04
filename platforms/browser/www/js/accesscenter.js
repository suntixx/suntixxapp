app.onPageAfterAnimation('access-gate-list', function(page) {
  if (selectedEventLocal.user.id == user.id) {
    $$('#right-panel-menu').html(Menus.ownerScan);
  } else {
    $$('#right-panel-menu').html(Menus.scan);
  }

  $$('.back-event').on('click', function () {
    mainView.router.back ({
      url: 'views/events/event.html',
      context: selectedEventLocal,
      force:true,
    });
  });

  $$('.start-scanning').on('click', function () {
    var selectedGates = app.formToJSON('#select-gates-form');
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
    mainView.router.load ({
      url: 'views/access/scan.html',
      context: {
        event:selectedEventLocal,
        tickets: selectedGates,
      },
      ignoreCache: true,
    });
  });
});

app.onPageAfterAnimation('assigned-access-gate-list', function(page) {
  $$('#right-panel-menu').html(Menus.scan);

  $$('.start-scanning').on('click', function () {
    var selectedGates = app.formToJSON('#select-gates-form');
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
    mainView.router.load ({
      url: 'views/access/scan.html',
      context: {
        event:selectedEventLocal,
        tickets: selectedGates,
      },
      ignoreCache: true,
    });
  });

  $$('.back-events').on('click', function () {
    mainView.router.back ({
      url: 'views/events/myevents.html',
      context: allUserEvents,
      force: true,
      ignoreCache: true,
    });
  });
});

var ticketList;
app.onPageInit('scanner-result', function (page) {
  var selectedTickets = page.context.tickets;
  ticketList = util.serializeTicketTypes(selectedTickets);

  var manualScan = function() {
    var code = $$('.barcode').val();
    if (code == "") {
       autoScan();
    } else {
      var scannedTime = new Date().toISOString();
      var nocache = "?t="+moment().unix();
      $$.ajax({
        async: true,
        url: config.server + "/api/updatepurchasedticketsstatus/" + code + "/" + selectedEventLocal.id + "/" + user.id + "/" + ticketList + "/" + scannedTime + nocache,
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            var scanResult = JSON.parse(data);
            updateScannerResultPage(code, scanResult);
            updateScanHistory(code, scannedTime, scanResult);
          }
        }
      });
    }
    $$('.barcode').val('');
  };
  //manual scan button Handler
  $$('.manual-scan-button').on('click', function () {
    manualScan();
  });

  $$('.scan-page-content').on('keydown', function(e) {
    if(e.which == 13) {
      manualScan();
    }
  });

  $$('.auto-scan').prop('checked', storage.getItem('autoscan'));
  if ($$('.auto-scan').prop('checked') == true) {
    //  autoScan();      //alert("auto scan");
   }

  $$('.auto-scan').on('change', function () {
    if ($$(this).prop('checked') == true) {
      config.settings.autoScan = true;
      storage.setItem('autoscan', true);
      autoScan();
    } else {
      config.settings.autoScan = false;
      storage.setItem('autoscan', false);
    }

  });

  //turn on auto scanner if automatic scan checkbox is checked
  if ($$('.auto-scan').attr('checked') == 'checked') {
      autoScan();
  }

});

app.onPageInit('scan-history', function(page) {
  var loading = false;

  var lastIndex = $$('.list-block li').length;
  var maxItems = scanHistory.length;
  // Append items per load
  var itemsPerLoad = 20;

  // Attach 'infinite' event handler
  $$('.infinite-scroll').on('infinite', function () {
    if (loading) return;
    loading = true;

    // Emulate 1s loading
    setTimeout(function () {
      loading = false;

      if (lastIndex >= maxItems) {
        myApp.detachInfiniteScroll($$('.infinite-scroll'));
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

var autoScan = function() {

  cordova.plugins.barcodeScanner.scan(
    function (result) {
      var code = result.text;
      var scannedTime = new Date().toISOString();
      var nocache = "?t="+moment().unix();
      $$.ajax({
        async: true,
        url: config.server + "/api/updatepurchasedticketsstatus/" + code + "/" + selectedEventLocal.id + "/" + user.id + "/" + ticketList + "/" + scannedTime + nocache,
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            var scanResult = JSON.parse(data);
            updateScannerResultPage(code, scanResult);
            updateScanHistory(code, scannedTime, scanResult);
          }
        }
      });
    },
    function (error) {
        alert("Scanning failed: " + error + ".\n Please Try Again!");
        return;
    }, {
          "preferFrontCamera" : true, // iOS and Android
          "showFlipCameraButton" : true, // iOS and Android
          "prompt" : "Place a barcode inside the scan area", // supported on Android only
          "formats" : "QR_CODE,CODE_39,CODE_128", // default: all but PDF_417 and RSS_EXPANDED
          "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
      }
  );
};

var updateScanHistory = function(code, scannedTime, scanResult) {
  if (!db) {
    return;
  }
  var scanDate = new Date(scannedTime).moment('YYYY-MM-DD HH:MM:SS');
  var valid = scanResult.TipColor.toLowerCase() == 'green' ? true : false;
  db.transaction(function(tx) {
    var sql = 'INSERT INTO scanhistory (code, scandate, scanresponse, scancolor, valid) VALUES (?,?,?,?,?)';
    tx.executeSql(sql, [code.toUpperCase(), scanDate, scanResult.TipContent.toLowerCase(), scanResult.TipColor.toLowerCase(),  valid], function(tx, resultSet) {
    }, function(tx, error) {
      //alert('INSERT error: ' + error.message);
    });
  }, function(error) {
    myApp.addNotification({
        message: 'Unable to save scan history'
    });
  }, function() {
    //alert('transaction ok');
  });
};
//update scanner page with recent scan results information
var updateScannerResultPage = function (code, scanResult) {
//  alert (scanResult.TipColor);
  //alert (JSON.stringify(scanResult));
  var scanColorBg = 'bg-'+ scanResult.TipColor;
  var scanColorText = 'color-' + scanResult.TipColor;
  //remove red background and text if it exists
  //if ( $$('#page-content').hasClass('bg-red') ){
    $$('#page-content').removeClass('bg-red');
    $$('#scan-information').removeClass('color-red');
    $$('#scan-result').removeClass('color-red');
    $$('#scan-information').removeClass('color-green');
    $$('#scan-result').removeClass('color-green');
//  }
  $$('#page-content').addClass(scanColorBg);
  $$('#scan-information').addClass(scanColorText);
  $$('#scan-result').addClass(scanColorText);
  $$('.code').html("<b>Barcode:</b> " + code.toUpperCase());
  $$('#scan-result').html(scanResult.TipContent.toUpperCase()+"!");
  if (scanResult.purchasemodel) {
    $$('.name-on-ticket').html("<b>Name:</b> " + scanResult.purchasemodel.nameonticket);
    if (scanResult.purchasemodel.ticketScanDate) {
      //var purchaseDate = new Date(scanResult.purchasemodel.ticketScanDate);
      $$('.purchase-date').html("<b>Purchase Date:</b><br>" + scanResult.purchasemodel.ticketScanDate);
    }
    $$('.ticket-id').html("<b>Ticket Id:</b> " + scanResult.purchasemodel.ticketNo);
    if (scanResult.purchasemodel.purchasedate) {
      var previousScanDate = new Date(scanResult.purchasemodel.purchasedate);
      $$('.previous-scan-date').html("<b>Previously Scanned:</b><br> "+ previousScanDate.toLocaleString());
    }
  }
  $$('.barcode').val("");
  //if scan was successful reset background to white after 2 seconds.
  if ( $$('#page-content').hasClass('bg-green') ){
    //alert('green');
    setTimeout(function () {
      $$('#page-content').removeClass('bg-green');
      if ($$('.auto-scan').prop('checked') ) {
        autoScan();
      }
    }, 2000);
  }
};
