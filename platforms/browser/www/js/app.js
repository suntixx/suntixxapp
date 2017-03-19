//eventsService.downloadEvents();
//var barcodes;

//$$.get('views/tickets/barcodes.html',
//  function(data) {
//    barcodes = Template7.compile(data);
//  }
//);



var noContentMessage =  '<div class="oops-image"></div>'+
                        '<div class="oops-message"></div>';

var infinitePreloader = '<div class="infinite-scroll-preloader featured-scroll-preloader">'+
                          '<div class="preloader"></div>'+
                        '</div>';

$$(document).on('click','.open-search', function () {
  mainView.router.load({
    url: 'search-events.html',
  });
});


$$(document).on('click', '.chatroom', function() {
    if (!user) {
      afterLoginLink = $$(this);
      app.loginScreen();
      return;
    }
    var eventId = $$(this).attr('event-id');
    app.popup(Template7.templates.joinRoomTemplate({eventid: eventId}));
});


$$(document).on('click', '.switch-chats', function() {
  if (!user || !user.id || !user.birth) {
    afterLoginLink = $$(this);
    app.loginScreen();

    return;
  }
  chatService.downloadMessages(function(err) {
    chatService.getChats();
    app.showTab("#chats-view");
  });

});

$$(document).on('click', '.switch-home', function() {
  mainView.router.load({
    url: 'home.html',
    reload: true,
    ignoreCache: true,
  });
  app.showTab("#homepage-tab");
});


$$(document).on('click', '.switch-events', function() {
  if (!user || !user.id || !user.birth) {
    afterLoginLink = $$(this);
    app.loginScreen();

    return;
  }
  eventsView.router.load({
      url: 'views/events/myevents.html?local=1',
      context: allUserEvents,
      reload: true,
      ignoreCache: true
  });
  app.showTab("#events-view");
});

$$(document).on('click', '.switch-tickets', function () {
  //
  if (!user || !user.id || !user.birth) {
    afterLoginLink = $$(this);
    app.loginScreen();

    return;
  }
  ticketsView.router.load({
      url: 'views/tickets/purchases.html?local=1',
      context: {
        tickets: allUserTickets,
        commevents: allUserEvents.committeeEventList,
        wallet: myWallet
      },
      reload: true
  });
  app.showTab("#tickets-view");
});

$$(document).on('click', '.switch-profile', function () {
  //checkInternet();
  if (!user || !user.id || !user.birth) {
    afterLoginLink = $$(this);
    app.loginScreen();

    return;
  }
  $$('#right-panel-menu').html(Menus.user);
  user.me = true;
  profileView.router.load ({
    url: 'views/user/profile.html',
    context: user,
  });
  app.showTab('#profile-view');
});


