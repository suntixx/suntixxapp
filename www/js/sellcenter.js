//=================Committee Members Actions==================================
app.onPageInit('sell-tickets-list', function(page) {
  var sellerTickets = page.context.tickets;
  $$('.start-selling').on('click', function () {
    var selectedTickets = app.formToJSON('#select-tickets-form');
    var selected = 0;
    for (var i in selectedTickets) {
      if (selectedTickets[i].length > 0) {
        selected++;
      }
    }
    if (selected == 0) {
      app.alert("Plese select ticket(s)");
      return;
    }
    var tickets = util.getTicketsToSell(selectedTickets, sellerTickets);
    mainView.router.load ({
      url: 'views/selltickets/select-quantity.html',
      context: {
        event:selectedEventLocal,
        tickets: tickets,
        sellerTickets: sellerTickets,
      },
    });
  });

  $$('.reports').on('click', function() {
    mainView.router.load ({
      url: 'views/selltickets/sales-reports.html',
    });
  });

  $$('.back-events').on('click', function () {
    mainView.router.back ({
      url: 'views/events/myevents.html',
      context: allUserEvents,
      force: true,
    });
  });
});


var sellerTickets;
app.onPageInit('sell-quantity', function(page) {
  var userTickets = page.context.tickets;
  if (page.context.sellerTickets) {
    sellerTickets = page.context.sellerTickets;
  }
  var ticketLimit = null;
  $$('.ticket-limit').on('focusin click', function() {
    var id = $$(this).attr('id');
    var available = $$(this).attr('quantity');
    if (available > 10) {
      available = 10;
    }
    //if (!ticketLimit) {
      ticketLimit = appPickers.limitPicker(id, available );
    //}
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
        userTickets: userTickets,
        ticketList : page.context.cart,
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

   var paymentTypeSelected = function (radio) {
     if  (radio == 1 || radio == 2) {
       return true;
     } else {
       $$('.error-message').html("Please correct errors");
       $$('.paymentoption').html(errorIcon);
       return false;
     }

   }

   var emailsMatch = function (formData) {
     if (formData.email != formData.confirmemail) {
       $$('.confirmemail').html(errorIcon);
       $$('.error-message').html("Emails do not match");
       return false;
     }
     return true;
   };

   $$(".step-two").on('click', function() {

     mainView.router.back({
       url: 'views/selltickets/ticket-names.html',
       force: true,
       context: {
         userTickets: page.context.userTickets,
         total:page.context.total,
         event: selectedEventLocal,
         cart: page.context.ticketList
       }
     });
   });

  var purchaser = {};
  $$(document).on('click', '.add-new-purchaser', function() {
    app.popup(Template7.templates.addPurchaserTemplate(purchaser));
  });

  $$(document).on('change', 'input[type=radio]', function() {
    //alert("here");
    var form = app.formToJSON("#add-purchaser-form");
    if (form.paymentoption == 1) {
      $$('.sell-cashout').removeClass("color-gray");
      $$('input[type="checkbox"]').prop('disabled', false);
    } else if (form.paymentoption == 2) {
      $$('.sell-cashout').addClass("color-gray");
      $$('input[type="checkbox"]').prop('disabled', true).prop('checked', false);
    }
  });

  var processing = false;

  $$(document).on('click', '.confirm-purchaser', function() {

    purchaser = app.formToJSON('#add-purchaser-form');
    console.log(JSON.stringify(purchaser))
    if (!validatePurchaser('#add-purchaser-form') || !paymentTypeSelected(purchaser.paymentoption)) {
      processing = false;
      return;
    }
    app.closeModal();
    $$('.purchaser-info').val(' ');
    var capitalize = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    purchaser.firstname = capitalize(purchaser.fname);
    purchaser.lastname = capitalize(purchaser.lname);
    var paymentType = language.STORE.PAYPAL;
    if (purchaser.paymentoption == 1) {
      paymentType = language.STORE.CASH;
      if (purchaser.cashout.length > 0) {
        paymentType += " - " + language.STORE.PAID;   //=================Committee Members Actions==================================
        app.onPageInit('sell-tickets-list', function(page) {
          var sellerTickets = page.context.tickets;
            //alert(JSON.stringify(sellerTickets));
          $$('.start-selling').on('click', function () {
            var selectedTickets = app.formToJSON('#select-tickets-form');
            var selected = 0;
            for (var i in selectedTickets) {
              if (selectedTickets[i].length > 0) {
                selected++;
              }
            }
            if (selected == 0) {
              app.alert("Plese select ticket(s)");
              return;
            }
            var tickets = util.getTicketsToSell(selectedTickets, sellerTickets);
            //alert(JSON.stringify(tickets));
            // = app.addView('.view-store', {});
            mainView.router.load ({
              url: 'views/selltickets/select-quantity.html',
              context: {
                event:selectedEventLocal,
                tickets: tickets,
                sellerTickets: sellerTickets,
              },
              //ignoreCache: true,
            });
          });

          $$('.back-events').on('click', function () {
            mainView.router.back ({
              url: 'views/events/myevents.html',
              context: allUserEvents,
              force: true,
            });
          });
        });



      }
    }
    var nocache = "?t="+moment().unix();
    app.showIndicator();
    var result;
    $$.ajax({
      async: true,
      timeout: 30 * 1000,
      url: config.server + "/api/getuserbyemail" + nocache,
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: {email: purchaser.email},
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          result = JSON.parse(data);
          $$('.purchaser-user-info').html(
            '<li class="item-content">'+
              '<div class="item-media">'+
                '<img class="user-image-square" src="'+config.server+'/thumbnails/users/'+result.id+'/portrait.png">'+
              '</div>'+
              '<div class="item-inner">'+
                '<div class="item-title-row">'+
                  '<div class="item-title">'+ result.fullName+'</div>'+
                '</div>'+
                '<div class="item-subtitle">'+result.email+'<br/><span class="small">'+paymentType+'</span></div>'+
              '</div>'+
            '</li>'
          );
          $$('.edit-purchaser').html(
            '<a href="#" class="add-new-purchaser">'+language.STORE.EDIT_PURCHASER+'</a>'
          );
          $$('.floating-button').html(
            '<i class="icon icon-pay"></i>'
          ).toggleClass('complete-sale').toggleClass('add-new-purchaser');
          app.hideIndicator();
        }
      },
      error: function(status, xhr) {
        $$('.purchaser-user-info').html(
          '<li class="item-content">'+
            '<div class="item-media">'+
              '<img class="user-image-square" src="'+config.server+'/thumbnails/users/0/portrait.png">'+
            '</div>'+
            '<div class="item-inner">'+
              '<div class="item-title-row">'+
                '<div class="item-title">'+ purchaser.firstname +' '+ purchaser.lastname +'</div>'+
              '</div>'+
              '<div class="item-subtitle">'+purchaser.email+'<br/><span class="small">'+paymentType+'</span></div>'+
            '</div>'+
          '</li>'
        );
        $$('.edit-purchaser').html(
          '<a href="#" class="add-new-purchaser">'+language.STORE.EDIT_PURCHASER+'</a>'
        );
        $$('.floating-button').html(
          '<i class="icon icon-pay"></i>'
        ).toggleClass('complete-sale').toggleClass('add-new-purchaser');
        app.hideIndicator();
      },
    });
  });

  $$(document).on('click', '.complete-sale', function() {
    if (processing) {
      return;
    }
    processing = true;
    var request = {
      user_id: 0,
      event_id: selectedEventLocal.id,
		  pos_user_id: user.id,
		  cardtype: "Committee-Mobile",
		  nameoncard: purchaser.firstname +" "+ purchaser.lastname,
      email: purchaser.email,
  		fname: purchaser.firstname,
  		lname: purchaser.lastname,
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
