var sellerTickets;
app.onPageInit('sell-quantity', function(page) {
  var userTickets = page.context.tickets;
  if (page.context.sellerTickets) {
    sellerTickets = page.context.sellerTickets;
  }
  var ticketLimit = null;
  $$('#ticket-limit').on('focusin click', function() {
    var available = $$(this).attr('quantity');
    if (available > 10) {
      available = 10;
    }
    if (!ticketLimit) {
      ticketLimit = appPickers.limitPicker('ticket-limit', available );
    }
    ticketLimit.open();
  });
  var processing = false;
  $$('.save-ticket-quantity').on('click', function() {
    if (processing) {
      return;
    }
    processing = true;
    var data = app.formToJSON('#ticket-quantity-form');
    data = util.getQtySummary(data);
    var ticketList = [];
    var userTicketList =[];
    var totalPrice = 0;
    for(var i=0;i<data.length;i++) {
      var ticketId = Number(data[i].ticketid);
      var userTicket = SEARCHJS.matchArray(userTickets, {id: ticketId});
      var item = {
        id: userTicket[0].id,
        tickettype: userTicket[0].ticket.tickettype,
        price: userTicket[0].ticket.price,
        name: "",
      };
      //userTicket = userTicket[0];
      var quantity = Number(data[i].quantity);
      userTicket[0].requestedqty = quantity;
      if (quantity > 0) {
        userTicketList.push(userTicket[0]);
        for(var n=0;n< quantity;n++) {
          ticketList.push(item);
          totalPrice += item.price;
        }
      }
    }
    if (userTicketList.length == 0) {
      app.alert("A Quantity is required to continue");
      processing = false;
      return;
    }
    mainView.router.load ({
      url: 'views/selltickets/ticket-names.html',
      context: {
        cart: ticketList,
        total: totalPrice,
        userTickets: userTicketList,
        event: selectedEventLocal,
      },
    });

  });

  $$('.back-committee-home').on('click', function() {
    for (var i in sellerTickets) {
      var selectedTicket = SEARCHJS.matchObject(userTickets, {id: Number(sellerTickets[i].id)});
      if (selectedTicket) {
        sellerTickets[i].chosen = true;
      }
    }
    mainView.router.back ({
      url: 'views/selltickets/committee-home.html',
      force:true,
      context: {
        tickets: sellerTickets,
        event: selectedEventLocal,
      },
    });
  });
});

app.onPageInit('sell-ticket-names', function(page) {
  var total = page.context.total;
  var userTickets = page.context.userTickets;

  $$(".step-one").on('click', function() {
    //var thisEvent = page.context.thisEvent;
    for (var x in selectedEventLocal.tickets) {
      var thisTicket = SEARCHJS.matchArray(userTickets, {id: Number(selectedEventLocal.tickets[x].id)});
      if (thisTicket.length > 0) {
        selectedEventLocal.tickets[x].requestedqty = thisTicket[0].requestedqty;
      }
    }
    mainView.router.back({
      url: 'views/selltickets/select-quantity.html',
      force: true,
      context: {
        tickets: userTickets,
        event:selectedEventLocal,
      }
    });
  });

  $$('.swipeout-delete').on('click', function () {
    var ticketId = $$(this).attr('ticketid');
    var ticket = SEARCHJS.matchArray(userTickets, {id: Number(ticketId)});
    ticket = ticket[0];
    //alert(JSON.stringify(ticket));
    var price = ticket.ticket.price;
    var newTotal = Number(total) - Number(price);
    total = newTotal;
    newTotal = newTotal.toFixed(2);
    $$('.cart-total').html('$'+ newTotal);

    for(var i in userTickets) {
      if (userTickets[i].id == ticketId) {
        userTickets[i].requestedqty = Number(userTickets[i].requestedqty) - 1;
      }
    }

  });
  var processing = false;
  $$('.save-ticket-names').on('click', function() {
    if (processing) {
      return;
    }
    processing = true;
    var tickets =[];
    var cartInfo = app.formToJSON("#ticket-names-form");
    cartInfo = util.getCartSummary(cartInfo);
    var checkoutCart =[];
    for( var i=0;i<userTickets.length;i++) {
      var ticket = userTickets[i].ticket;
      var cartItem = SEARCHJS.matchArray(cartInfo, {ticketid: userTickets[i].id.toString()});

      if (cartItem.length >0) {
        console.log(cartItem);
        var lineTotal = cartItem.length * ticket.price;
        var lineTicketType = ticket.tickettype;
        var lineQuantity = cartItem.length;
        var lineTicketId = ticket.id;
        var linePrice = ticket.price;
        var lineNames =[];
        for (var n=0;n<cartItem.length;n++) {
          var tmpTicket = JSON.parse(JSON.stringify(ticket));
          if (cartItem[n].nameonticket == '') {
            lineNames.push("Admit One");
            tmpTicket.nameonticket = "Admit One";
            //ticket.userticketid = userTickets[i].id;

          } else {
            lineNames.push(cartItem[n].nameonticket);
            tmpTicket.nameonticket = cartItem[n].nameonticket;

            //tickets.push(ticket);
          }
          tmpTicket.userticketid = userTickets[i].id;
          tickets.push(tmpTicket);
        }
        var cartLineItem = {
          price: linePrice,
          lineTotal: lineTotal,
          ticketType: lineTicketType,
          quantity: lineQuantity,
          id: tickets[i].id,
          names: lineNames,
        };
        checkoutCart.push(cartLineItem);
      }
    }
    mainView.router.load({
      url: 'views/selltickets/checkout.html',
      context: {
        total: total,
        cart: checkoutCart,
        event: selectedEventLocal,
        tickets: tickets,
      },
    });
  });
});