app.onPageInit('homepage', function(page) {

  $$('#homeFeedTab').on('show', function() {
    app.closeNotification('.notifications');
    if (navigator.onLine) {
      var instafeed;
      var instagramListLastIndex = 0;
      var loading = false;
      var infiniteScroll = true;
      //checkInternet();
      var feed = new Instafeed({
        clientId: "b6bb4ba1d6454f41aabd985b9a1a3d1b",
        accessToken: "1316008879.b6bb4ba.fe2e946a2856480da96095a5679d993f",
        get: "user",
        filter: function(image) {
          return image.tags.indexOf("suntixxapp") >= 0;
        },
        userId: '1316008879',
        sortBy: 'most-recent',
        mock:true,
        error: function(err) {
                  if ($$('#homeFeed div').attr('id') == "page-loading") {
                    $$(document).find('#homeFeed').html(refreshButton);
                  } else {
                    app.addNotification({
                      message: language.SYSTEM.GENERAL_SERVER_ERROR,
                      hold: 4000,
                      button: {
                          text: language.OTHER.TRY_AGAIN,
                          color: 'orange',
                          close:true,
                        },
                      onClose: function () {
                        if ($$('#homeFeedTab').hasClass('active')) {
                          app.pullToRefreshTrigger('.home-refresh');
                        }
                      }
                    });
                  }
                },
        success: function (data) {
                  instafeed = data.data;
                  var feedSet = eventsService.getMoreEvents(instafeed, instagramListLastIndex);
                  $$('#homeFeed').html(Template7.templates.feedTemplate(feedSet.events));
                  instagramListLastIndex = feedSet.index;
                  $$('.infinite-preloader').show();
                },
      });
      feed.run();
    } else if ($$('#homeFeed div').attr('id') == "page-loading") {
      $$(document).find('#homeFeed').html(refreshButton);
    } else {
      app.addNotification({
        message: language.ERRORS.NO_INTERNET,
        hold: 4000,
        button: {
            text: language.OTHER.CLOSE,
            color: 'orange',
            close:true
          }
      });
    }

    $$('.home-refresh').on('refresh', function() {
      //checkInternet
      app.closeNotification('.notifications');

        setTimeout(function() {
          if (navigator.onLine) {
            feed = new Instafeed({
              clientId: "b6bb4ba1d6454f41aabd985b9a1a3d1b",
              accessToken: "1316008879.b6bb4ba.fe2e946a2856480da96095a5679d993f",
              get: "user",
              filter: function(image) {
                return image.tags.indexOf("suntixxapp") >= 0;
              },
              userId: '1316008879',
              sortBy: 'most-recent',
              mock:true,
              error: function(err) {
                        //$$(document).find('#homeFeed').html(refreshButton);
                        app.pullToRefreshDone('.home-refresh');
                        if ($$('#homeFeed div').attr('id') == "page-loading") {
                          $$(document).find('#homeFeed').html(refreshButton);
                        } else {
                          app.addNotification({
                            message: language.SYSTEM.GENERAL_SERVER_ERROR,
                            button: {
                                text: language.OTHER.TRY_AGAIN,
                                color: 'orange',
                                close: true
                              },
                              onClose: function () {
                                if ($$('#homeFeedTab').hasClass('active')) {
                                  app.pullToRefreshTrigger('.home-refresh');
                                }
                              }
                          });
                        }

                      },
              success: function (data) {
                        instafeed = data.data;
                        var feedSet = eventsService.getMoreEvents(instafeed, instagramListLastIndex);
                        $$('#homeFeed').append(Template7.templates.feedTemplate(feedSet.events));
                        instagramListLastIndex = feedSet.index;
                        $$("#page-loading").hide();
                        app.pullToRefreshDone('.home-refresh');
                        if (!infiniteScroll) {
                          app.attachInfiniteScroll($$('.home-refresh'));
                          infiniteScroll = true;
                          $$('.infinite-preloader').show();
                        }
                      },
              });

              feed.run();
            } else if ($$('#homeFeed div').attr('id') == "page-loading") {
              app.pullToRefreshDone('.home-refresh');
              $$(document).find('#homeFeed').html(refreshButton);
            } else {
              app.pullToRefreshDone('.home-refresh');
              app.addNotification({
                message: language.ERRORS.NO_INTERNET,
                hold: 4000,
                button: {
                    text: language.OTHER.CLOSE,
                    color: 'orange',
                    close:true
                  }
              });
            }
        }, 2000);

    });

    $$('.home-refresh').on('infinite', function () {
      if (loading) return;
      loading = true;
      setTimeout(function () {
        loading = false;
        if (instagramListLastIndex >= instafeed.length) {
          app.detachInfiniteScroll($$('.home-refresh'));
          infiniteScroll = false;
          $$('.infinite-scroll-preloader').hide();
          return;
        }
        var feedSet = eventsService.getMoreEvents(instafeed, instagramListLastIndex);
        $$('#homeFeed').append(Template7.templates.feedTemplate(feedSet.events));
        instagramListLastIndex = feedSet.index;
      }, 1500);
    });
  });

  $$('#featuredEventsTab').on('show', function() {
    //checkInternet();
    if (navigator.onLine) {
      app.closeNotification('.notifications');
      var featuredEvents;
      var featuredEventsLastIndex = 0;
      var loading = false;
      var infiniteScroll = true;
      $$.ajax({
        async: true,
        timeout: 1000 * 30,
        cache: false,
        url: config.server + "/api/eventswidget/1",
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200){
            featuredEvents = JSON.parse(data);
            if (featuredEvents.length == 0) {
              $$(document).find('#featuredEvents').html(noContentMessage);
              $$(document).find('.oops-message').text("There are no Featured Events");
            } else {
              var eventSet = eventsService.getMoreEvents(featuredEvents, featuredEventsLastIndex);
              $$(document).find('#featuredEvents').html(Template7.templates.eventsTemplate(eventSet.events));
              featuredEventsLastIndex = eventSet.index;
              $$('.infinite-scroll-preloader').show();
            }
          }
        },
        error: function (status, xhr) {
          if ($$('#featuredEvents div').attr('id') == "page-loading") {
            $$(document).find('#featuredEvents').html(refreshButton);
          } else {
            app.addNotification({
              message: language.SYSTEM.GENERAL_SERVER_ERROR,
              hold: 4000,
              button: {
                  text: language.OTHER.TRY_AGAIN,
                  color: 'orange',
                  close:true
                },
              onClose: function () {
                if ($$('#featuredEventsTab').hasClass('active')) {
                  app.pullToRefreshTrigger('#featuredEventsTab');
                }
              }
            });
          }
        },
      });
    } else if ($$('#featuredEvents div').attr('id') == "page-loading") {
      $$(document).find('#featuredEvents').html(refreshButton);
    } else {
      app.addNotification({
        message: language.ERRORS.NO_INTERNET,
        hold: 4000,
        button: {
            text: language.OTHER.CLOSE,
            color: 'orange',
            close:true
          }
      });
    }


    $$('.featured-scroll').on('refresh', function () {
      app.closeNotification('.notifications');

      setTimeout(function() {
        if (navigator.onLine) {
          $$.ajax({
            async: true,
            cache:false,
            timeout: 1000 * 30,
            url: config.server + "/api/eventswidget/1",
            method: "GET",
            success: function(data, status, xhr) {
              if (status == 200){
                featuredEvents = JSON.parse(data);
                featuredEventsLastIndex = 0;
                if (!infiniteScroll) {
                  app.attachInfiniteScroll($$('.featured-scroll'));
                  infiniteScroll = true;
                  $$('.infinite-scroll-preloader').show();
                }
                var eventSet = eventsService.getMoreEvents(featuredEvents, featuredEventsLastIndex);
                $$(document).find('#featuredEvents').html(Template7.templates.eventsTemplate(eventSet.events));
                featuredEventsLastIndex = eventSet.index;
                app.pullToRefreshDone($$('.featured-scroll'));
              }
            },
            error: function (status, xhr) {
              //$$(document).find('#featuredEvents').html(refreshButton);
              app.pullToRefreshDone($$('.featured-scroll'));
              if ($$('#featuredEvents div').attr('id') == "page-loading") {
                $$(document).find('#featuredEvents').html(refreshButton);
              } else {
                app.addNotification({
                  message: language.SYSTEM.GENERAL_SERVER_ERROR,
                  button: {
                      text: language.OTHER.TRY_AGAIN,
                      color: 'orange',
                      close:true,
                    },
                  onClose: function () {
                    if ($$('#featuredEventsTab').hasClass('active')) {
                      app.pullToRefreshTrigger('#featuredEventsTab');
                    }
                  }
                });
              }
            },
          });
        } else if ($$('#featuredEvents div').attr('id') == "page-loading") {
          app.pullToRefreshDone($$('.featured-scroll'));
          $$(document).find('#featuredEvents').html(refreshButton);
        } else {
          app.pullToRefreshDone($$('.featured-scroll'));
          app.addNotification({
            message: language.ERRORS.NO_INTERNET,
            hold: 4000,
            button: {
                text: language.OTHER.CLOSE,
                color: 'orange',
                close:true
              }
          });
        }
      }, 1500);
    });

    $$('.featured-scroll').on('infinite', function () {
      if (loading) return;
      loading = true;
      setTimeout(function () {
        loading = false;
        if (featuredEventsLastIndex >= featuredEvents.length) {
          app.detachInfiniteScroll($$('.featured-scroll'));
          infiniteScroll = false;
          $$('.infinite-scroll-preloader').hide();
          return;
        }
        var eventSet = eventsService.getMoreEvents(featuredEvents, featuredEventsLastIndex);
        $$('#featuredEvents').append(Template7.templates.eventsTemplate(eventSet.events));
        featuredEventsLastIndex = eventSet.index;
      }, 1500);
    });


  });

  $$('#upcomingEventsTab').on('show', function() {
     $$('.infinite-scroll-preloader').hide();
     app.closeNotification('.notifications');
    //checkInternet();
    if (navigator.onLine) {
      //var upcomingEvents;
      var upcomingEventsLastIndex = 0;
      var infiniteScroll = true;
      var loading = false;
      $$.ajax({
        async: true,
        timeout: 1000 * 30,
        cache: false,
        url: config.server + "/api/eventswidget/3",
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200){
            upcomingEvents = JSON.parse(data);
            if (upcomingEvents.length == 0) {
              $$(document).find('#upcomingEvents').html(noContentMessage);
              $$(document).find('.oops-message').text("There are no Upcoming Events");
            } else {
             var eventSet = eventsService.getMoreEvents(upcomingEvents, upcomingEventsLastIndex);
             $$(document).find('#upcomingEvents').html(Template7.templates.eventsTemplate(eventSet.events));
             upcomingEventsLastIndex = eventSet.index;
             $$('.infinite-scroll-preloader').show();
           }
          }
        },
        error: function (status, xhr) {
          if ($$('#upcomingEvents div').attr('id') == "page-loading") {
            $$(document).find('#upcomingEvents').html(refreshButton);
          } else {
            app.addNotification({
              message: language.SYSTEM.GENERAL_SERVER_ERROR,
              hold: 4000,
              button: {
                  text: language.OTHER.TRY_AGAIN,
                  color: 'orange',
                  close:true
                },
              onClose: function () {
                if ($$('#upcomingEventsTab').hasClass('active')) {
                  app.pullToRefreshTrigger('#upcomingEventsTab');
                }
              }
            });
          }

        },
      });
    } else if ($$('#upcomingEvents div').attr('id') == "page-loading") {
      $$(document).find('#upcomingEvents').html(refreshButton);
    } else {
      app.addNotification({
        message: language.ERRORS.NO_INTERNET,
        hold: 4000,
        button: {
            text: language.OTHER.CLOSE,
            color: 'orange',
            close:true
          }
      });
    }



    $$('.upcoming-scroll').on('refresh', function () {
      app.closeNotification('.notifications');
      setTimeout( function () {
        if (navigator.onLine) {
          $$.ajax({
            async: true,
            cache: false,
            timeout: 1000 * 30,
            url: config.server + "/api/eventswidget/3",
            method: "GET",
            success: function(data, status, xhr) {
              if (status == 200){
                upcomingEvents = JSON.parse(data);
                if (!infiniteScroll) {
                  app.attachInfiniteScroll($$('.upcoming-scroll'));
                  infiniteScroll = true;
                  $$('.infinite-scroll-preloader').show();
                }
                upcomingEventsLastIndex = 0;
                var eventSet = eventsService.getMoreEvents(upcomingEvents, upcomingEventsLastIndex);
                $$(document).find('#upcomingEvents').html(Template7.templates.eventsTemplate(eventSet.events));
                upcomingEventsLastIndex = eventSet.index;
                app.pullToRefreshDone($$('.upcoming-scroll'));
              }
            },
            error: function (status, xhr) {
              app.pullToRefreshDone($$('.upcoming-scroll'));
              if ($$('#upcomingEvents div').attr('id') == "page-loading") {
                $$(document).find('#upcomingEvents').html(refreshButton);
              } else {
                app.addNotification({
                  message: language.SYSTEM.GENERAL_SERVER_ERROR,
                  button: {
                      text: language.OTHER.TRY_AGAIN,
                      color: 'orange',
                      close:true
                    },
                  onClose: function () {

                    $$(document).find('.notifications').remove();
                    if ($$('#upcomingEventsTab').hasClass('active')) {
                      app.pullToRefreshTrigger('#upcomingEventsTab');
                    }
                  }
                });
              }
            },
          });
        } else if ($$('#upcomingEvents div').attr('id') == "page-loading") {
          app.pullToRefreshDone($$('.upcoming-scroll'));
          $$(document).find('#upcomingEvents').html(refreshButton);
        } else {

          app.addNotification({
            message: language.ERRORS.NO_INTERNET,
            hold: 4000,
            button: {
                text: language.OTHER.CLOSE,
                color: 'orange',
                close:true
              }
          });
          app.pullToRefreshDone($$('.upcoming-scroll'));
        }
      }, 1500);
    });

    $$('.upcoming-scroll').on('infinite', function () {
      if (loading) return;
      loading = true;
      setTimeout(function () {
        loading = false;
        if (upcomingEventsLastIndex >= upcomingEvents.length) {
          app.detachInfiniteScroll($$('.upcoming-scroll'));
          infiniteScroll = false;
          $$('.infinite-scroll-preloader').hide();
          return;
        }
        var eventSet = eventsService.getMoreEvents(upcomingEvents, upcomingEventsLastIndex);
        $$('#upcomingEvents').append(Template7.templates.eventsTemplate(eventSet.events));
        upcomingEventsLastIndex = eventSet.index;
      }, 1000);

    });
  });
  app.showTab('#featuredEventsTab');
});



