app.onPageAfterAnimation('access-gate-list', function(page) {
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
    //alert(JSON.stringify(selectedGates));
    //allEvents = JSON.parse(Server.getEvents(user.id));
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
    //alert(JSON.stringify(selectedGates));
    //allEvents = JSON.parse(Server.getEvents(user.id));
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


app.onPageInit('scanner-result', function (page) {
  var selectedTickets = page.context.tickets;
  var ticketList = util.serializeTicketTypes(selectedTickets);

  //manual scan button Handler
  $$('.manual-scan-button').on('click', function () {
    var code = $$('.barcode').val();
    if (code == "") {
       autoScan();
    } else {
      var scannedTime = new Date().toISOString();
      //alert (ticketList);
      var scanResult = JSON.parse(Server.verifyScan(code, selectedEventLocal.id, user.id, ticketList , scannedTime));
      //alert(JSON.stringify(scanResult));
      updateScannerResultPage(code, scanResult);
    }
    $$('.barcode').val('');
  });

  $$('.auto-scan').prop('checked', storage.getItem('autoscan'));
  if ($$('.auto-scan').prop('checked') == true) {
    //  autoScan();      //alert("auto scan");
   }

  $$('.auto-scan').on('change', function () {
    //alert($$(this).prop('checked'));
    if ($$(this).prop('checked') == true) {

      config.settings.autoScan = true;
      storage.setItem('autoscan', true);
      //alert(config.settings.autoScan);
    //  $('.auto-scan-config').prop('checked', true);
       //autoScan();
    } else {
      //alert($$(this).val());
      config.settings.autoScan = false;
      storage.setItem('autoscan', false);
      //alert(config.settings.autoScan);
    //  $('.auto-scan-config').prop('checked', false);
    }

  });

  //turn on auto scanner if automatic scan checkbox is checked
  //if ($$('.auto-scan').attr('checked') == 'checked') {
  //    autoScan();
      //alert("auto scan");
  // }

});

function autoScan() {

  cordova.plugins.barcodeScanner.scan(
    function (result) {
      //  alert("We got a barcode\n" +
          //    "Result: " + result.text + "\n" +
          //    "Format: " + result.format + "\n" +
          //    "Cancelled: " + result.cancelled);

      var code = result.text;
      var ticketList = util.serializeTicketTypes();
      var scannedTime = new Date().toISOString();
      var scanResult = JSON.parse(Server.verifyScan(code, selectedEventLocal.id, user.id, ticketList , scannedTime));
      updateScannerResultPage(code, scanResult);
    //  return result.text;
    },
    function (error) {
        alert("Scanning failed: " + error + ".\n Please Try Again!");
        return;
    }
  );
}


//update scanner page with recent scan results information
function updateScannerResultPage (code, scanResult) {
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
}
