//var sellerTickets;
//=================Committee Members Actions==================================
app.onPageInit('sell-tickets-list', function(page) {
  var sellerTickets = page.context.tickets;
  selectedEventLocal = page.context.event;

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
    storeView.router.load ({
      url: 'views/selltickets/select-quantity.html',
      context: {
        event:selectedEventLocal,
        tickets: tickets,
        sellerTickets: sellerTickets,
      },
    });
  });

  var salesReports;

  $$('.reports').on('click', function() {
    var result;
    $$.ajax({
      async: true,
      timeout: 30 * 1000,
      cache: false,
      url: config.server + "/api/usersalesreports/" + selectedEventLocal.id + "/" + user.id,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          salesReports = JSON.parse(data);
          storeView.router.load ({
            url: 'views/selltickets/sales-reports.html',
            context: {
              event: selectedEventLocal,
              reports: salesReports
            }
          });
        }
      },
      error: function(status, xhr) {

      },
    });
  });

  $$(document).find('.purchase-details', 'click', function() {

  });

  $$('.back-events').on('click', function () {
    app.showTab(returnFromStoreTab);
  });
});


app.onPageInit('sell-quantity', function(page) {
  var userTickets = page.context.tickets;
  if (page.context.sellerTickets) {
    var sellerTickets = page.context.sellerTickets;
  }
  var ticketLimit = null;
  $$('.ticket-limit').on('focusin click', function() {
    var id = $$(this).attr('id');
    var available = $$(this).attr('quantity');
    if (available > 10) {
      available = 10;
    }
    ticketLimit = appPickers.limitPicker(id, available );

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
      userTicket[0].names =[];
      var quantity = Number(data[i].quantity);
      userTicket[0].requestedqty = quantity;
      if (quantity > 0) {
        for(var n=0;n< quantity;n++) {
          //ticketList.push(item);
          userTicket[0].names.push("");
          totalPrice += userTicket[0].ticket.price;
        }
        userTicketList.push(userTicket[0]);
      }
    }
    if (userTicketList.length == 0) {
      app.alert(language.STORE.QUANTITY_NEEDED);
      processing = false;
      return;
    }
    storeView.router.load ({
      url: 'views/selltickets/ticket-names.html',
      context: {
        //cart: ticketList,
        total: totalPrice,
        userTicketsList: userTicketList,
        event: selectedEventLocal,
        sellerTickets: sellerTickets
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
    storeView.router.back ({
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
  var userTicketsList = page.context.userTicketsList;

  $$(".step-one").on('click', function() {
    //var thisEvent = page.context.thisEvent;
    for (var x in selectedEventLocal.tickets) {
      var thisTicket = SEARCHJS.matchArray(userTicketsList, {id: Number(selectedEventLocal.tickets[x].id)});
      if (thisTicket.length > 0) {
        selectedEventLocal.tickets[x].requestedqty = thisTicket[0].requestedqty;
      }
    }
    storeView.router.back({
      url: 'views/selltickets/select-quantity.html',
      force: true,
      context: {
        tickets: userTicketsList,
        event:selectedEventLocal,
        sellerTickets: page.context.sellerTickets
      }
    });
  });

  $$('.swipeout-delete').on('click', function () {
    var ticketId = $$(this).attr('ticketid');
    var nameId = $$(this).attr('nameid');
    //var ticket = SEARCHJS.matchArray(userTicketsList, {id: Number(ticketId)});
    for (var x in userTicketsList) {
      if (userTicketsList[x].id == ticketId) {
        ticket = userTicketsList[x];
        var newTotal = Number(total) - Number(ticket.ticket.price);
        ticket.requestedqty = Number(ticket.requestedqty) - 1;
        ticket.names.splice(nameId, 1);
        total = newTotal;
        newTotal = newTotal.toFixed(2);
        $$('.cart-total').html('$'+ newTotal);
        if (ticket.requestedqty == 0) {
          $$('#tickettype-'+ticketId).remove();
        }
        if (total == 0) {
          storeView.router.back({
            url: 'views/selltickets/committee-home.html',
            force: true,
            context: {
              event: selectedEventLocal,
              tickets: page.context.sellerTickets
            }
          });
        }
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
    for( var i=0;i<userTicketsList.length;i++) {
      var ticket = userTicketsList[i].ticket;
      var userTicket = userTicketsList[i];
      console.log(cartInfo);
      var cartItem = SEARCHJS.matchArray(cartInfo, {ticketid: userTicket.id.toString()});
      console.log(cartItem);
      userTicket.names = [];
      if (cartItem.length > 0) {
        userTicket.requestedqty = cartItem.length;
        for (var n=0;n<cartItem.length;n++) {
          console.log(cartItem[n]);
          if (cartItem[n].nameonticket == '') {
            ticket.nameonticket = language.STORE.ADMIT_ONE;
          } else {
            ticket.nameonticket = cartItem[n].nameonticket;
          }
          userTicket.names.push(ticket.nameonticket);
          ticket.userticketid = userTicket.id;
          tickets.push(ticket);
        }
      }
    }
    storeView.router.load({
      url: 'views/selltickets/checkout.html',
      context: {
        total: total,
        event: selectedEventLocal,
        tickets: tickets,
        userTicketsList: userTicketsList,
        sellerTickets: page.context.sellerTickets
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
     return true;
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

     storeView.router.back({
       url: 'views/selltickets/ticket-names.html',
       force: true,
       context: {
         userTicketsList: page.context.userTicketsList,
         total:page.context.total,
         event: selectedEventLocal,
         cart: page.context.ticketList,
         sellerTickets: page.context.sellerTickets
       }
     });
   });

  var purchaser = {};
  $$(document).on('click', '.add-new-purchaser', function() {
    app.popup(Template7.templates.addPurchaserTemplate(purchaser));
  });

  /*$$(document).on('change', 'input[type=radio]', function() {
    //alert("here");
    var form = app.formToJSON("#add-purchaser-form");
    if (form.paymentoption == 1) {
      $$('.sell-cashout').removeClass("color-gray");
      $$('input[type="checkbox"]').prop('disabled', false);
    } else if (form.paymentoption == 2) {
      $$('.sell-cashout').addClass("color-gray");
      $$('input[type="checkbox"]').prop('disabled', true).prop('checked', false);
    }
  });*/

  var processing = false;

  $$(document).on('click', '.confirm-purchaser', function() {

    purchaser = app.formToJSON('#add-purchaser-form');
    //console.log(JSON.stringify(purchaser))
    if (!validatePurchaser('#add-purchaser-form') || !paymentTypeSelected(purchaser.paymentoption)) {
      processing = false;
      return;
    }
    app.closeModal();
    $$('.purchaser-info').empty();
    var capitalize = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    purchaser.firstname = capitalize(purchaser.fname);
    purchaser.lastname = capitalize(purchaser.lname);
    var paymentType = language.STORE.CASH;
    if (purchaser.paymentoption == 2) {
      paymentType = language.STORE.PAYPAL;
    }
    app.showIndicator();
    var result;
    $$.ajax({
      async: true,
      timeout: 30 * 1000,
      cache:false,
      url: config.server + "/api/getuserbyemail",
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
          ).addClass('complete-sale').removeClass('add-new-purchaser');
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

  var saleRequest;
  var completeSale = function () {
    processing = true;
    saleRequest = {
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
    app.showIndicator();
    $$.ajax({
      async: true,
      timeout: 30 * 1000,
      cache: false,
      url: config.server + "/api/savecommpayment",
      method: "POST",
      contentType: "application/x-www-form-urlencoded",
      data: saleRequest,
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var result = JSON.parse(data);
          if (result.err) {
            app.hideIndicator();
            processing = false;
            app.popup(Template7.templates.saleForceTemplate());
          } else {
            app.hideIndicator();
            processing = false;
            app.popup(Template7.templates.saleCompleteTemplate());
          }
        }
      },
      error: function(status, xhr) {
        processing = false;
        app.hideIndicator();
        app.popup(Template7.templates.saleErrorTemplate());
      },
    });
  };

  $$(document).on('click', '.complete-sale', function() {
    if (processing) {
      return;
    }
    app.confirm(language.STORE.CONFIRM_SALE, completeSale , function () {
      return;
    });
  });

  $$(document).on('click', '.sell-more', function() {
    storeView.router.back({
      url: 'views/selltickets/committee-home.html',
      context: {
        tickets: page.context.sellerTickets,
        event: selectedEventLocal,
      },
      force:true,
      reload: true,
    });
  });


  $$(document).on('click', '.return-home', function() {
    app.showTab('#homepage-tab');
    mainView.router.load({
      url: "home.html",
      reload:true,
      ignoreCache: true
    });
  });

  $$(document).on('click','.retry', function() {
    completeSale();
  });

  $$(document).on('click', '.force-sale', function () {
    saleRequest.force = true;
    completeSale();
  });



});



app.onPageInit('sales-reports', function(page) {
  $$('.purchase-details').on('click', function () {
    var purchaseId = Number($$(this).attr('purchase'));
    var purchaseInfo = SEARCHJS.matchArray(page.context.reports.sales, {id: purchaseId});
    app.popup(Template7.templates.saleReportDetails(purchaseInfo[0]));
  });
});

app.onPageInit('full-sales-reports', function(page) {
  $$('.purchase-details').on('click', function () {
    var purchaseId = $$(this).attr('purchase');
    var userId = $$(this).attr('user-id');
    var userSales = _.find(page.context.reports, function(item) {
      return item.id == userId;
    });
    var purchaseInfo = _.find(userSales.sales, function(item) {
      return item.id == purchaseId;
    });
    purchaseInfo.eventid = page.context.event.id;
    app.popup(Template7.templates.saleReportDetails(purchaseInfo));
  });
});
