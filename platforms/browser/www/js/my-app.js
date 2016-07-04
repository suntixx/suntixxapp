
var barcodes;

$$.get('views/tickets/barcodes.html',
  function(data) {
    barcodes = Template7.compile(data);
  }
);

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

var requestedPage =null;
var requestedArea = null;

var eventsMenuClick = function (e, area) {
  checkInternet();
  if (!user || !user.id ) {
    requestedPage = "events";
    requestedArea = area;
    app.loginScreen();
    return;
  }
  if(!area) { area = "";} else { area = "?area="+area;}
  var nocache = "?t="+moment().unix();
  app.showPreloader("Loading Events");
  var result;
  $$.ajax({
    async: true,
    url: config.server + "/api/getprofileevents/" + user.id + nocache,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        allUserEvents = result;
        result.scanningEventList = eventsService.addScanCondition(result.scanningEventList);
        //alert(JSON.stringify(result.committeeEventList[0].UserTickets));
        mainView.router.load({
          url: 'views/events/myevents.html'+ area,
          context: result,
        });
        app.hidePreloader();
      }
    }
  });
};
$$(document).on('click', '.events-menulink', eventsMenuClick);

$$(document).on('click', '.tickets-menulink', ticketsMenuClick);
function ticketsMenuClick() {
  checkInternet();
  if (!user || !user.id) {
    requestedPage = "tickets";
    app.loginScreen();
    return;
  }
  mainView.router.load ({
    url: 'views/tickets/purchases.html',
  });
}

$$(document).on('click', '.user-menulink', userMenuClick);
function userMenuClick() {
  checkInternet();
  if (!user || !user.id) {
    requestedPage = "user";
    app.loginScreen();
    return;
  }
  mainView.router.load ({
    url: 'views/user/update-details.html',
    context: user,
  });
}

$$(document).on('click', '.facebook-login', facebookLogin);
function facebookLogin() {
  /*if (!facebookConnectPlugin) {
    app.alert("Not Ready Yet");
    return;
  }*/
  app.alert("Still Working Things Out");
  /*facebookConnectPlugin.login ( ['email'],
    function(response) {
      alert(JSON.stringify(response));
    }, function(err) {
      alert(JSON.stringify(err));
    });*/
}

var purchaseTickets = function () {
  if (!user && !user.admin) {
    app.loginScreen();
    return;
  }
  var eventId = $$(this).attr('event-id');
  var nocache = "?t="+moment().unix();
  app.showPreloader("Loading Event");
  var result;
  $$.ajax({
    async: true,
    url: config.server + "/api/event/" + eventId + nocache,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        app.hidePreloader();
        if (result && result.id) {
          selectedEventLocal = result;
          mainView.router.load({
            url: 'views/purchase/select-quantity.html',
            context: selectedEventLocal,
          });
        } else {
          app.hidePreloader();
          app.alert("Oops! Something went wrong");
        }
      }
    },
    error: function (status, xhr) {
      app.hidePreloader();
      app.alert("Oops! Something went wrong");
    }
  });
};

//=============================================================

