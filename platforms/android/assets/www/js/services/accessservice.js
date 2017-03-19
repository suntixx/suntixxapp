var accessService = {};

accessService.updateScanHistory = function(code, scannedTime, scanResult, ticketList) {
  if (!db) {
    return;
  }
  var scanDate = moment.utc(scannedTime).format('YYYY-MM-DD HH:MM:SS');
  var valid = scanResult.TipColor.toLowerCase() == 'green' ? true : false;
  db.transaction(function(tx) {
    var sql = 'INSERT INTO scanhistory (code, scandate, scanresponse, scancolor, valid) VALUES (?,?,?,?,?)';
    tx.executeSql(sql, [code.toUpperCase(), scanDate, scanResult.TipContent.toLowerCase(), scanResult.TipColor.toLowerCase(),  valid], function(tx, resultSet) {
      console.log("succcesful scan history save "+code + " at "+scanDate);
    }, function(tx, error) {
    });
  }, function(error) {
    accessService.updateScannerResultPage(code, scanResult, ticketList);
    app.addNotification({
        message: 'Unable to save scan history'
    });
  }, function() {
    accessService.updateScannerResultPage(code, scanResult, ticketList);
    console.log('transaction ok');
  });
};
//update scanner page with recent scan results information
accessService.updateScannerResultPage = function (code, scanResult, ticketList) {
//  alert (scanResult.TipColor);
  $$('.update-screen').html('');
  $$('#page-content').removeClass('bg-red');
  $$('.result-color').removeClass('color-green').removeClass('color-red');
  //alert (JSON.stringify(scanResult));
  var scanColorBg = 'bg-'+ scanResult.TipColor.toLowerCase();
  var scanColorText = 'color-' + scanResult.TipColor.toLowerCase();
  //remove red background and text if it exists
  $$('#page-content').addClass(scanColorBg);
  $$('#scan-information').addClass(scanColorText);
  $$('#scan-result').addClass(scanColorText);
  $$('.code').html("<b>Barcode:</b> " + code.toUpperCase());
  $$('#scan-result').html(scanResult.TipContent.toUpperCase()+"!");
  if (scanResult.purchasemodel) {
    $$('.name-on-ticket').html("<b>"+ language.OTHER.NAME +":</b> " + scanResult.purchasemodel.nameonticket);
    if (scanResult.purchasemodel.ticketScanDate) {
      //var purchaseDate = new Date(scanResult.purchasemodel.ticketScanDate);
      $$('.purchase-date').html("<b>"+ language.ACCESS.PURCHASE_DATE +":</b><br>" + scanResult.purchasemodel.ticketScanDate);
    }
    $$('.ticket-id').html("<b>"+ language.TICKETS.TICKET_ID +":</b> " + scanResult.purchasemodel.ticketNo);
    if (scanResult.purchasemodel.purchasedate) {
      var previousScanDate = new Date(scanResult.purchasemodel.purchasedate);
      $$('.previous-scan-date').html("<b>"+ language.ACCESS.PREVIOUSLY_SCANNED+ ":</b><br> "+ previousScanDate.toLocaleString());
    }
  }
  $$('.barcode').val("");
  $$('.barcode').focus();
  cordova.plugins.Keyboard.close();
  //if scan was successful reset background to white after 2 seconds.
  if ( $$('#page-content').hasClass('bg-green') ){
    //alert('green');
    setTimeout(function () {
      $$('#page-content').removeClass('bg-green');
      if ($$('.auto-scan').prop('checked') ) {
        accessService.autoScan(ticketList);
      }
    }, 2000);
  }
};

accessService.serverScan = function(code, scannedTime, ticketList) {
  $$.ajax({
    async: true,
    cache: false,
    timeout: 30 * 1000,
    url: config.server + "/api/updatepurchasedticketsstatus/" + code + "/" + selectedEventLocal.id + "/" + user.id + "/" + ticketList + "/" + scannedTime,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        var scanResult = JSON.parse(data);
        cordova.plugins.Keyboard.close();
        //accessService.updateScannerResultPage(code, scanResult);
        accessService.updateScanHistory(code, scannedTime, scanResult, ticketList);
        if (scanResult.TipColor.toLowerCase() == "green" || scanResult.TipContent.toLowerCase() == "already scanned") {
          accessService.updateLocalCode(code, scannedTime);
        }
        $$('.barcode').val('');
        $$('.barcode').focus();
      }
    },
    error: function (status, xhr) {
      app.addNotification({
          message: language.ACCESS.SERVER_ERROR,
          hold: 1500
      });
      accessService.localScan(code, scannedTime, ticketList);
    }
  });
};