app.onPageInit('search-events', function (page) {
  var search = app.searchbar('.searchbar', {
    customSearch: true,
  });
  search.enable();
  $$(document).find('#search-input').focusin();
  //cordova.plugins.Keyboard.show();

  $$(document).keypress(function (e) {
    if(e.which == 13) {
      $$(document).find('#search-input').focusout();
      var category = 0;
      var country = 0;
      var sort = 1;
      var keywords = search.query;
      app.showIndicator();
      var result;
      $$.ajax({
        async: true,
        timeout: 1000 * 30,
        cache: false,
        url: config.server + "/api/searcheventlist/" + category +"/"+ country +"/"+ sort +"/"+ keywords,
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200 ){
            result = JSON.parse(data);
            result = util.formatSearchResults(result);
            result.count = result.length;
            $$(document).find('#searchbar-results').html(Template7.templates.searchResultTemplate(result));
            search.disable();
            app.hideIndicator();
          }
          app.hideIndicator();
        },
        error: function( status, xhr) {
          app.hideIndicator();
          app.alert("Oops! Something went wrong");
        }

      });
    }
  });
});

$$(document).find('.categories').on('click', function () {
  var myTab = $$(this).attr("mytab");
  var query = "?mytab="+myTab;
  mainView.router.load ({
    url: 'categories.html'+query,
    context: {
      categoryName: $$(this).html()
    },
    reload: true,
  });
});

