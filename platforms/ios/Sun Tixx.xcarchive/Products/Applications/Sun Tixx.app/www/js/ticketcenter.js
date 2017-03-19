//==============================My Tickets Functions===================================
app.onPageInit('purchases', function (page) {
  $$('#storeTicketsTab').html(Template7.templates.ticketWalletTemplate(myWallet));
  if (page.query.local == 1 && navigator.onLine && user && user.id) {
    app.showIndicator();
    var result;
    $$.ajax({
      async: true,
      cache: false,
      timeout: 1000 * 30,
      url: config.server + "/api/getprofiletickets",  //+ nocache,
      method: "POST",
      data: { userid: user.id },
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          allUserTickets = JSON.parse(data);
          storage.setItem('myTickets', data);
          ticketsView.router.load({
            url: 'views/tickets/purchases.html',
            context: {
              tickets: allUserTickets,
              commevents: allUserEvents.committeeEventList,
              wallet: myWallet,
            },
            reload: true,
          });
          app.hideIndicator();
        }
      },
      error: function(status, xhr) {
        app.hideIndicator();
      }
    });
  }

   $$('.sale-reports').on('click', function() {
    var eventId = $$(this).attr('event-id');
    selectedEventLocal = _.find(allUserEvents.committeeEventList, function(item) {
      return item.id == eventId;
    });
    $$.ajax({
      async: true,
      timeout: 30 * 1000,
      cache: false,
      url: config.server + "/api/usersalesreports/" + eventId + "/" + user.id,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          var salesReports = JSON.parse(data);
          console.log(salesReports);
          ticketsView.router.load ({
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

  $$('.select-tickets').on('click', function () {
    var eventId = $$(this).attr('event-id');
    var thisEvent = _.find(allUserEvents.committeeEventList, function(item) {
      return item.id = eventId;
    });
    var theseTickets = _.filter(allUserTickets.selltickets, function(item) {
      return item.event_id = eventId;
    });
    returnFromStoreTab = "#tickets-view";
    storeView.router.load({
      url: 'views/selltickets/committee-home.html',
      context: {
        tickets: theseTickets,
        event: thisEvent,
      },
      reload: true,
    });
    app.showTab("#store-view");
  });

  $$('.ticket-link').on('click', function () {
    var index = $$(this).attr('ticket-index');
    var eventId = $$(this).attr('event-id');
    var tickets = SEARCHJS.matchArray(allUserTickets.mytickets, {id: Number(eventId)})[0].tickets;
    var slides = {
      tickets: tickets,
      index: index,
      verified: true,
    };
    ticketsView.router.load({
      url: 'views/tickets/barcodes.html',
      context: slides
    });
    //app.popup(Template7.templates.barcodesViewerTemplate(slides));
  });

  $$(document).on('click', '.wallet-ticket-link', function () {
    var index = $$(this).attr('ticket-index');
    var eventId = $$(this).attr('event-id');
    var tickets =  _.find(myWallet, function(item) {
                      return item.id == eventId;
                    }).wallet;

    var slides = {
      tickets: tickets,
      index: index,
      verified: false,
    };
    ticketsView.router.load({
      url: 'views/tickets/barcodes.html',
      context: slides
    });
  });

  var barcodeSwiper = null;
  $$(document).on('popup:opened', '.barcodes-popup', function() {
    var speed = 20, p=0;
    var animateImage = function() {
      $$(document).find('#barcode-verified').css('background-position', p+'px 0');
       p--;
       setTimeout(animateImage, speed);
    };
    animateImage();

    var index = $$('.clicked-ticket').attr('ticket');

    barcodeSwiper = app.swiper('.barcode-container', {
      speed: 400,
      spaceBetween: 0,
      runCallbacksOnInit: true,
      nextButton: '.swiper-button-next',
      prevButton: '.swiper-button-prev',
      slideActiveClass: 'barcode-active',
      initialSlide: index,
      onInit: function (swiper) {
        console.log(swiper.container.find('.barcode-active .barcode-image img').length);

        if (index == 0 && swiper.container.find('.barcode-active .barcode-image img').length == 0) {
          var id = swiper.container.find('.barcode-active .barcode-image').attr('id');
          var code = swiper.container.find('.barcode-active #barcode-text').html();
          new QRCode(document.getElementById(id), ticketsService.qrcodeOptions(code, 'barcode-container'));
        }
      },
      onSlideChangeEnd: function(swiper) {
        var code = swiper.container.find('.barcode-active #barcode-text').html();
        var id = swiper.container.find('.barcode-active .barcode-image').attr('id');
        console.log(swiper.container.find('.barcode-active .barcode-image img').length);
        if (swiper.container.find('.barcode-active .barcode-image img').length == 0) {

          new QRCode(document.getElementById(id), ticketsService.qrcodeOptions(code, 'barcode-container'));
        }
      }
    });
  });

  $$(document).on('popup:close', '.barcodes-popup', function() {
    if (barcodeSwiper) {
      //barcodeSwiper.destroy(true, true);
      barcodeSwiper = null;
    }
  });


  $$('#storeTicketsTab').on('tab:show', function () {
    $$(page.container).find('.right').html('<a href="#" id="find-event" class="link icon-only  search-wallet-events"> <i class="icon icon-add-event"></i></a>');
    $$('.wallet-enter-barcode-popup').html(Template7.templates.enterBarcodeTemplate());
    var thisEvent = null;
    //console.log(myWallet);
    //if (upcomingEvents.length == 0)


    var updateBarcode = function(code, manual) {
      app.accordionClose($$(document).find('.accordion-item.enter-barcode'));
      app.accordionOpen($$(document).find('.accordion-item.show-barcode'));
      $$(document).find('#walletTicket').empty();
      var qrcode = new QRCode(document.getElementById('walletTicket'), ticketsService.qrcodeOptions(code, 'wallet-barcode-container'));
      if(manual) {
        $$(document).find('#walletTicket').addClass('edit-code');
      }
      $$(document).find('#wallet-barcode-text').html(code.toUpperCase());
    };

    var saveTicketInfo = function(callback) {
      $$(document).find('#walletTicket').removeClass('edit-code');
      var thisTicket = {
        id: 'wallet-ticket-'+moment(new Date()).unix(),
        code: $$(document).find('.wallet-enter-barcode-popup #wallet-barcode-text').html(),
        tickettype: $$(document).find('.wallet-enter-barcode-popup #wallet-barcode-tickettype').html(),
        image: $$(document).find('.wallet-enter-barcode-popup .show-ticket-wallet-image').attr('src')
      };
      thisEvent.wallet.push(thisTicket);
      if (myWallet.length > 0) {
        myWallet = _.filter(myWallet, function(item) {
          return item.id != thisEvent.id;
        });
      }
      myWallet.push(thisEvent);
      storage.setItem('myWallet', JSON.stringify(myWallet));
      callback();
    };

    var getTicketPicture = function(callback) {
      app.showIndicator();
      camera.getPicture(function(imageURI) {
        app.hideIndicator();
        window.resolveLocalFileSystemURL(imageURI, function (fileEntry) {

            // Do something with the FileEntry object, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
          console.log("got file: " + fileEntry.toURL());
            // displayFileData(fileEntry.nativeURL, "Native URL");
          callback(null, fileEntry.toURL());
        }, function () {
          // If don't get the FileEntry (which may happen when testing
          // on some emulators), copy to a new FileEntry.
          window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dirEntry) {
            dirEntry.getFile("ticket-wallet-image-"+moment(new Date()).unix()+".jpeg", { create: true, exclusive: false }, function (fileEntry) {
              util.writeFile(fileEntry, imageURI, function(err) {
                console.log("created file: " + fileEntry.toURL());
                callback(null, fileEntry.toURL());
              });
            }, function(fileCreateError) {
              console.log(fileCreateError);
              callback(fileCreateError);
            }, function(urlResolveError) {
              console.log(urlResolveError);
              callback(urlResolveError);
            });
          });
        });




      }, function (err) {
        callback(err);
      },
        Images.ticketCameraOptions()
      );
    };

    var getWalletEvent = function(eventId) {
      return _.find(myWallet, function(item) {
        return item.id == eventId;
      });
    };

    var getWalletTicket = function(eventId, ticketId) {
      var eventItem = getWalletEvent(eventId);
      return  _.find(eventItem.wallet, function(item) {
        return item.id == ticketId;
      });
    }

    $$(document).on('accordion:open', '.wallet-item',  function () {
      var eventId = $$(this).attr('event-id');
      $$(this).find('.add-event-id').attr('event-id', eventId);
      $$(document).find('.wallet-item').each(function() {
        if ($$(this).attr('event-id') != eventId)
          app.accordionClose($$(this));
      });
    });



    $$(document).on('click', '.wallet-add-image', function() {
      //var cropper = null;
      var ticketId = $$(this).attr('ticket-id');
      var eventId = $$(this).attr('event-id');
      getTicketPicture (function(err, imageSrc) {
        if (err) {
          console.log("I found this error getting the image "+err);
          return;
        }
        if (ticketId) {
          var html = '<img ticket-id="'+ticketId+'" event-id="'+eventId+'"  class="show-ticket-wallet-image link wallet-ticket-image" src="'+imageSrc+'"/>';
          $$(document).find('.'+ticketId).html(html);
          //$$(document).find('.'+ticketId +' img').attr('src', imageSrc);
          var thisTicketItem = getWalletTicket(eventId, ticketId);
          thisTicketItem.image = imageSrc;
          storage.setItem('myWallet', JSON.stringify(myWallet));
        } else {
          $$(document).find('.wallet-add-image').html('<img class="show-ticket-wallet-image link wallet-ticket-image" src="'+imageSrc+'" width="100"/>');
        }
      });
    });

    $$(document).on('click', '.show-ticket-wallet-image', function() {
      var ticketItem = getWalletTicket($$(this).attr('event-id'), $$(this).attr('ticket-id'));
      app.photoBrowser({
        photos: [ticketItem.image],
        type: 'standalone',
        theme: 'light',
        swipeToClose: false,
        toolbar: false,
        zoom: false,
        lazyLoading: true,
        navbarTemplate: '<div class="navbar">'+
                          '<div class="navbar-inner">'+
                            '<div class="left sliding">'+
                              '<a href="#" class="link close-popup photo-browser-close-link icon-only">'+
                                '<i class="icon icon-back"></i>'+
                              '</a>'+
                            '</div>'+
                            '<div class="center sliding">'+
                              '<a href="#"  class="icon-only"><i class="icon icon-suntixx"></i></a>'+
                            '</div>'+
                            '<div class="right sliding">'+
                              '<a href="#" class="icon-only share-ticket-image link"><i class="icon icon-share"></i></a>'+
                            '</div>' +
                          '</div>'+
                        '</div>',
        onOpen: function (photobrowser) {
          $$(document).on('click', '.share-ticket-image', function() {
            var onSuccess = function(result) {}
            var onError = function(msg) {
              app.alert(language.ERRORS.SHARE_IMAGE_FAIL);
            }
            window.plugins.socialsharing.share(null, null,  photobrowser.params.photos[0], onSuccess, onError);
          });
        },
      }).open();
    });



    var toolbarHtml = null;
    var closeEditToolbar = function () {
      $$(document).find('.ticket-selected').removeClass('ticket-selected');
      $$(document).find('.event-selected').removeClass('event-selected');
      ticketsService.hideTools(toolbarHtml, function() {
        toolbarHtml = null;
      });
    };

    $$(document).on('taphold', '.wallet-ticket-link', function() {
      var ticketId = $$(this).attr('ticket-id');
      var eventId = $$(this).attr('event-id');
      $$(document).find('.wallet-ticket-'+ticketId).toggleClass('ticket-selected');
      var selectedQuantity = $$(document).find('.ticket-selected').length;
      if ( selectedQuantity > 0) {
        if (toolbarHtml == null) {
          toolbarHtml = $$('.edit-toolbar .toolbar-inner').html();
        }
        ticketsService.showTools(eventId);
      } else {
        ticketsService.hideTools(toolbarHtml, function() {
          toolbarHtml = null;
        });
      }
    });

    $$(document).on('taphold', '.wallet-open', function() {
      var eventId = $$(this).attr('event-id');
      $$(document).find('.ticket-selected').removeClass('ticket-selected');
      app.accordionClose('.wallet-item');
      $$(document).find('.wallet-event-'+eventId+' .card-content-inner').toggleClass('event-selected');
      //$$(document).find('.wallet-event-'+eventId+' .wallet-item-content .wallet-ticket').toggleClass('ticket-selected');
      var selectedQuantity = $$(document).find('.event-selected').length;
      if ( selectedQuantity > 0) {
        if (toolbarHtml == null) {
          toolbarHtml = $$('.edit-toolbar .toolbar-inner').html();
        }
        ticketsService.showTools(eventId);
      } else {
        ticketsService.hideTools(toolbarHtml, function() {
          toolbarHtml = null;
        });
      }
    });

    $$(document).on('click', '.wallet-open', function() {
      if ($$(document).find('.event-selected').length > 0) {
        app.accordionClose('.wallet-item');
      } else if ($$(document).find('.ticket-selected').length > 0) {
        closeEditToolbar();
      }
    });

    $$(document).on('click', '.close-edit-toolbar', closeEditToolbar);

    $$(document).on('click', '.delete-item', function() {

      var onError = function(err) {
        if (err) console.log(err);
        app.alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      };

      var removeTickets = function (eventItem, callback) {
        $$(document).find('.ticket-selected').each(function() {
          var thisItem = $$(this);
          var ticketItem = getWalletTicket(eventItem.id, $$(this).attr('ticket-id'));
          if (ticketItem.image) {
            window.resolveLocalFileSystemURL(ticketItem.image, function(file) {
              file.remove(function() {
                console.log(ticketItem.image + " deleted");
                eventItem.wallet = _.filter (eventItem.wallet, function(item) {
                  return item.id != thisItem.attr('ticket-id');
                });
                $$(document).find('.ticket-quantity-'+eventItem.id).html(eventItem.wallet.length);
                thisItem.remove();
              },onError);
            }, onError);
          } else {
            eventItem.wallet = _.filter (eventItem.wallet, function(item) {
              return item.id != thisItem.attr('ticket-id');
            });
            $$(document).find('.ticket-quantity-'+eventItem.id).html(eventItem.wallet.length);
            thisItem.remove();

          }
        });
        if (callback) callback();
      };

      var removeEvents = function(callback) {
        var thisItem;
        $$(document).find('.event-selected').each(function() {
          thisItem = getWalletEvent($$(this).attr('event-id'));
          async.eachSeries(thisItem.wallet, function(item, seriesCallback) {
            if (item.image) {
              window.resolveLocalFileSystemURL(item.image, function(file) {
                file.remove(function() {
                  console.log(item.image + " deleted");
                },onError);
              }, onError);
            }
            seriesCallback();
          }, function(err) {
            myWallet = _.filter(myWallet, function(item) {
              return item.id != thisItem.id;
            });
            $$(document).find('.wallet-event-'+thisItem.id).remove();
          });
        });
        if (callback) callback();
      };

      var hideToolBar = function() {
        ticketsService.hideTools(toolbarHtml, function() {
          toolbarHtml = null;
          storage.setItem('myWallet', JSON.stringify(myWallet));
        });
      };

      if ($$(document).find('.event-selected').length > 0) {
        //$$(document).find('.event-selected').each(function() {
          //var eventItem = getWalletEvent($$(this).attr('event-id'));
        removeEvents(hideToolBar);
        //});
      } else {
        removeTickets(getWalletEvent($$(this).attr('event-id')), hideToolBar);
      }


    });

    $$('.wallet-enter-barcode-popup').on('popup:close', function () {
      picker.close();
      $$('.wallet-enter-barcode-popup').html(Template7.templates.enterBarcodeTemplate());
    });

    $$('.wallet-enter-barcode-popup').on('popup:open', function () {
      app.accordionClose($$(document).find('.accordion-item.show-barcode'));
      app.accordionClose($$(document).find('.accordion-item.wallet'));
      app.accordionOpen($$(document).find('.accordion-item.enter-barcode'));

      $$('#wallet-barcode-tickettype').on('click', function() {
        picker = ticketsService.selectTickettype(thisEvent);
      });

      $$('.scan-qr-code').on('click', function() {
        app.showIndicator();
        ticketsService.scanCode(function(err, code) {
          app.hideIndicator();
          if (err || code.cancelled == true) {
            return;
          }
          updateBarcode(code.text);
          picker = ticketsService.selectTickettype(thisEvent);
        });
      });


      $$('.edit-code').on('click', function() {
        app.prompt(language.TICKETS.EDIT_BARCODE, function(value) {
          updateBarcode(value.replace(/ /g,''));
        });
      });



      $$('.manual-code').on('click', function() {
        app.prompt(language.TICKETS.ENTER_BARCODE, function(value) {
          updateBarcode(value.replace(/ /g,''), true);
          picker = ticketsService.selectTickettype(thisEvent);
        });
      });

      $$('.wallet-add-ticket').on('click', function() {
        saveTicketInfo(function() {
          app.accordionClose($$(document).find('.accordion-item.show-barcode'));
          app.accordionClose($$(document).find('.accordion-item.wallet'));
          app.accordionOpen($$(document).find('.accordion-item.enter-barcode'));
        });

      });

      $$('.wallet-done').on('click', function() {
        saveTicketInfo(function() {
          $$('#storeTicketsTab').html(Template7.templates.ticketWalletTemplate(myWallet));
        });

      });


    });



    var countries = appPickers.countries('venue-country');
    $$(document).on('click', '#venue-country', function() {
      countries.open();
    });

    $$(document).on('click', '.save-event', function() {
      if (!eventsService.validateForm('#wallet-event-form')) {
        return;
      }
      thisEvent = app.formToData('#wallet-event-form');
      thisEvent.id = 'local-'+moment(new Date()).unix();
      thisEvent.wallet = [];
      app.popup('.wallet-enter-barcode-popup');
    });

    var searchResults = {
        query: '',
        number: 0
    };

    $$(document).on('click', '.add-ticket', function() {
      thisEvent = getWalletEvent($$(this).attr('event-id'));
      app.popup('.wallet-enter-barcode-popup');
    })

    $$(document).on('click', '.search-wallet-events', function() {
      var openEventSearch = function(upcomingEvents) {
        var eventList = _.union(myWallet, allUserEvents.favoriteEventList, upcomingEvents);
        var picker;
        eventList = _.uniq(eventList, false, function(item) {
          return item.id;
        });

        var formatAutoCompleteData = function(data) {
          return _.map(data, function(item) {
            return {
              text: item.name,
              data: item,
            };
          })
        };

        var findEventPopup = app.autocomplete({
          openIn: 'popup', //open in popup
          opener: $$('#find-event'), //link that opens autocomplete
          backOnSelect: true, //go back after we select something
          value: formatAutoCompleteData(eventList),
          valueProperty: 'data', //object's "value" property name
          textProperty: 'text',
          preloader: true,
          preloaderColor: 'white',
          venue: "test",
          pageTitle: language.TICKETS.SEARCH_OR_SELECT_EVENT,
          searchbarPlaceholderText: language.TICKETS.SEARCH_OR_SELECT_EVENT,
          notFoundText: language.TICKETS.EVENT_NOT_FOUND,
          itemTemplate: '<li>'+
                          '<div class="item-content select-event link" event-id="{{value.id}}">'+
                            //'<div class="item-media">'+
                            //  '<img src="{{@global.config.server}}/thumbnails/events/{{value.id}}/thumbnail.png"/>'+
                          //  '</div>'+
                            '<div class="item-inner">'+
                              '<div class="item-title-row">'+
                                '<div class="item-title">{{text}}</div>'+
                              '</div>'+
                              '<div class="item-subtitle">{{value.venue}}</div>'+
                              '<div class="item-text">{{value.city}},&nbsp;{{value.country}}</div>'+
                            '</div>'+
                          '</div>'+
                        '</li>',
          navbarTemplate: '<div class="navbar">'+
                            '<div class="navbar-inner">'+
                              '<div class="left sliding">'+
                                '<a href="#" class="link icon-only cancel-select-event">'+
                                  '<i class="icon icon-back"></i>'+
                                '</a>'+
                              '</div>'+
                              '<div class="center sliding"><a href="#" class="icon-only"><i class="icon icon-suntixx"></i></a></div>'+
                              '{{#if preloader}}'+
                              '<div class="right">'+
                                '<div class="autocomplete-preloader preloader {{#if preloaderColor}}preloader-{{preloaderColor}}{{/if}}"></div>'+
                              '</div>'+
                              '{{/if}}'+
                            '</div>'+
                          '</div>',
          source: function (autocomplete, query, render) {
              var results = [];
              if (query.length === 0) {
                  render(results);
                  return;
              }
              // Find matched items
              for (var i = 0; i < autocomplete.value.length; i++) {
                  if (autocomplete.value[i].text.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(autocomplete.value[i]);
              }
              searchResults.query = query;
              searchResults.number = results.length;
              render(results);
          },
          onOpen: function(autocomplete) {
            autocomplete.page.find('.list-block').addClass('media-list');

            autocomplete.page.on('keydown', function (e) {
              if(e.which == 13 && searchResults.number == 0) {
                autocomplete.close();
                app.popup(Template7.templates.walletAddEventTemplate({
                  name: searchResults.query,
                  now: moment(new Date()).format('MM/DD/YYYY h:mm:ss A'),
                  country: "Trinidad And Tobago"
                }));
              }
            });

            autocomplete.page.on('click', '.select-event', function() {
              var eventId = $$(this).attr('event-id');
              thisEvent = _.find(autocomplete.value, function(item) {
                return item.data.id == eventId;
              });
              thisEvent = thisEvent.data;
              if (!thisEvent.wallet) {
                thisEvent.wallet = [];
              }
              autocomplete.close();
              findEventPopup.destroy();
              app.popup('.wallet-enter-barcode-popup');

            });

            autocomplete.page.on('click', '.cancel-select-event', function() {
              autocomplete.close();
              findEventPopup.destroy();
            });
          },
        });
        findEventPopup.open();
      };

      app.showIndicator();
      $$.ajax({
        async: true,
        timeout: 1000 * 30,
        cache: false,
        url: config.server + "/api/eventswidget/3",
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200){
            app.hideIndicator();
            openEventSearch(JSON.parse(data));
          }
        },
        error: function (status, xhr) {
          app.hideIndicator();
          openEventSearch(new Array());
        }
      });
    });
  });

  $$('#storeTicketsTab').on('tab:hide', function () {
    $$(page.container).find('.right').empty();
    //app.closeModal('.form-popup');
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

  var index = $$('.clicked-ticket').attr('ticket');

  var barcodeSwiper = app.swiper('.barcode-container', {
    speed: 400,
    spaceBetween: 0,
    runCallbacksOnInit: true,
    nextButton: '.swiper-button-next',
    prevButton: '.swiper-button-prev',
    slideActiveClass: 'barcode-active',
    initialSlide: index,
    onInit: function (swiper) {
      if (index == 0) {
        var id = swiper.container.find('.barcode-active .barcode-image').attr('id');
        var code = swiper.container.find('.barcode-active #barcode-text').html();
        var qrcode = new QRCode(document.getElementById(id), ticketsService.qrcodeOptions(code, 'barcode-container'));
      }
    },
    onSlideChangeEnd: function(swiper) {
      var code = swiper.container.find('.barcode-active #barcode-text').html();
      var id = swiper.container.find('.barcode-active .barcode-image').attr('id');
      if (swiper.container.find('.barcode-active .barcode-image').html() == "") {
        var qrcode = new QRCode(document.getElementById(id), ticketsService.qrcodeOptions(code, 'barcode-container'));
      }
    }
  });
});