accessService.localScan = function(code, scannedTime, ticketList) {

  var selectedTicketsArray = ticketList.split('-');
  var scanResult = {};
  db.executeSql("SELECT * FROM localscan WHERE upper(code) = ?", [code], function(resultSet) {
    console.log(resultSet);
    if (resultSet.rows.length > 0 ) {
      if (resultSet.rows.item(0).scancount > 0) {
        //already scanned
        scanResult = {
          TipColor: "red",
          TipContent: language.ACCESS.ALREADY_SCANNED,
          purchasemodel: {
            nameonticket: resultSet.rows.item(0).nameonticket,
            ticketScanDate: resultSet.rows.item(0).scandate,
            purchasedate: resultSet.rows.item(0).purchasedate,
            ticketNo: resultSet.rows.item(0).id
          }
        };
      } else if (selectedTicketsArray.indexOf(resultSet.rows.item(0).tickettypeid) == -1) {
        //wrong gate
        scanResult = {
          TipColor: "red",
          TipContent: language.ACCESS.WRONG_GATE,
          purchasemodel: {
            nameonticket: resultSet.rows.item(0).nameonticket,
            ticketScanDate: resultSet.rows.item(0).scandate,
            purchasedate: resultSet.rows.item(0).purchasedate,
            ticketNo: resultSet.rows.item(0).id
          }
        };
      } else {
        //valid
        scanResult = {
          TipColor: "green",
          TipContent: language.ACCESS.VALID,
          purchasemodel: {
            nameonticket: resultSet.rows.item(0).nameonticket,
            ticketScanDate: resultSet.rows.item(0).scandate,
            purchasedate: resultSet.rows.item(0).purchasedate,
            ticketNo: resultSet.rows.item(0).id
          }
        };


        $$.ajax({
          async: true,
          cache: false,
          url: config.server + "/api/updatepurchasedticketsstatus/" + code + "/" + selectedEventLocal.id + "/" + user.id + "/" + ticketList + "/" + scannedTime,
          method: "GET",
          success: function(data, status, xhr) {
            if (status == 200 || status == 0 ){
              var scanResult = JSON.parse(data);
              accessService.updateLocalCode(code, scannedTime, 1);

            }
          },
          error: function(status, xhr) {
              accessService.updateLocalCode(code, scannedTime, 0);
          }
        });
      }
    } else {
      //barcode invalid
      scanResult = {
        TipColor: "red",
        TipContent: language.ACCESS.BARCODE_INVALID
      };
    }
    //accessService.updateScannerResultPage(code, scanResult);
    accessService.updateScanHistory(code, scannedTime, scanResult, ticketList);
    //$$('.barcode').focus();
    //console.log('transaction ok');
  }, function(error) {
    console.log('SELECT error: ' + error.message);
    app.alert("Scan Error: "+ error.message);
  });
};

accessService.autoScan = function(ticketList) {

  cordova.plugins.barcodeScanner.scan(
    function (result) {
      var code = result.text;
      var scannedTime = moment.utc(new Date());
      if (config.settings.onlineScan) {
          accessService.serverScan(code, scannedTime, ticketList);
      } else {
          accessService.localScan(code, scannedTime, ticketList);
      }
    },
    function (error) {
      $$('.barcode').focus();
        alert("Scanning failed: " + error + ".\n Please Try Again!");
        return;
    }, {
        "preferFrontCamera" : false, // iOS and Android
        "showFlipCameraButton" : false, // iOS and Android
        "prompt" : "Place a barcode inside the scan area", // supported on Android only
        "formats" : "QR_CODE,CODE_39,CODE_128", // default: all but PDF_417 and RSS_EXPANDED
        "orientation" : "portrait" // Android only (portrait|landscape), default unset so it rotates with the device
  });
};

accessService.updateLocalCode = function (thisCode, scannedTime, verified, callback) {
  var query = "UPDATE localScan SET verified = ?, scancount = scancount + 1, scandate = ? WHERE code = ?";
  db.executeSql(query, [verified, scannedTime, thisCode], function(res) {
     console.log("Updated on local server after server update: " + res.rowsAffected);
     var presentScanQuantity = $$('.scanned-quantity').html();
     var newScanQuantity = Number(presentScanQuantity)+ 1;
     $$('.scanned-quantity').html(newScanQuantity);
     if (callback) {
       callback();
     }
  },
  function(error) {
    console.log('UPDATE error: ' + error.message);
    if (callback) {
      callback(err.message);
    }
  });
};