app.onPageInit('categories', function(page) {

  var request = {
    category: 9,
    country: 0,
    keywords:0,
    sort:1,
  };
  var myTab = page.query.mytab;
  if (myTab == "concertTab") {
    request.category = 9;
  } else if (myTab == "sportTab") {
    request.category = 10;
  } else if (myTab == "artTab") {
    request.category = 11;
  } else if (myTab == "familyTab") {
    request.category = 12;
  } else if (myTab == "conferenceTab") {
    request.category = 13;
  } else if (myTab == "cinemaTab") {
    request.category = 14;
  } else if (myTab == "travelTab") {
    request.category = 15;
  }
  var categoryEvents;
  var categoryEventsLastIndex = 0;
  var infiniteScroll = true;
  var loading = false;
  var result;
  if (!navigator.onLine) {
    app.addNotification({
      message: language.ERRORS.NO_INTERNET,
      button: {
          text: language.OTHER.CLOSE,
          color: 'orange',
          close:true
        }
    });
    return false;
  }
  $$.ajax({
    async: true,
    timeout: 1000 * 30,
    cache: false,
    url: config.server + "/api/searcheventlist/" + request.category +"/"+ request.country +"/"+ request.sort +"/"+ request.keywords,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        categoryEvents = util.formatSearchResults(result);
        if (categoryEvents.length > 0) {
          var eventSet = eventsService.getMoreEvents(categoryEvents, categoryEventsLastIndex);
          $$(document).find('#category').html(Template7.templates.eventsTemplate(eventSet.events));
          categoryEventsLastIndex = eventSet.index;
        } else {
          $$(document).find('#category').html(noContentMessage);
          $$(document).find('.oops-message').text("We couldn't find any Events in this Category");
        }

      }
    },
    error: function(xhr, status) {
      $$(document).find('#category').html(noContentMessage);
      $$(document).find('.oops-message').text("We couldn't find any Events in this Category");
    }
  });

  $$('.category-scroll').on('refresh', function () {
    setTimeout( function () {
      if (navigator.onLine) {
        var nocache = "?t="+moment().unix();
        $$.ajax({
          async: true,
          timeout: 1000 * 30,
          url: config.server + "/api/searcheventlist/" + request.category +"/"+ request.country +"/"+ request.sort +"/"+ request.keywords + nocache,
          method: "GET",
          success: function(data, status, xhr) {
            if (status == 200){
              categoryEvents = util.formatSearchResults(JSON.parse(data));
              if (!infiniteScroll) {
                app.attachInfiniteScroll($$('.category-scroll'));
                infiniteScroll = true;
                $$('.infinite-scroll-preloader').show();
              }
              categoryEventsLastIndex = 0;
              var eventSet = eventsService.getMoreEvents(categoryEvents, categoryEventsLastIndex);
              $$('#category').html(Template7.templates.eventsTemplate(eventSet.events));
              categoryEventsLastIndex = eventSet.index;
              app.pullToRefreshDone($$('.category-scroll'));
            }
          }
        });
      } else if ($$('#upcomingEvents div').attr('id') == "page-loading") {
        app.pullToRefreshDone($$('.category-scroll'));
        $$(document).find('.category').html(refreshButton);
      } else {
        app.addNotification({
          message: language.ERRORS.NO_INTERNET,
          button: {
              text: language.OTHER.CLOSE,
              color: 'orange',
              close:true
            }
        });
        app.pullToRefreshDone($$('.category-scroll'));
      }
    }, 1500);
  });

  $$('.category-scroll').on('infinite', function () {
    if (loading) return;
    loading = true;
    setTimeout(function () {
      loading = false;
      if (categoryEventsLastIndex >= categoryEvents.length) {
        app.detachInfiniteScroll($$('.category-scroll'));
        infiniteScroll = false;
        $$('.infinite-scroll-preloader').hide();
        return;
      }
      var eventSet = eventsService.getMoreEvents(categoryEvents, categoryEventsLastIndex);
      $$('#category').append(Template7.templates.eventsTemplate(eventSet.events));
      categoryEventsLastIndex = eventSet.index;
    }, 1000);

  });

});

