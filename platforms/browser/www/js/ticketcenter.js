//===============My Tickets Functions===================================
app.onPageInit('purchases', function (page) {

  var upcomingPurchases;
  upcomingPurchases = JSON.parse(Server.getPurchases(user.id, 1));
  if (upcomingPurchases.length > 0) {
    $$('#upcomingPurchasesTab').html(Template7.templates.purchasesTemplate(upcomingPurchases));
  }

  $$('#upcomingPurchasesTab').on('show', function () {
    //var upcomingPurchases;
    upcomingPurchases = JSON.parse(Server.getPurchases(user.id, 1));
    if (upcomingPurchases.length > 0) {
      $$('#upcomingPurchasesTab').html(Template7.templates.purchasesTemplate(upcomingPurchases));
    }

    $$('.purchase-link').on('click', function () {
      //alert('clicked');
      var purchaseId = $$(this).attr('purchase-id');
      var eventId = $$(this).attr('event-id');
      var userTickets = JSON.parse(Server.getTickets(purchaseId, eventId));
      var thisEvent = JSON.parse(Server.getEvent(eventId));

      //alert(JSON.stringify(userTickets));
      //alert(thisEvent.EnglishStartDate+ '' +thisEvent.EnglishStartTime);
      mainView.router.load({
        url: 'views/tickets/tickets.html',
        context: {
          tickets: userTickets,
          event: thisEvent,
        }
      });

    });
  });

  $$('#previousPurchasesTab').on('show', function () {
    var previousPurchases = {};
    previousPurchases = JSON.parse(Server.getPurchases(user.id, 2));
    if (previousPurchases.length > 0) {
      $$('#previousPurchasesTab').html(Template7.templates.purchasesTemplate(previousPurchases));
    }

    $$('.purchase-link').on('click', function () {
      //alert('clicked');
      var purchaseId = $$(this).attr('purchase-id');
      var eventId = $$(this).attr('event-id');
      var userTickets = JSON.parse(Server.getTickets(purchaseId, eventId));
      var thisEvent = JSON.parse(Server.getEvent(eventId));

      //alert(JSON.stringify(userTickets));
      //alert(thisEvent.EnglishStartDate+ '' +thisEvent.EnglishStartTime);
      mainView.router.load({
        url: 'views/tickets/tickets.html',
        context: {
          tickets: userTickets,
          event: thisEvent,
        }
      });

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

  $$('.purchase-link').on('click', function () {
    var purchaseId = $$(this).attr('purchase-id');
    var eventId = $$(this).attr('event-id');
    var userTickets = JSON.parse(Server.getTickets(purchaseId, eventId));
    var thisEvent = JSON.parse(Server.getEvent(eventId));

    mainView.router.load({
      url: 'views/tickets/tickets.html',
      context: {
        tickets: userTickets,
        event: thisEvent,
      }
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

});

app.onPageInit('ticket-barcodes', function(page) {
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
      var id = $$('.barcode-active').attr('id');
      var code = $$('.barcode-active').attr('code');
      var nameonticket = $$('.barcode-active').attr('nameonticket');
      qrcode = new QRCode(document.getElementById(id), qrcodeOptions(code));
      $$('#barcode-text').text(code);
      $$('#barcode-nameonticket').text(nameonticket);
    },
  });
  //barcodeSwiper.slideTo(index, 10, true);


  barcodeSwiper.on('SlideChangeEnd', function () {
    var code = $$('.barcode-active').attr('code');
    if ($$('.barcode-active').html() == "" ) {
      var id = $$('.barcode-active').attr('id');

      var qrcode = new QRCode(document.getElementById(id), qrcodeOptions(code));
    }
    $$('#barcode-text').text(code);
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