accessService.downloadBarcodes = function() {
  app.showIndicator();
  var result;
  $$.ajax({
    async: true,
    cache: false,
    url: config.server + "/download/eventreports/json/"+ selectedEventLocal.id +"/",
    method: "GET",
    timeout: 120 * 1000,
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        console.log(result.length);
        app.hideIndicator();
        //var databaseLoaded = false;
        var query = "SELECT * FROM localScan WHERE event_id = ?";
        db.executeSql(query,[selectedEventLocal.id], function(res) {
            //console.log(res);
           if (res.rows.length == 0) {
             console.log("downloaded database different");
             db.executeSql('DELETE * FROM localScan', function(res) {
                console.log("localScan cleared");
             }, function (e) {
                console.log("Clearing local database failed: " + e.message);
                //app.hideIndicator();
             });

           }
           var unsyncedIds = [];
           db.executeSql('SELECT id FROM localScan WHERE scancount != 0 AND verified = 0', [], function (res) {
              for (x=0;x<res.rows.length;x++) {
                  unsyncedIds.push(res.rows.item(x));
              }
              var sql = 'INSERT OR REPLACE INTO localScan (id, event_id, code, tickettypeid, nameonticket, scandate, scancount, verified) VALUES (?,?,?,?,?,?,?,?)';
              var sqlArray = [];
              //console.log(unsyncedIds);
              for (var i in result) {
                  //console.log("for loop");
                  if (unsyncedIds.indexOf(result[i].id) < 0) {
                     var values = [result[i].id, selectedEventLocal.id, result[i].code, result[i].tickettypeid, result[i].nameonticket, result[i].scandate, result[i].scancount, result[i].scancount > 0 ? 1: 0];
                     var tmp = [sql, values];
                     sqlArray.push(tmp);
                  }
              }
              //console.log("for finished");
              //console.log(sqlArray);
              db.sqlBatch(sqlArray, function() {
                  console.log('Populated database OK');



              }, function(error) {
                  app.alert("Database Error: Can't save barcodes locally.");
                  console.log('SQL batch ERROR: ' + error.message);
                  app.hideIndicator();
              });

          }, function (e) {
              console.log("build dump query failed: "+ e.message);
              app.hideIndicator();
          });


        },
        function(error) {
          console.log('Event select error: ' + error.message);
          app.hideIndicator();
        });


      }
       app.hideIndicator();

    },
    error: function(status, xhr) {
      app.hideIndicator();
      app.alert(language.ACCESS.BARCODE_DUMP_UNAVAILABLE);
    },
  });
};



accessService.garbageCollector = function () {
  console.log("collecting garbage");
  var unsynced = 0;
  //var unsyncedItems =[];
  var query = "SELECT * FROM localScan WHERE verified = 0 AND scancount != 0";
  db.executeSql(query, [], function (resultSet) {
    unsynced = resultSet.rows.length;
    //console.log(resultSet);
    for(var x = 0; x < resultSet.rows.length; x++) {
     //   unsyncedItems.push(resultSet.rows.item(x));
    //}
        console.log("x: "+ x);
        (function(i) {
            console.log("i: "+ x);
            var nocache = "?t="+moment().unix();
            var thisItem = resultSet.rows.item(i);
            var code = thisItem.code;
            console.log(resultSet.rows.item(i));
            $$.ajax({
              async: true,
              url: config.server + "/api/updatepurchasedticketsstatus/" + thisItem.code + "/" + selectedEventLocal.id + "/" + user.id + "/" + thisItem.tickettypeid + "/" + thisItem.scandate + nocache,
              method: "GET",
              success: function(data, status, xhr) {
                if (status == 200 || status == 0 ) {
                  var query = "UPDATE localScan SET verified = 1 WHERE code = ?";
                  db.executeSql(query, [code], function(res) {
                     console.log("Garbage collector updated: " + res.rowsAffected);
                     unsynced--;
                  },
                  function(error) {
                    console.log('UPDATE error: ' + error.message);
                  });
                }
              },
              error: function(status, xhr) {
                //unsynced++;
              }
            });
        })(x);

    }
    if(unsynced > 0) {
        $$('.garbage-collector').html(
          '<span class="small">' + unsynced + '&nbsp;'+ language.ACCESS.UNSYNCED_BARCODES + '</span>'
        );
    } else {
        $$('.garbage-collector').html('');
    }
  },
  function (tx, error) {
      console.log('SELECT error: ' + error.message);
  });

};