mainView.router.loadPage('home.html');
app.onPageInit('favorites', function(page) {

  $$('.back-home').on('click', function() {
      mainView.router.back({
          url: 'home.html',
      });
  });
});


$$(document).find('.panel-left').on('open', function() {
  $$(this).find('.page-content').scrollTop(0);
});

$$(document).on('click','.social-icon',  function () {
  var social = $$(this).attr('social');
  var options = "";
  var target = "_system";
  var url;
  if (social == "facebook") {
    url = 'https://www.facebook.com/538900149454605';
  } else if (social == "twitter") {
    url = 'https://twitter.com/suntixx';
  } else if (social == "instagram") {
    url = 'https://www.instagram.com/suntixx';
  }

  window.open(url, target);
});

$$(document).on('click', '.external-link', function() {
  var url = $$(this).attr('url');
  var target = "_system";
  window.open(url, target);
});

$$(document).on('click', '.share-app', function() {
  var message = 'Check out the Sun Tixx app.';
  var onSuccess = function(result) {}
  var onError = function(msg) {
    app.alert(language.ERRORS.SHARE_FAIL);
  }
  window.plugins.socialsharing.share(message, null, null,  config.mobileAppLinks.shortlink.toString(), onSuccess, onError);
});

$$(document).on('click', '.rate-app', function () {
  // Check which platform
  var options = "";
  var target = "_system";
  var url;
  if (device.platform.toLowerCase() == "ios") {
      url = config.mobileAppLinks.ios;
  } else if (device.platform.toLowerCase() == "android") {
      url = config.mobileAppLinks.android;
  }
  window.open(url, target);
});

