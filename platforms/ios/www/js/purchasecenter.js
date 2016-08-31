app.onPageInit('purchase-quantity', function(page) {
  var thisEvent = page.context;
  //var ticketLimitPicker = null;

  $$('.back-main').on('click', function() {
    app.showTab('#homepage-tab');
    //storeView.destroy();
    //storeView = null;
  });

  $$('.ticket-limit').on('focusin click', function () {
    //alert("clicked");
    var id = $$(this).attr('id');
    var ticketLimit = $$(this).attr('ticketLimit');
    var available = $$(this).attr('quantity');
    if (Number(available) < Number(ticketLimit)) {
      ticketLimit = available;
    }
    //if (!ticketLimitPicker) {
    //app.alert(ticketLimit+ " "+ id);
    var ticketLimitPicker = appPickers.limitPicker(id, ticketLimit);
  //  }
    ticketLimitPicker.open();
  });

  var processing = false;
  $$('.save-ticket-quantity').on('click', function() {
    if(processing) {
      return;
    }
    processing = true;
    var data = app.formToJSON('#ticket-quantity-form');

    var eventTickets = thisEvent.tickets;
    data = util.getQtySummary(data);
    var ticketList = [];
    var totalPrice = 0;
    var tickets = [];

    for(var i=0;i<data.length;i++) {
      var ticketId = Number(data[i].ticketid);
      var thisTicket = SEARCHJS.matchArray(eventTickets, {id: ticketId});
      var item = {
        id: thisTicket[0].id,
        tickettype: thisTicket[0].tickettype,
        price: thisTicket[0].price,
        name: "",
      };
      var quantity = Number(data[i].quantity);

      thisTicket[0].requestedqty = quantity;
      if (quantity > 0 ) {
        tickets.push(thisTicket[0]);

        for(var n=0;n<quantity;n++) {
          ticketList.push(item);
          totalPrice += item.price;
        }
      }
    }
    if (ticketList.length == 0) {
      app.alert("You must enter a ticket quantity to continue");
      processing = false;
      return;
    }

    storeView.router.load ({
      url: 'views/purchase/purchase-ticket-names.html',
      context: {
        cart: ticketList,
        total: totalPrice,
        tickets: tickets,
        event: thisEvent,
      },
    });
  });
});



