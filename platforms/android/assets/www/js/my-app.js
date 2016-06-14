



/*$$(document).on('ajaxStart', function(e) {
  alert(JSON.stringify(e));
  var xhr = e.detail.xhr;
  if (navigator.connection.type === Connection.NONE) {
    xhr.abort();
    app.alert("Unable to Find an Internet Connection");
  }
});*/
//var formView = app.addView('.view-form', {
  //domCache: true,
//});

//if (PayPalMobile) {
//  alert ('here');/
//}

var editTicket;
var addTicket;
var editCommTicket;
var editCommMember;
var barcodes;
$$.get('views/events/edit-ticket.html',
  function(data) {
    editTicket = Template7.compile(data);
  }
);

$$.get('views/events/add-ticket.html',
  function(data) {
    addTicket = Template7.compile(data);
  }
);

$$.get('views/events/edit-committee-ticket.html',
  function(data) {
    editCommTicket = Template7.compile(data);
  }
);

$$.get('views/events/committee-settings.html',
  function(data) {
    editCommMember = Template7.compile(data);
  }
);

$$.get('views/tickets/barcodes.html',
  function(data) {
    barcodes = Template7.compile(data);
  }
);


//mainView.router.loadPage('home.html');
//Server.logoutUser();

//alert(storedUserId);
//if (storedUser.id > 0) {
//  user = JSON.parse(Server.loginUser(storedUser));
  //alert(storedUser.session);
  //alert(JSON.stringify(user));
//}
//config.user = user;
//alert(user.id);
//storage.setItem(userEmail, 'admin@suntixx.com');
//var user = {
//  id : storage.getItem(userId),
//  email: storage.getItem(userEmail),
//};

function showAvatar() {
  var name;
  if (user) {
    name = user.name2+" "+user.name4;
  }
  var organization = user.organization ? user.organization.name : '' ;

  var html = '<div class="list-block media-list user-avatar">' +
              '<ul>' +
               '<li class="item-content">' +
                  '<div class="item-media row">' +
                    '<img class="user-image" src="' + config.server + '/thumbnails/users/' + user.id + '/portrait.png" width="44">' +
                  '</div>' +
                  '<div class="item-inner row">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title">' + name.trim() +'</div>' +
                    '</div>' +
                    '<div class="item-subtitle">' + organization + '</div>' +
                  '</div>' +
                '</li>' +
              '</ul>' +
            '</div>';
            //alert(html);
  $$(document).find('#user-avatar').html(html);
}

function showLoginOrCreate () {
  var html = '<div class="list-block media-list">' +
              '<ul>' +
               '<li class="item-content"><a href="#" class="login link close-panel">' +
                  '<div class="item-inner">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title color-orange"><i class="icon icon-login"></i>Sign In</div>' +
                    '</div>' +
                  '</div>' +
                '</a></li>' +
                '<li class="item-content"><a href="#" class="create-new-user link close-panel">' +
                   '<div class="item-inner">' +
                     '<div class="item-title-row">' +
                       '<div class="item-title color-orange"><i class="icon icon-register"></i>Create Account</div>' +
                     '</div>' +
                   '</div>' +
                 '</a></li>' +
              '</ul>' +
            '</div>';
  $$(document).find('#user-avatar').html(html);
  $$(document).find('.logout-menu').hide();
}

if (user) {
  showAvatar();
} else {
  showLoginOrCreate();
}


$$(document).on('click','.open-search', function () {
  mainView.router.load({
    url: 'search-events.html',
  });
});

var requestedPage =null;
var requestedArea = null;

var eventsMenuClick = function (e, area) {
  if (!user) {
    requestedPage = "events";
    requestedArea = area;
    app.loginScreen();
    return;
  }
  if(!area) { area = "";} else { area = "?area="+area;}
  var redirect = 'views/events/myevents.html'+ area;
  Server.getEvents(user.id, redirect);
  //alert('here');

  /*allEvents.scanningEventList = eventsService.addScanCondition(allEvents.scanningEventList);

  mainView.router.load({
    url: 'views/events/myevents.html'+ area,
    context: allEvents,
  });*/
};
$$(document).on('click', '.events-menulink', eventsMenuClick);

$$(document).on('click', '.tickets-menulink', ticketsMenuClick);
function ticketsMenuClick() {
  if (!user) {
    requestedPage = "tickets";
    app.loginScreen();
    return;
  }
  var redirect = 'views/tickets/purchases.html';
  Server.getEvents(user.id, redirect);
  /*mainView.router.load ({
    url: 'views/tickets/purchases.html',
    context: allEvents,
  });*/
}

