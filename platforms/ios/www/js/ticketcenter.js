//===============My Tickets Functions===================================
app.onPageInit('purchases', function (page) {

  var showTicketList = function () {
    var purchaseId = $$(this).attr('purchase-id');
    var eventId = $$(this).attr('event-id');
    var userTickets;
    var thisEvent;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Loading Tickets");
    $$.ajax({
      async: true,
      url: config.server + "/api/purchasedtickets/" + eventId + "/" + purchaseId + "/" + user.id + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          userTickets = JSON.parse(data);
          $$.ajax({
            async: true,
            timeout: 20 * 1000,
            url: config.server + "/api/event/" + eventId + nocache,
            method: "GET",
            success: function(data, status, xhr) {
              if (status == 200 || status == 0 ){
                thisEvent = JSON.parse(data);
                app.hidePreloader();
                mainView.router.load({
                  url: 'views/tickets/tickets.html',
                  context: {
                    tickets: userTickets,
                    event: thisEvent,
                  }
                });
              }
            },
            error: function (xhr, status){
              app.hidePreloader();
              app.alert("Oops, there was an error getting the event information");
            },
          });
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Oops, there was an error getting the ticket information");
      },
    });
  }


  $$('#upcomingPurchasesTab').on('show', function () {
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      timeout: 20 * 1000,
      url: config.server + "/api/purchases/1/"  + user.id + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200){
          var upcomingPurchases1 = JSON.parse(data);
          if (upcomingPurchases1.length > 0) {
            $$('#upcomingPurchasesTab').html(Template7.templates.purchasesTemplate(upcomingPurchases1));
          } else {
            $$('#upcomingPurchasesTab').html(noContentMessage);
            $$(document).find('.oops-message').text("You don't have any tickets purchased for upcoming events");
          }
        }
      },
      complete: function (status, xhr) {
        $$('.purchases-link').on('click', showTicketList);
      },
      error: function(status, xhr) {
        app.alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      }
    });
  });

  $$('#upcomingPurchasesTab').trigger('show');

  $$('#previousPurchasesTab').on('show', function () {
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      url: config.server + "/api/purchases/2/" + user.id + nocache,
      method: "GET",
      timeout: 20 * 1000,
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var previousPurchases = JSON.parse(data);
          if (previousPurchases.length > 0) {
            $$('#previousPurchasesTab').html(Template7.templates.purchasesTemplate(previousPurchases));
          } else {
            $$('#previousPurchasesTab').html(noContentMessage);
            $$(document).find('.oops-message').text("You don't have any previously purchased tickets");
          }
        }
      },
      complete: function (status, xhr) {
        $$('.purchases-link').on('click', showTicketList);
      },
      error: function(status, xhr) {
        app.alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      }
    });
  });

  $$('.home').on('click', function () {
    mainView.router.back ({
      url: 'home.html',
      force: true,
      ignoreCache: true,
    });
  });
});

app.onPageInit('tickets-list', function(page) {

  var tickets = page.context.tickets;
  $$('.ticket-link').on('click', function () {
    var index = $$(this).attr('ticket-index');
    var slides = {
      tickets: tickets,
      index: index,
    };
    $$('.view-popup').html(barcodes(slides));
    app.popup('.form-popup');
  });

  $$('.back-purchases').on('click', function() {
    mainView.router.back ({
      url: 'views/tickets/purchases.html',
      force: true,
    });
  });

});

app.onPageInit('ticket-barcodes', function(page) {

  var speed = 20, p=0;
  var animateImage = function() {
    $$('#barcode-verified').css('background-position', p+'px 0');
     p--;
     setTimeout(animateImage, speed);
  };
  animateImage();

  var barcodeType = 0;
  var index = $$('.clicked-ticket').attr('ticket');
  var width = $$('.barcode-container').width();
  width = Number(width)/2;
  var qrcode;
  var qrcodeOptions = function(code) {
    var options = {
      text: code,
      width: width,
      height: width,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    };
    return options;
  }


  var barcodeSwiper = app.swiper('.barcode-container', {
    speed: 400,
    spaceBetween: 0,
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    slideActiveClass: 'barcode-active',
    onInit: function (swiper) {
      swiper.slideTo(index, 10, true);
      if (index == 0) {
        var id = $$('.barcode-active').attr('id');
        var code = $$('.barcode-active').attr('code');
        var ticketId = $$('.barcode-active').attr('ticketid');
        var nameonticket = $$('.barcode-active').attr('nameonticket');
        qrcode = new QRCode(document.getElementById(id), qrcodeOptions(code));
        $$('#barcode-text').text(code);
        $$('#barcode-nameonticket').text(nameonticket);
        $$('#barcode-ticketid').text('#: '+ticketId);
      }
    },
  });
  //barcodeSwiper.slideTo(index, 10, true);


  barcodeSwiper.on('SlideChangeEnd', function () {
    var code = $$('.barcode-active').attr('code');
    var nameonticket = $$('.barcode-active').attr('nameonticket');
    var ticketId = $$('.barcode-active').attr('ticketid');
    if ($$('.barcode-active').html() == "" ) {
      var id = $$('.barcode-active').attr('id');
      var qrcode = new QRCode(document.getElementById(id), qrcodeOptions(code));
    }
    $$('#barcode-nameonticket').text(nameonticket);
    $$('#barcode-text').text(code);
    $$('#barcode-ticketid').text('#: '+ticketId);
  });

  /*$$('.swiper-slide').on('click', function () {
    var code = $$('.barcode-active').attr('code');
    var id = $$('.barcode-active').attr('id');
    if (barcodeType == 0) {
      $$(this).html(code);
      //var b = new Barcode39(id);
      barcode({
                renderToID : id,
                string : code,
                barWidth : 2,
                height : '100',
                showText : true
            });
      barcodeType = 1;
    } else {
      $$(this).html('');
      qrcode = new QRCode(document.getElementById(id), qrcodeOptions(code));
      barcodeType = 0;
    }

  });*/

  //barcodeSwiper.on('init', function() {
  //  alert(barcodeSwiper.activeIndex);
  //});
  //var tickets = page.context;
  //new QRCode(document.getElementById("barcode"), "http://jindo.dev.naver.com/collie");

});