/*$$(document).on('click','.create-event',  function () {
  if (!user) {
    app.loginScreen();
    return;
  }
  mainView.router.load({
    url: 'views/events/create-event.html',
  });
});*/

$$(document).on('click','.open-search', function () {
  mainView.router.load({
    url: 'search-events.html',
  });
});

$$(document).on('click','.purchase-online-tickets',  function () {
  if (!user) {
    afterLoginLink = $$(this);
    app.loginScreen();

    return;
  }
  var eventId = $$(this).attr('event-id');
  if (selectedEventLocal && selectedEventLocal.id == eventId) {
    storeView.router.load({
      url: 'views/purchase/select-quantity.html',
      context: selectedEventLocal,
      reload: true
    });
    app.showTab("#store-view");
  } else {
    $$.ajax({
      async: true,
      timeout: 1000 * 30,
      cache: false,
      url: config.server + "/api/event/" + eventId,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          selectedEventLocal = JSON.parse(data);
          app.hideIndicator();
          if (selectedEventLocal && selectedEventLocal.id) {
            storeView.router.load({
              url: 'views/purchase/select-quantity.html',
              context: selectedEventLocal,
              ignoreCache: true,
              reload: true
            });
            app.showTab("#store-view");
          }
        }
      },
      error: function (status, xhr) {
      app.alert(language.SYSTEM.GENERAL_SERVER_ERROR);
      }
    });
  }
});