app.onPageInit('homepage', function(page) {
  /*var instagramListLastIndex = 0;
  var loadingFeed = false;
  var infiniteScrollFeed = true;
  checkInternet();
  var instafeed;
  var feed = new Instafeed({
    target: "homeFeed",
    clientId: "b6bb4ba1d6454f41aabd985b9a1a3d1b",
    accessToken: "1316008879.b6bb4ba.fe2e946a2856480da96095a5679d993f",
    get: "user",
    userId: '1316008879',
    sortBy: 'most-recent',
    mock:true,
    filter: function(thisImage) {
              return image.tags.indexOf("suntixxapp") >= 0;
            },
    error: function(err) {
              app.alert("There was an error fetching feed: "+ err);
            },
    success: function (data) {
              instafeed = data.data;
              var feedSet = eventsService.getMoreEvents(instafeed, instagramListLastIndex);
              $$('#homeFeed').html(Template7.templates.feedTemplate(feedSet.events));
              instagramListLastIndex = feedSet.index;
              $$("#page-loading").hide();
              $$('.infinite-scroll-preloader').show();
            },
  });
  feed.run();*/

  /*$$('.home-refresh').on('refresh', homeFeedRefresh);

  $$('.home-refresh').on('infinite', function () {
    if (loadingFeed) return;
    loadingFeed = true;
    setTimeout(function () {
      loadingFeed = false;
      if (instagramListLastIndex >= instafeed.length) {
        app.detachInfiniteScroll($$('.home-refresh'));
        infiniteScrollFeed = false;
        $$('.infinite-scroll-preloader').hide();
        return;
      }
      var feedSet = eventsService.getMoreEvents(instafeed, instagramListLastIndex);
      $$('#homeFeed').append(Template7.templates.feedTemplate(feedSet.events));
      instagramListLastIndex = feedSet.index;
    }, 1500);
  });*/



$$('#homeFeedTab').on('show', function() {
  var instafeed;
  var instagramListLastIndex = 0;
  var loading = false;
  var infiniteScroll = true;
  checkInternet();
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
              app.alert("There was an error fetching feed: "+ err);
            },
    success: function (data) {
              instafeed = data.data;
              var feedSet = eventsService.getMoreEvents(instafeed, instagramListLastIndex);
              $$(document).find('#homeFeed').html(Template7.templates.feedTemplate(feedSet.events));
              instagramListLastIndex = feedSet.index;
              $$('.infinite-preloader').show();
            },
    });
    feed.run();

    $$('.home-refresh').on('refresh', function() {
      checkInternet();
      setTimeout(function() {
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
                    app.alert("There was an error fetching feed: "+ err);
                  },
          success: function (data) {
                    instafeed = data.data;
                    var feedSet = eventsService.getMoreEvents(instafeed, instagramListLastIndex);
                    $$('#homeFeed').append(Template7.templates.feedTemplate(feedSet.events));
                    instagramListLastIndex = feedSet.index;
                    $$("#page-loading").hide();
                    app.pullToRefreshDone();
                    if (!infiniteScroll) {
                      app.attachInfiniteScroll($$('.home-refresh'));
                      infiniteScroll = true;
                      $$('.infinite-preloader').show();
                    }
                  },
          });

          feed.run();
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

  $$('#homeFeedTab').trigger('show');

  $$(document).find('#featuredEventsTab').on('show', function() {
    checkInternet();
    var featuredEvents;
    var featuredEventsLastIndex = 0;
    var loading = false;
    var infiniteScroll = true;
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      url: config.server + "/api/eventswidget/1"+ nocache,
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
      }

    });

    $$('.featured-scroll').on('refresh', function () {
      if (!navigator.onLine) {
        app.addNotification({
          message: "There was a problem connecting to the Internet.  Please check your connection",
        });
        return false;
      }
      setTimeout(function() {
        var nocache = "?t="+moment().unix();
        $$.ajax({
          async: true,
          url: config.server + "/api/eventswidget/1"+ nocache,
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
          }
        });
      }, 1000);
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

  $$(document).find('#upcomingEventsTab').on('show', function() {
    checkInternet();
    var upcomingEvents;
    var upcomingEventsLastIndex = 0;
    var infiniteScroll = true;
    var loading = false;
    var nocache = "?t="+moment().unix();
    $$.ajax({
      async: true,
      url: config.server + "/api/eventswidget/3"+ nocache,
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
      }
    });

    $$('.upcoming-scroll').on('refresh', function () {
      checkInternet();
      setTimeout( function () {
        var nocache = "?t="+moment().unix();
        $$.ajax({
          async: true,
          url: config.server + "/api/eventswidget/3"+ nocache,
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
          }
        });
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
});



app.onPageInit('search-events', function (page) {
  var search = app.searchbar('.searchbar', {
    customSearch: true,
  });
  search.enable();
  $$(document).find('#search-input').focus();


  $$(document).keypress(function (e) {
    if(e.which == 13) {
      $$(document).find('#search-input').focusout();
      var nocache = "?t="+moment().unix();
      var category = 0;
      var country = 0;
      var sort = 1;
      var keywords = search.query;
      app.showPreloader("Searching Events");
      var result;
      $$.ajax({
        async: true,
        url: config.server + "/api/searcheventlist/" + category +"/"+ country +"/"+ sort +"/"+ keywords + nocache,
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200 ){
            result = JSON.parse(data);
            result = util.formatSearchResults(result);
            result.count = result.length;
            $$(document).find('#searchbar-results').html(Template7.templates.searchResultTemplate(result));
            search.disable();
            app.hidePreloader();
          }
          app.hidePreloader();
        },
        error: function( status, xhr) {
          app.hidePreloader();
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
  //alert(myTab);
  if (myTab == "#concertTab") {
    request.category = 9;
  } else if (myTab == "#sportTab") {
    request.category = 10;
  } else if (myTab == "#artTab") {
    request.category = 11;
  } else if (myTab == "#familyTab") {
    request.category = 12;
  } else if (myTab == "#conferenceTab") {
    request.category = 13;
  } else if (myTab == "#cinemaTab") {
    request.category = 14;
  } else if (myTab == "#travelTab") {
    request.category = 15;
  }
  var categoryEvents;
  var categoryEventsLastIndex = 0;
  var infiniteScroll = true;
  var loading = false;
  var nocache = "?t="+moment().unix();
  var result;
  $$.ajax({
    async: true,
    url: config.server + "/api/searcheventlist/" + request.category +"/"+ request.country +"/"+ request.sort +"/"+ request.keywords + nocache,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        categoryEvents = util.formatSearchResults(result);
        //$$("#page-loading").hide();
        if (categoryEvents.length > 0) {
          //$$('#category').html(Template7.templates.eventsTemplate(result));
          var eventSet = eventsService.getMoreEvents(categoryEvents, categoryEventsLastIndex);
          $$(document).find('#category').html(Template7.templates.eventsTemplate(eventSet.events));
          categoryEventsLastIndex = eventSet.index;
        } else {
          $$(document).find('#category').html(noContentMessage);
          $$(document).find('.oops-message').text("We couldn't find any Events in this Category");
        }

      }
    }
  });

  $$('.category-scroll').on('refresh', function () {
    checkInternet();
    setTimeout( function () {
      var nocache = "?t="+moment().unix();
      $$.ajax({
        async: true,
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
    }, 1500);
  });

  $$('.category-scroll').on('infinite', function () {
    checkInternet();
    //alert("end");
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

  $$('.purchase-tickets').on('click',  purchaseTickets);
});

mainView.router.loadPage('home.html');

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
    url = 'tps://www.instagram.com/suntixx';
  }

  window.open(url, target);
});

$$(document).on('click', '.share-app', function() {
  var message = 'Check out this app tickets app. Android:https://play.google.com/store/apps/details?id=com.suntixx.application, iOS:https://itunes.apple.com/app/id1128174731';
  var onSuccess = function(result) {}
  var onError = function(msg) {
    app.alert("There was a problem sharing the app. Please try again!");
  }
  window.plugins.socialsharing.share(message, null, null, null, onSuccess, onError);
});

$$(document).on('click', '.rate-app', function () {
  // Check which platform
  var options = "";
  var target = "_system";
  var url;
  if (device.platform.toLowerCase() == "ios") {
      url ='itms-apps://itunes.apple.com/app/id1128174731';
  } else if (device.platform.toLowerCase() == "android") {
      url = 'market://details?id=com.suntixx.application';
  }

  window.open(url, target);
});

$$(document).on('click','.create-event',  function () {
  if (!user) {
    app.loginScreen();
    return;
  }
  mainView.router.load({
    url: 'views/events/create-event.html',
  });
});

$$(document).on('click','.open-search', function () {
  mainView.router.load({
    url: 'search-events.html',
  });
});

$$(document).on('click','.purchase-tickets',  function () {
  if (!user) {
    app.loginScreen();
    return;
  }
  var eventId = $$(this).attr('event-id');
  var nocache = "?t="+moment().unix();
  app.showPreloader("Loading Event");
  var result;
  $$.ajax({
    async: true,
    url: config.server + "/api/event/" + eventId + nocache,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        app.hidePreloader();
        if (result && result.id) {
          selectedEventLocal = result;
          mainView.router.load({
            url: 'views/purchase/select-quantity.html',
            context: selectedEventLocal,
          });
        } else {
          app.hidePreloader();
          app.alert("Oops! Something went wrong");
        }
      }
    },
    error: function (status, xhr) {
      app.hidePreloader();
      app.alert("Oops! Something went wrong");
    }
  });
});

$$(document).on('click', '.event-link', function () {
  var eventId = $$(this).attr('event-id');
  var nocache = "?t="+moment().unix();
  app.showPreloader("Loading Event");
  var result;
  $$.ajax({
    async: true,
    url: config.server + "/api/event/" + eventId + nocache,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        app.hidePreloader();
        if (result && result.id) {
          selectedEventLocal = result;
          selectedEventLocal.hasOnlineTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 0}).length > 0;
          mainView.router.load({
            url: 'event.html',
            context: selectedEventLocal,
          });
        } else {
          app.hidePreloader();
          app.alert("Oops! Something went wrong");
        }
      }
    },
    error: function (status, xhr) {
      app.hidePreloader();
      app.alert("Oops! Something went wrong");
    }
  });
});

$$(document).on('click', '.show-promoter', function () {

});


$$(document).on('click', '.search-event-link', function () {
  var eventId = $$(this).attr('event-id');
  var nocache = "?t="+moment().unix();
  app.showPreloader("Loading Event");
  var result;
  $$.ajax({
    async: true,
    url: config.server + "/api/event/" + eventId + nocache,
    method: "GET",
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        app.hidePreloader();
        if (result && result.id) {
          selectedEventLocal = result;
          mainView.router.load({
            url: 'event.html',
            context: selectedEventLocal,
          });
        } else {
          app.hidePreloader();
          app.alert("Oops! Something went wrong");
        }
      }
    },
    error: function (status, xhr) {
      app.hidePreloader();
      app.alert("Oops! Something went wrong");
    }
  });
});

$$(document).on('click', '.goto-sell', function (e) {
  eventsMenuClick(e, "committee");
});

$$(document).on('click', '.goto-scan', function (e) {
  eventsMenuClick(e, "access");
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
    app.alert("There was a problem sharing the event. Please try again!");
  }
  window.plugins.socialsharing.share(message, null, null, eventUrl, onSuccess, onError);
});