app.onPageInit('purchase-ticket-names', function(page) {
  var context = page.context;
  var tickets = page.context.tickets;
  var thisEvent = page.context.event;
  var processing = false;
  $$(".step-one").on('click', function() {
    var thisEvent = context.event;
    for (var x in thisEvent.tickets) {
      var thisTicket = SEARCHJS.matchArray(tickets, {id: Number(thisEvent.tickets[x].id)});
      if (thisTicket.length > 0) {
        thisEvent.tickets[x].requestedqty = thisTicket[0].requestedqty;
      }
    }
    storeView.router.back({
      url: 'views/purchase/select-quantity.html',
      force: true,
      context: thisEvent,
    });
  });

  $$('.swipeout-delete').on('click', function () {
    var ticketId = $$(this).attr('ticketid');
    var ticket = SEARCHJS.matchArray(context.tickets, {id: Number(ticketId)});
    ticket = ticket[0];
    //alert(JSON.stringify(ticket));
    var price = ticket.price;
    var newTotal = Number(context.total) - Number(price);
    page.context.total = newTotal;
    newTotal = newTotal.toFixed(2);
    $$('.cart-total').html('$'+ newTotal);

    for(var i in tickets) {
      if (tickets[i].id == ticketId) {
        tickets[i].requestedqty = Number(tickets[i].requestedqty) - 1;
      }
    }

  });


  $$('.save-ticket-names').on('click', function() {
    if (processing) {
      return;
    }
    processing = true;
    var tickets = context.tickets;
    var cartInfo = app.formToJSON("#ticket-names-form");
    cartInfo = util.getCartSummary(cartInfo);
    if (cartInfo.length == 0) {
      app.alert("Your Cart is Empty.");
      mainView.router.back();
      return;
    }
    var checkoutCart =[];
    //alert(JSON.stringify(cartInfo));
    var ticketQuantity = 0;
    var theseTickets= [];
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
        ticketQuantity += cartItem.length;
        //var n;
        for (var n=0;n<cartItem.length;n++) {
          var tmpTicket = JSON.parse(JSON.stringify(tickets[i]));
          //lineNames.push(cartItem[n].nameonticket);
          if (cartItem[n].nameonticket.trim() == "") {
            lineNames.push("Admit One");
            tmpTicket.nameonticket = "Admit One";
            //ticket.userticketid = userTickets[i].id;
            //theseTickets.push(tickets[i]);
          } else {
            lineNames.push(cartItem[n].nameonticket);
            tmpTicket.nameonticket = cartItem[n].nameonticket;
            //ticket.userticketid = userTickets[i].id;
            //tickets.push(ticket);

          }
          theseTickets.push(tmpTicket);
          console.log(theseTickets);
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
    var calculateServiceCharge = function(feeInfo, qty) {
      var totalServiceFee;
      for (var curr in feeInfo.transactionFeeFixed) {
        if (selectedEventLocal.currency == curr) {
          totalServiceFee = context.total * feeInfo.transactionFeeRate;
          totalServiceFee+=(feeInfo.transactionFeeFixed[curr] * qty);
          break;
        }
      }
      return totalServiceFee;
    };
    var exchngRate;
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      url: config.server + "/api/currency/"+ selectedEventLocal.currency + nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          exchngRate = data;
          $$.ajax({
            async: true,
            timeout: 30 *1000,
            url: config.server + "/api/paymentconfig/"+ nocache,
            method: "GET",
            success: function(data, status, xhr) {
              if (status == 200){
                var serviceFee = 0;
                var totalWithFee = 0;
                var totalUSD = (Number(context.total) / Number(exchngRate)).toFixed(2);
                var url = 'views/purchase/reservation-checkout.html';
                if( Number(context.total) > 0 ) {
                  serviceFee = calculateServiceCharge(JSON.parse(data), theseTickets.length);
                  totalWithFee = serviceFee + context.total;
                  url = 'views/purchase/checkout.html';
                }
                processing = false;
                storeView.router.load({
                  url: url,
                  context: {
                    event: thisEvent,
                    subTotal: context.total,
                    totalUSD: totalUSD,
                    exchangeRate: exchngRate,
                    cart: checkoutCart,
                    ticketQuantity: ticketQuantity,
                    tickets: theseTickets,
                    serviceFee: serviceFee,
                    total: totalWithFee,
                  },
                });
              }
            },
          });
        }
      },
      error: function(status, xhr) {
        app.alert("There was a problem generating your cart");
        processing = false;
      }
    });
  });
});

app.onPageInit('reservation-checkout', function(page) {
  var processing = false;
  $$('.confirm-reservation').on('click', function() {
    if (processing) {
      return;
    }
    app.showPreloader("Please Wait...");
    processing = true;
    var cartTotal = page.context.total;
    var ticketQuantity = page.context.ticketQuantity;
    var thisEvent = page.context.event;
    var cart = page.context;
    var tickets = page.context.tickets;

    var request = {
      userid: user.id,
      email: user.email,
      eventid: thisEvent.id,
      cardtypeid: user.id,
      cardtype: 'Reservation-Mobile',
      //cardno: purchase.cardno,
      nameoncard: user.fullname,
      streetaddress: user.addressstreet,
      city: user.addresscity,
      state: user.addressstate,
      country: user.addresscountry,
      zip: user.postcode,
      ticketsquantity: ticketQuantity,
      totalprice: cartTotal,
      tickets: tickets,
    };
    console.log(JSON.stringify(request));
    var nocache = "?t="+moment().unix();
    var result = [];
    $$.ajax({
      async: true,
      url: config.server + "/api/purchase" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);

          app.hidePreloader();
          if (result) {
            processing = false;
            app.showTab('#homepage-tab');
            mainView.router.back({
              url: 'home.html',
              force: true,
            });

          }
        }
      },
      error: function(status, xhr) {
        app.hidePreloader();
        processing = false;
        app.showTab('#homepage-tab');
        app.alert(language.STORE.CHECKOUT_PURCHASE_ERROR, function() {
          mainView.router.back({
            url: 'home.html',
            force: true,
          });
        });
      }
    });
  });
});

