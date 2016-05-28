app.onPageInit('purchase-quantity', function(page) {
  var thisEvent = page.context;

  $$('.ticket-limit').on('focus', function () {
    var id = $$(this).attr('id');
    var ticketLimit = $$(this).attr('ticketLimit');
    var ticketLimitPicker = appPickers.limitPicker(id, ticketLimit);
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

    formView.router.load ({
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
      formView.router.back();
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
    formView.router.load({
      url: 'views/purchase/checkout.html',
      context: {
        thisEvent: context.thisEvent,
        total: context.total,
        cart: checkoutCart,
        ticketQuantity: ticketQuantity,
      },
    });
  });
});

app.onPageInit('purchase-checkout', function (page) {
  $$('.payment-credit').on('click', function() {
    formView.router.load({
      url: 'views/purchase/card-info.html',
      context: page.context,
    });
  });
});

app.onPageInit('card-form', function(page) {
  $$('#card-country').on('focus', function() {

    var countries = appPickers.countries('card-country');
    countries.open();
  });

  $$('#card-type').on('focus', function() {
    var cartTypes = appPickers.cardTypes('card-type');
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