$$(document).on('click', '.event-link', function () {
  var eventId = $$(this).attr('event-id');
  var reload = $$(this).hasClass('reload');
  app.showIndicator();
  var result;
  $$.ajax({
    async: true,
    timeout: 1000 * 30,
    cache: false,
    url: config.server + "/api/event/" + eventId,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        app.hideIndicator();
        if (result && result.id) {
          selectedEventLocal = result;
          selectedEventLocal.hasOnlineTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 0}).length > 0;
          mainView.router.load({
            url: 'event.html',
            context: selectedEventLocal,
            reload: reload,
          });
        }
      }
    },
    error: function (status, xhr) {
      app.hideIndicator();
      app.alert(language.SYSTEM.GENERAL_SERVER_ERROR);
    }
  });
});

$$(document).on('click', '.show-promoter', function () {

});


$$(document).on('click', '.search-event-link', function () {
  var eventId = $$(this).attr('event-id');
  app.showIndicator();
  var result;
  $$.ajax({
    async: true,
    timeout: 1000 * 30,
    cache: false,
    url: config.server + "/api/event/" + eventId,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        app.hideIndicator();
        if (result && result.id) {
          selectedEventLocal = result;
          mainView.router.load({
            url: 'event.html',
            context: selectedEventLocal,
            reload: true,
          });
        }
      }
    },
    error: function (status, xhr) {
      app.hideIndicator();
      app.alert("Oops! Something went wrong");
    }
  });
});

$$(document).on('click', '.open-favorites', function () {
  if (!user) {
    afterLoginLink = $$(this);
    app.loginScreen();

    return;
  }
  mainView.router.load({
    url: 'favorites.html',
    context: allUserFavorites
  });
});


$$(document).on('click','.homepage', function () {
  mainView.router.load({
    url: 'home.html',
    reload: true,
  });
});

$$(document).on('click', '.share-event', function () {
  var eventId = $$(this).attr('event-id');
  var eventUrl = config.server + '/ViewEvent/' + eventId;
  var message = 'Check out this event on Suntixx.com';

  var onSuccess = function(result) {

  }
  var onError = function(msg) {
    app.alert(language.ERRORS.SHARE_FAIL);
  }
  window.plugins.socialsharing.share(message, null, null, eventUrl, onSuccess, onError);
});