app.onPageAfterAnimation('purchase-checkout', function (page) {
  var processing = false;
  var cartTotal = page.context.total;
  var cartTotalUSD = page.context.totalUSD;
  var ticketQuantity = page.context.ticketQuantity;
  var thisEvent = page.context.event;
  var cart = page.context;
  var tickets = page.context.tickets;


  var onSuccessfulPayment = function(payment) {
     //alert("payment success: " + JSON.stringify(payment, null, 4));
     var request = {
        paypalResponse: payment,
        user_id: user.id,
        email: user.email,
        event_id: thisEvent.id,
        paypal_id: payment.response.id,
        paypal_create_item: payment.response.create_time,
        cardtype: "PayPal-Mobile",
        cardno: payment.response.id,
        nameoncard: user.fullname,
        streetaddress: user.addressstreet,
        city: user.addresscity,
        state: user.addressstate,
        country: user.addresscountry,
        zip: user.postcode,
        currency: thisEvent.currency,
        rate: cart.exchngRate,
        ticketsquantity: ticketQuantity,
        totalprice: cartTotal,
        totalUSD: cartTotalUSD,
        tickets: tickets,
        usPaypalAccount: true,
     };
     var nocache = "?t="+moment().unix();
     var result = [];
     $$.ajax({
       async: true,
       url: config.server + "/api/savemobilepayment" + nocache,
       method: "POST",
       contentType: "application/x-www-form-urlencoded",
       data: request,
       xhrFields: { withCredentials: true },
       success: function(data, status, xhr) {
         if (status == 200 || status == 0 ){
           result = JSON.parse(data);
           app.hidePreloader();
           if (result) {
             app.showTab('#homepage-tab');
             processing = false;
             mainView.router.back({
               url: 'views/tickets/tickets.html',
               force: true,
               context: {
                 tickets: result,
                 event: thisEvent,
               }
             });
           }
         }
       },
       error: function(status, xhr) {
         app.hidePreloader();
         app.alert(language.STORE.CHECKOUT_PURCHASE_ERROR, function() {
           processing = false;
           app.showTab('#homepage-tab');
           mainView.router.back({
             url: 'home.html',
             force:true,
           });
         });
       }
     });
   };

   var onUserPaymentCancelled = function (result) {
     console.log(JSON.stringify(result));
     app.hidePreloader();
   };

   var onPayPalMobileInit = function () {
     var options = {
       merchantName: config.owner,
       merchantPrivacyPolicyURL: config.server + "/static/privacypolicy",
       merchantUserAgreementURL: config.server + "/static/acceptableusepolicy",
     };
     var paypalConfig =  new PayPalConfiguration(options);
     PayPalMobile.prepareToRender("PayPalEnvironmentProduction", paypalConfig, function() {
       var buyNowBtn = document.getElementById("paypal-pay-button");
       buyNowBtn.onclick = function (e) {
         if (processing) {
           return;
         }
         app.showPreloader("Please Wait...");
         processing = true;
         var paymentDetails = new PayPalPaymentDetails(cartTotalUSD, "0.00", "0.00");
         var payment = new PayPalPayment(cartTotalUSD, "USD", thisEvent.name + " - " + ticketQuantity + " Tickets", "Sale", paymentDetails);
         PayPalMobile.renderSinglePaymentUI(payment, onSuccessfulPayment, onUserPaymentCancelled);
       }
     });
   };

  PayPalMobile.init(config.paypalIds, onPayPalMobileInit);


  /*$$('.payment-credit').on('click', function() {
    mainView.router.load({
      url: 'views/purchase/card-info.html',
      context: page.context,
    });
  });*/
});

/*app.onPageInit('card-form', function(page) {
  var countries = appPickers.countries('card-country');
  $$('#card-country').on('click', function() {
    countries.open();
  });

  var cartTypes = appPickers.cardTypes('card-type');
  $$('#card-type').on('click', function() {
    cardTypes.open();
  });

  $$('.card-pay').on('click', function() {
    var cartInfo = page.context;
    var purchaseInfo = app.formToJSON('#card-info');

    purchaseInfo.cardtypeid = util.getCreditCardId(cardInfo.cardtype);
    purchaseInfo.userid = user.id;
    purchaseInfo.eventid = cartInfo.thisEvent.id;
    purchaseInfo.totalprice = cartInfo.total;
    purchaseInfo.ticketquantity = cartInfo.ticketQuantity;
  });
});*/