app.onPageInit('sell-checkout', function (page) {
  var checkoutCart = page.context;
  var errorIcon = '<i class="icon icon-required"></i>';
  var validatePurchaser =  function(formid) {

    $$(formid).find('.form-error').each(function () {
      $$(this).text('');
    });
    var email = null;
    var invalidFields = 0;
    $$(formid).find('input').each(function () {
      if ($$(this).prop('required') == true) {
        var name = $$(this).attr('name');
        var type = $$(this).attr('type');
        var value = $$(this).val().trim();
        if ( type == "text" && value == "" || value == "" ) {
          $$('.'+name).html(errorIcon);
          invalidFields++;
          //next();
        } else if (type == "email" && !validateEmail(value)) {
          $$('.'+name).html(errorIcon);
          invalidFields++;
          //next();
        }
       }
     });
     if (invalidFields > 0) {
       $$('.error-message').html("Please correct errors");
       return false;
     } else {
       return true;
     }
   };

   var emailsMatch = function (formData) {
     if (formData.email != formData.confirmemail) {
       $$('.confirmemail').html(errorIcon);
       $$('.error-message').html("Emails do not match");
       return false;
     }
     return true;
   }

   var processing = false;
  $$('.confirm-sale').on('click', function() {
    if (processing) {
      return;
    }
    processing = true;
    var purchaser = app.formToJSON('#add-purchaser-form');
    if (!validatePurchaser('#add-purchaser-form') || !emailsMatch(purchaser)) {
      processing = false;
      return;
    }
    app.closeModal('.add-purchaser');
    $$('.purchaser-info').val(' ');
    var capitalize = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    var firstname = capitalize(purchaser.fname);
    var lastname = capitalize(purchaser.lname);
    var request = {
      user_id: 0,
      event_id: selectedEventLocal.id,
		  pos_user_id: user.id,
		  cardtype: "Committee-Mobile",
		  nameoncard: firstname +" "+lastname,
      email: purchaser.email,
  		fname: firstname,
  		lname: lastname,
  		ticketsquantity: checkoutCart.tickets.length,
  		totalprice: checkoutCart.total,
      currency: selectedEventLocal.currency,
      tickets: checkoutCart.tickets,
      order: checkoutCart.cart,
    };
    app.showPreloader("Completing Payment")
    var nocache = "?t="+moment().unix();
    var result;
    $$.ajax({
      async: true,
      timeout: 30 * 1000,
      url: config.server + "/api/savecommpayment" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: request,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          app.hidePreloader();
          app.alert("Sale was successful. Don't forget to collect the money", function() {
            processing = false;
            mainView.router.back({
              url: 'home.html',
              force:true,
            });
          });
        }
      },
      error: function(status, xhr) {
        app.hidePreloader();
        app.alert(language.STORE.CHECKOUT_SELL_ERROR, function() {
          processing = false;
          mainView.router.back({
            url: 'home.html',
            force:true,
          });
        });
      },
    });
  });
});