$$(document).on('click', '.user-menulink', userMenuClick);
function userMenuClick() {
  if (!user) {
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



//=============================================================

app.onPageInit('homepage', function(page) {

  //var div = document.getElementById('test');
  //map.setDiv(div);
  var instafeed;
  app.showPreloader("Loading Feed");
  var feed = new Instafeed({
    //mock: true,
    target: "homeFeed",
    clientId: "b6bb4ba1d6454f41aabd985b9a1a3d1b",
    accessToken: "1316008879.b6bb4ba.fe2e946a2856480da96095a5679d993f",
    get: "user",
    userId: '1316008879',
    sortBy: 'most-recent',
    mock:true,
    //tagName: "suntixx",
    error: function(err) {
              app.alert("There was an error fetching feed: "+ err);
            },
    success: function (data) {
              instafeed = data.data;
               //alert(JSON.stringify(instafeed));
              //var tmp = SEARCHJS.matchArray(instafeed, {type: "video"});
              //alert(JSON.stringify(tmp));
              $$(document).find('#homeFeed').html(Template7.templates.feedTemplate(instafeed));
              app.hidePreloader();
            },
  });

  feed.run();

  $$('.home-refresh').on('refresh', function () {
    setTimeout(function() {
      app.showPreloader("Loading Feed");
        feed = new Instafeed({
        target: "homeFeed",
        clientId: "b6bb4ba1d6454f41aabd985b9a1a3d1b",
        accessToken: "1316008879.b6bb4ba.fe2e946a2856480da96095a5679d993f",
        get: "user",
        userId: '1316008879',
        sortBy: 'most-recent',
        mock:true,
        error: function(err) {
                  app.alert("There was an error fetching feed: "+ err);
                },
        success: function (data) {
                  instafeed = data.data;
                  $$(document).find('#homeFeed').html(Template7.templates.feedTemplate(instafeed));
                  app.hidePreloader();
                },
        });

        feed.run();
        app.pullToRefreshDone();
    }, 2000);
  });


$$(document).find('#homepageTab').on('show', function() {
  app.showPreloader("Loading Feed");
  var feed = new Instafeed({
    //mock: true,
    target: "homeFeed",
    clientId: "b6bb4ba1d6454f41aabd985b9a1a3d1b",
    accessToken: "1316008879.b6bb4ba.fe2e946a2856480da96095a5679d993f",
    get: "user",
    userId: '1316008879',
    sortBy: 'most-recent',
    mock:true,
    error: function(err) {
              app.alert("There was an error fetching feed: "+ err);
            },
    success: function (data) {
              instafeed = data.data;
              $$(document).find('#homeFeed').html(Template7.templates.feedTemplate(instafeed));
              app.hidePreloader();
            },
    });

    feed.run();



  });



  $$(document).find('#featuredEventsTab').on('show', function() {
    var featuredEvents;
    var featuredEventsLastIndex = 0;
    var loading = false;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Loading Events");
    $$.ajax({
      async: true,
      url: config.server + "/api/eventswidget/1"+ nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200){
          featuredEvents = JSON.parse(data);
          var eventSet = eventsService.getMoreEvents(featuredEvents, featuredEventsLastIndex);
          $$(document).find('#featuredEventsTab').html(Template7.templates.eventsTemplate(eventSet.events));
          featuredEventsLastIndex = eventSet.index;
          app.hidePreloader();
        }
      }

    });

    $$('.featured-scroll').on('refresh', function () {
      setTimeout(function() {
        var nocache = "?t="+moment().unix();
        app.showPreloader("Loading Events");
        $$.ajax({
          async: true,
          url: config.server + "/api/eventswidget/1"+ nocache,
          method: "GET",
          success: function(data, status, xhr) {
            if (status == 200){
              featuredEvents = JSON.parse(data);
              featuredEventsLastIndex = 0;
              var eventSet = eventsService.getMoreEvents(featuredEvents, featuredEventsLastIndex);
              $$(document).find('#featuredEventsTab').html(Template7.templates.eventsTemplate(eventSet.events));
              featuredEventsLastIndex = eventSet.index;
              app.hidePreloader();
              app.pullToRefreshDone();
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
          $$('.featured-scroll-preloader').remove();
          return;
        }
        var eventSet = eventsService.getMoreEvents(featuredEvents, featuredEventsLastIndex);
        $$('#featuredEventsTab').append(Template7.templates.eventsTemplate(eventSet.events));
        featuredEventsLastIndex = eventSet.index;
      }, 1500);
    });


  });

  $$(document).find('#upcomingEventsTab').on('show', function() {
    var upcomingEvents;
    var upcomingEventsLastIndex = 0;
    var loading = false;
    var nocache = "?t="+moment().unix();
    app.showPreloader("Loading Events");
    $$.ajax({
      async: true,
      url: config.server + "/api/eventswidget/3"+ nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200){
          upcomingEvents = JSON.parse(data);
          var eventSet = eventsService.getMoreEvents(upcomingEvents, upcomingEventsLastIndex);
          $$(document).find('#upcomingEventsTab').html(Template7.templates.eventsTemplate(eventSet.events));
          app.hidePreloader();
        }
      }
    });

    $$('.upcoming-scroll').on('refresh', function () {
      setTimeout( function () {
        var upcomingEventsLastIndex = 0;
        var loading = false;
        var nocache = "?t="+moment().unix();
        app.showPreloader("Loading Events");
        $$.ajax({
          async: true,
          url: config.server + "/api/eventswidget/3"+ nocache,
          method: "GET",
          success: function(data, status, xhr) {
            if (status == 200){
              upcomingEvents = JSON.parse(data);
              var eventSet = eventsService.getMoreEvents(upcomingEvents, upcomingEventsLastIndex);
              $$(document).find('#upcomingEventsTab').html(Template7.templates.eventsTemplate(eventSet.events));
              app.hidePreloader();
              app.pullToRefreshDone();
            }
          }
        });
      }, 1500);
    });

    $$('.upcoming-scroll').on('infinite', function () {
      //alert("end");
      if (loading) return;
      loading = true;
      setTimeout(function () {
        loading = false;
        if (upcomingEventsLastIndex >= upcomingEvents.length) {
          app.detachInfiniteScroll($$('.upcoming-scroll'));
          $$('.upcoming-scroll-preloader').remove();
          return;
        }
        var eventSet = eventsService.getMoreEvents(upcomingEvents, upcomingEventsLastIndex);
        $$('#upcomingEventsTab').append(Template7.templates.eventsTemplate(eventSet.events));
        upcomingEventsLastIndex = eventSet.index;
      }, 1000);

    });
  });

  $$(document).find('#justAddedEventsTab').on('show', function() {
    var nocache = "?t="+moment().unix();
    app.showPreloader("Loading Events");
    var result;
    $$.ajax({
      async: true,
      url: config.server + "/api/eventswidget/3"+ nocache,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200){
          result = JSON.parse(data);
          $$(document).find('#justAddedEventsTab').html(Template7.templates.eventsTemplate(result));
          app.hidePreloader();
        }
      }
    });
  });

  $$(document).on('click','.open-search', function () {
    mainView.router.load({
      url: 'search-events.html',
    });
  });

  $$(document).on('click','.create-event',  function () {
    if (!user) {
      app.loginScreen();
      return;
    }
    //$$(document).find('.view-main').hide();
    //$$(document).find('.view-form').show();
    mainView.router.load({
      url: 'views/events/create-event.html'
    });
  });

  $$('.purchase-tickets').on('click',  function () {
    //if (!user) {
    //  app.loginScreen();
    //  return;
    //}
    var eventId = $$(this).attr('event-id');
    var eventInfo = JSON.parse(Server.getEvent(eventId));
    //$$(document).find('.view-main').hide();
    //$$(document).find('.view-form').show();
    mainView.router.load({
      url: 'views/purchase/select-quantity.html',
      context: eventInfo,
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

  //$$(document).find('.categories-menu').addClass('active');
  //$$(document).find('.home-menu').removeClass('active');
  /*var request = {
    category: 9,
    country: 0,
    keywords:0,
    sort:1,
  };
  Server.searchEvents(request, '#concertTab');*/

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

  Server.searchEvents(request, '#category');

  /*if (myTab) {
    app.showTab(myTab);
  } else {
    app.showTab('#concertTab');
  }

  $$('#concertTab').on('show', function () {
    var request = {
      category: 9,
      country: 0,
      keywords:0,
      sort:1,
    };
    Server.searchEvents(request, '#concertTab');

  });

  $$('#sportTab').on('show', function () {
    var request = {
      category: 10,
      country: 0,
      keywords:0,
      sort:1,
    };
    Server.searchEvents(request, '#sportTab');
  });

  $$('#artTab').on('show', function () {
    var request = {
      category: 11,
      country: 0,
      keywords:0,
      sort:1,
    };
    Server.searchEvents(request, '#artTab');
  });

  $$('#familyTab').on('show', function () {
    var request = {
      category: 12,
      country: 0,
      keywords:0,
      sort:1,
    };
    Server.searchEvents(request, '#familyTab');
  });

  $$('#conferenceTab').on('show', function () {
    var request = {
      category: 13,
      country: 0,
      keywords:0,
      sort:1,
    };
    Server.searchEvents(request, '#conferenceTab');
  });

  $$('#cinemaTab').on('show', function () {
    var request = {
      category: 14,
      country: 0,
      keywords:0,
      sort:1,
    };
    Server.searchEvents(request, '#cinemaTab');
  });

  $$('#travelTab').on('show', function () {
    var request = {
      category: 15,
      country: 0,
      keywords:0,
      sort:1,
    };
    Server.searchEvents(request, '#travelTab');
  });*/


});

$$(document).on('click','.social-icon',  function () {
  var social = $$(this).attr('social');
  var options = "";
  var target = "_system";
  var url;
  if (social == "facebook") {
    url = 'https://www.facebook.com/suntixxcaribbean';
  } else if (social == "twitter") {
    url = 'https://twitter.com/suntixx';
  } else if (social == "instagram") {
    url = "https://www.instagram.com/suntixx/";
  }

  window.open(url, target, options);
});

$$(document).on('click','.create-event',  function () {
  if (!user) {
    app.loginScreen();
    return;
  }
  //$$(document).find('.view-main').hide();
  //$$(document).find('.view-form').show();
  mainView.router.load({
    url: 'views/events/create-event.html',
  });
});

$$(document).on('click','.purchase-tickets',  function () {
  if (!user) {
    app.loginScreen();
    return;
  }
  var eventId = $$(this).attr('event-id');
  var eventInfo = JSON.parse(Server.getEvent(eventId));
  //$$(document).find('.view-main').hide();
  //$$(document).find('.view-form').show();
  mainView.router.load({
    url: 'views/purchase/select-quantity.html',
    context: eventInfo,
  });
});

$$(document).on('click', '.event-link', function () {
  var eventId = $$(this).attr('event-id');
  //var selectedEvent = SEARCHJS.matchArray(myEvents.managedEventList, {id: eventId });
  var selectedEvent = JSON.parse(Server.getEvent(eventId));
  //alert(JSON.stringify(selectedEventLocal));
  mainView.router.load({
    url: 'event.html',
    context: selectedEvent,
  });
});

$$(document).on('click', '.show-promoter', function () {

});


$$(document).on('click', '.search-event-link', function () {
  var eventId = $$(this).attr('event-id');
  var eventInfo = JSON.parse(Server.getEvent(eventId));
  mainView.router.load({
    url: 'event.html',
    context: eventInfo,
  });
});

$$(document).on('click', '.goto-sell', function (e) {
  eventsMenuClick(e, "committee");
});

$$(document).on('click', '.goto-scan', function (e) {
  eventsMenuClick(e, "access");
});

$$(document).on('click','.homepage', function () {
  //alert('going home');
  mainView.router.load({
    url: 'home.html',
    //force: true,
    //ignoreCache: true,
    reload: true,
  });
});

$$(document).on('click','.back-main', function () {
  $$(document).find('.view-form').hide();
  $$(document).find('.view-main').show();
});



$$(document).on('click','.back-event', function () {
  //$$(document).find('.view-form').hide();
  //$$(document).find('.view-main').show();
  mainView.router.back({
    url: 'views/events/event.html',
    force: true,
    ignoreCache: true,
    context:selectedEventLocal,
  });
});

/*$$(document).on('click','.back-events', function () {
  //allEvents = JSON.parse(Server.getEvents(user.id));
  //$$(document).find('.view-form').hide();
  //$$(document).find('.view-main').show();
  mainView.router.back ({
    force:true,
    //ignoreCache: true,
    url: 'views/events/myevents.html',
    //context: allEvents,
  });
});*/

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

$$(document).on('click','.back-committee', function () {
  mainView.router.back({
    url: 'views/events/update-committee.html',
    ignoreCache: true,
    context:selectedEventLocal,
    force:true,
  });
});
