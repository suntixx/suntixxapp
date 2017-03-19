app.onPageInit('purchase-quantity', function(page) {
  var thisEvent = page.context;
  //var ticketLimitPicker = null;

  $$('.back-main').on('click', function() {
    /*if (ticketLimitPicker) {
      ticketLimitPicker.destroy();
    }*/
    app.showTab('#homepage-tab');
  });

  $$('.ticket-limit').on('focusin click', function () {
    var id = $$(this).attr('id');
    var ticketLimit = $$(this).attr('ticketLimit');
    var available = $$(this).attr('quantity');
    if (Number(available) < Number(ticketLimit)) {
      ticketLimit = available;
    }
    var ticketLimitPicker = appPickers.limitPicker(id, ticketLimit);
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
      thisTicket[0].names = [];
      var quantity = Number(data[i].quantity);

      thisTicket[0].requestedqty = quantity;
      if (quantity > 0 ) {
        for(var n=0; n<quantity; n++) {
          thisTicket[0].names.push("");
          totalPrice += thisTicket[0].price;
        }
        ticketList.push(thisTicket[0]);
      }

    }
    if (ticketList.length == 0) {
      app.alert(language.STORE.QUANTITY_NEEDED);
      processing = false;
      return;
    }

    storeView.router.load ({
      url: 'views/purchase/purchase-ticket-names.html',
      context: {
        cart: ticketList,
        total: totalPrice,
        //tickets: tickets,
        event: thisEvent,
      },
    });
  });
});



app.onPageInit('purchase-ticket-names', function(page) {
  var context = page.context;
  var tickets = page.context.tickets;
  var thisEvent = page.context.event;
  var total = page.context.total;
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
    total = newTotal;
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
    var tickets = context.cart;
    var cartInfo = app.formToJSON("#ticket-names-form");
    cartInfo = util.getCartSummary(cartInfo);
    if (cartInfo.length == 0) {
      app.alert(language.STORE.CART_EMPTY);
      storeView.router.back();
      return;
    }
    var checkoutCart =[];
    var ticketQuantity = 0;
    var theseTickets= [];
    for( var i=0; i<tickets.length; i++) {
      var thisTicket = tickets[i];
      var ticket = JSON.parse(JSON.stringify(thisTicket));
      var cartItem = SEARCHJS.matchArray(cartInfo, {ticketid: thisTicket.id.toString()});
      if (cartItem.length >0) {
        thisTicket.requestedqty = cartItem.length;
        thisTicket.names = [];
        for (var n=0;n<cartItem.length;n++) {
          if (cartItem[n].nameonticket.trim() == "") {
            ticket.nameonticket = language.STORE.ADMIT_ONE;
          } else {
            ticket.nameonticket = cartItem[n].nameonticket;
          }
          thisTicket.names.push(ticket.nameonticket);
          theseTickets.push(ticket);
        }
        checkoutCart.push(thisTicket);
      }
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
    $$.ajax({
      async: true,
      timeout: 30 *1000,
      cache: false,
      url: config.server + "/api/currency/"+ selectedEventLocal.currency,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          exchngRate = data;
          $$.ajax({
            async: true,
            timeout: 30 *1000,
            cache: false,
            url: config.server + "/api/paymentconfig/",
            method: "GET",
            success: function(data, status, xhr) {
              if (status == 200){
                var serviceFee = 0;
                var totalWithFee = 0;
                var totalUSD = (Number(total) / Number(exchngRate)).toFixed(2);
                var url = 'views/purchase/reservation-checkout.html';
                if( Number(total) > 0 ) {
                  serviceFee = calculateServiceCharge(JSON.parse(data), theseTickets.length);
                  totalWithFee = serviceFee + total;
                  url = 'views/purchase/checkout.html';
                }
                processing = false;
                storeView.router.load({
                  url: url,
                  context: {
                    event: thisEvent,
                    subTotal: total,
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
        app.alert(language.STORE.ERROR_GENERATING_CART);
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
    app.showIndicator();
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

          app.hideIndicator();
          if (result) {
            processing = false;
            storeView.router.load({
              url: 'views/purchase/purchase-complete.html',
            });

          }
        }
      },
      error: function(status, xhr) {
        app.hideIndicator();
        storeView.router.load({
          url: 'views/purchase/purchase-error.html',
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
           app.hideIndicator();
           if (result) {
             //app.showTab('#homepage-tab');
             processing = false;
             storeView.router.load({
               url: 'views/purchase/purchase-complete.html',
             });
           }
         }
       },
       error: function(status, xhr) {
         app.hideIndicator();
         storeView.router.load({
           url: 'views/purchase/purchase-error.html',
         });
       }
     });
   };

   var onUserPaymentCancelled = function (result) {
     console.log(JSON.stringify(result));
     app.hideIndicator();
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
         app.showIndicator();
         processing = true;
         var paymentDetails = new PayPalPaymentDetails(cartTotalUSD, "0.00", "0.00");
         var payment = new PayPalPayment(cartTotalUSD, "USD", thisEvent.name + " - " + ticketQuantity + " Tickets", "Sale", paymentDetails);
         PayPalMobile.renderSinglePaymentUI(payment, onSuccessfulPayment, onUserPaymentCancelled);
       }
     });
   };

  PayPalMobile.init(config.paypalIds, onPayPalMobileInit);

});

app.onPageInit('purchase-complete', function(page) {
  $$('.home').on('click', function () {
    app.showTab('#homepage-tab');
  });
});

app.onPageInit('purchase-error', function(page) {
  $$('.home').on('click', function () {
    app.showTab('#homepage-tab');
  });
});
