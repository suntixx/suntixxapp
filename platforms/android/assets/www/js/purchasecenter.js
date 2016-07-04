app.onPageInit('purchase-quantity', function(page) {
  var thisEvent = page.context;
  var ticketLimitPicker = null;
  $$('.ticket-limit').on('click', function () {
    var id = $$(this).attr('id');
    var ticketLimit = $$(this).attr('ticketLimit');
    var available = $$(this).attr('quantity');
    if (available < ticketLimit) {
      ticketLimit = available;
    }
    if (!ticketLimitPicker) {
      ticketLimitPicker = appPickers.limitPicker(id, ticketLimit);
    }
    ticketLimitPicker.open();
  });

  $$('.save-ticket-quantity').on('click', function() {

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
      app.alert("You must enter a quantity to continue");
      return;
    }

    mainView.router.load ({
      url: 'views/purchase/purchase-ticket-names.html',
      context: {
        cart: ticketList,
        total: totalPrice,
        tickets: tickets,
        thisEvent: thisEvent,
      },
    });
  });
});



app.onPageInit('purchase-ticket-names', function(page) {
  var context = page.context;
  var tickets = page.context.tickets;
  //var thisEvent = page.contenxt.thisEvent;

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
    //alert(JSON.stringify(context.thisEvent));
    var exchngRate = Server.getExchangeRate(context.thisEvent.currency)
    var totalUSD = Number(context.total) / Number(exchngRate);
    mainView.router.load({
      url: 'views/purchase/checkout.html',
      context: {
        event: context.thisEvent,
        total: context.total,
        totalUSD: totalUSD,
        exchangeRate: exchngRate,
        cart: checkoutCart,
        ticketQuantity: ticketQuantity,
      },
    });
  });
});

app.onPageAfterAnimation('purchase-checkout', function (page) {

  var cartTotal = page.context.total;
  var cartTotalUSD = page.context.totalUSD;
  var ticketQuantity = page.context.ticketQuantity;
  var thisEvent = page.context.event;
  var cart = page.context;
  var tickets = page.context.cart;

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
     };
     var result = JSON.parse(Server.mobilePayment(request));
     if (result) {
       mainView.router.load({
         url: 'views/tickets/tickets.html',
         context: {
           tickets: result,
           event: thisEvent,
         }
       });
     } else {
       app.alert("Oops! Something went wrong");
     }
     //alert(JSON.stringify(result));
   };

   var onUserPaymentCancelled = function (result) {
     alert(result);
   };

   var onPayPalMobileInit = function () {
     var options = {
       merchantName: config.owner,
       merchantPrivacyPolicyURL: config.server + "/static/privacypolicy",
       merchantUserAgreementURL: config.server + "/static/acceptableusepolicy",
     };
     var paypalConfig =  new PayPalConfiguration(options);
     PayPalMobile.prepareToRender("PayPalEnvironmentSandbox", paypalConfig, function() {
       var buyNowBtn = document.getElementById("paypal-pay-button");
       buyNowBtn.onclick = function (e) {
         var paymentDetails = new PayPalPaymentDetails(cartTotalUSD, "0.00", "0.00");
         var payment = new PayPalPayment(cartTotalUSD, "USD", thisEvent.name + "-" + ticketQuantity + "Tickets", "Sale", paymentDetails);
         PayPalMobile.renderSinglePaymentUI(payment, onSuccessfulPayment, onUserPaymentCancelled);
       }
     });
   };

  PayPalMobile.init(config.paypalIds, onPayPalMobileInit);


  $$('.payment-credit').on('click', function() {
    mainView.router.load({
      url: 'views/purchase/card-info.html',
      context: page.context,
    });
  });
});

app.onPageInit('card-form', function(page) {
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
});
