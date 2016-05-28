
var mainView = app.addView('.view-main', {

domCache: true,
});
mainView.router.loadPage('home.html');

var formView = app.addView('.view-form', {
  domCache: true,
});

var editTicket;
var addTicket;
var editCommTicket;
var editCommMember;
var userProfile;
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

$$.get('views/user/user.html',
  function(data) {
    userProfile = Template7.compile(data);
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
  var name = "";
  if (user.name2) {
    name += user.name2  + " ";
  }
  if (user.name4) {
    name += user.name4 + " ";
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
  var html = '<div class="list-block">' +
              '<ul>' +
               '<li class="item-content row">' +
              '   <a href="#" class="login link close-panel col-100">'+
                  '<div class="item-inner row">' +
                    '<div class="item-title-row">' +
                      '<div class="item-title">Log In</div>' +
                    '</div>' +
                  '</div>' +
                  '</a>'+
                '</li>' +
                '<li class="item-content row">' +
                '   <a href="#" class="create-user link close-panel col-100">'+
                   '<div class="item-inner row">' +
                     '<div class="item-title-row">' +
                       '<div class="item-title">Create User</div>' +
                     '</div>' +
                   '</div>' +
                   '</a>'+
                 '</li>' +
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
$$(document).on('click', '.events-menulink', eventsMenuClick);
function eventsMenuClick(area) {
  if(!area) { area = "";} else { area = "?area="+area;}
  if (!user) {
    requestedPage = "events";
    requestedArea = area;
    app.loginScreen();
    return;
  }

  var allEvents = JSON.parse(Server.getEvents(user.id));
  //alert('here');

  allEvents.scanningEventList = eventsService.addScanCondition(allEvents.scanningEventList);

  mainView.router.load({
    url: 'views/events/myevents.html'+ area,
    context: allEvents,
  });
}

$$(document).on('click', '.tickets-menulink', ticketsMenuClick);
function ticketsMenuClick() {
  if (!user) {
    requestedPage = "tickets";
    app.loginScreen();
    return;
  }
  var allEvents = JSON.parse(Server.getEvents(user.id));
  mainView.router.load ({
    url: 'views/tickets/purchases.html',
    context: allEvents,
  });
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
  var instafeed;

  var feed = new Instafeed({
    //mock: true,
    target: "homeFeedTab",
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
              $$(document).find('#homeFeedTab').html(Template7.templates.feedTemplate(instafeed));
            },
  });

  feed.run();


$$(document).find('#homepageTab').on('show', function() {

  var feed = new Instafeed({
    //mock: true,
    target: "homeFeedTab",
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
              $$(document).find('#homeFeedTab').html(Template7.templates.feedTemplate(instafeed));
            },
  });

  feed.run();
  });

  $$(document).find('#featuredEventsTab').on('show', function() {
    //alert("featured");
    var featuredEvents = [];
    featuredEvents = JSON.parse(Server.getHomepageEvents(1));
    //alert(featuredEvents);
    if (featuredEvents.length > 0) {
      $$(document).find('#featuredEventsTab').html(Template7.templates.eventsTemplate(featuredEvents));
    }
  });

  $$(document).find('#upcomingEventsTab').on('show', function() {
    var upcomingEvents = [];
    upcomingEvents = JSON.parse(Server.getHomepageEvents(3));
    if (upcomingEvents.length > 0) {
      $$(document).find('#upcomingEventsTab').html(Template7.templates.eventsTemplate(upcomingEvents));
    }
  });

  $$(document).find('#justAddedEventsTab').on('show', function() {
    var justAddedEvents = [];
    justAddedEvents = JSON.parse(Server.getHomepageEvents(2));
    if (justAddedEvents.length > 0) {
      $$(document).find('#justAddedEventsTab').html(Template7.templates.eventsTemplate(justAddedEvents));
    }
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
    $$(document).find('.view-main').hide();
    $$(document).find('.view-form').show();
    formView.router.load({
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
    $$(document).find('.view-main').hide();
    $$(document).find('.view-form').show();
    formView.router.load({
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
      var request = {
        keywords: search.query,
      }
      var results = JSON.parse(Server.searchEvents(request));
      results = util.formatSearchResults(results);
      results.count = results.length;
      $$(document).find('#searchbar-results').html(Template7.templates.searchResultTemplate(results));
      search.disable();
    }
  });
});


app.onPageInit('categories', function(page) {

  $$(document).find('.categories-menu').addClass('active');
  $$(document).find('.home-menu').removeClass('active');

  var request = {
    category: 9,
    country: 0,
    keywords:0,
    sort:1,
  };
  feed = null;
  //alert('here');
  var events = JSON.parse(Server.searchEvents(request));
  events = util.formatSearchResults(events);
  if (events.length > 0) {
    $$('#concertTab').html(Template7.templates.eventsTemplate(events));
  }

  $$('#concertTab').on('show', function () {
    var request = {
      category: 9,
      country: 0,
      keywords:0,
      sort:1,
    };
    //alert('here');
    var events = JSON.parse(Server.searchEvents(request));
    events = util.formatSearchResults(events);
    if (events.length > 0) {
      $$('#concertTab').html(Template7.templates.eventsTemplate(events));
    }

  });

  $$('#sportTab').on('show', function () {
    var request = {
      category: 10,
      country: 0,
      keywords:0,
      sort:1,
    };
    //alert('here');
    var events = JSON.parse(Server.searchEvents(request));
    events = util.formatSearchResults(events);
    if (events.length > 0) {
      $$('#sportTab').html(Template7.templates.eventsTemplate(events));
    }

  });

  $$('#artTab').on('show', function () {
    var request = {
      category: 11,
      country: 0,
      keywords:0,
      sort:1,
    };
    //alert('here');
    var events = JSON.parse(Server.searchEvents(request));
    events = util.formatSearchResults(events);
    if (events.length > 0) {
      $$('#artTab').html(Template7.templates.eventsTemplate(events));
    }

  });

  $$('#familyTab').on('show', function () {
    var request = {
      category: 12,
      country: 0,
      keywords:0,
      sort:1,
    };
    //alert('here');
    var events = JSON.parse(Server.searchEvents(request));
    events = util.formatSearchResults(events);
    if (events.length > 0) {
      $$('#familyTab').html(Template7.templates.eventsTemplate(events));
    }

  });

  $$('#conferenceTab').on('show', function () {
    var request = {
      category: 13,
      country: 0,
      keywords:0,
      sort:1,
    };
    //alert('here');
    var events = JSON.parse(Server.searchEvents(request));
    events = util.formatSearchResults(events);
    if (events.length > 0) {
      $$('#conferenceTab').html(Template7.templates.eventsTemplate(events));
    }

  });

  $$('#cinemaTab').on('show', function () {
    var request = {
      category: 14,
      country: 0,
      keywords:0,
      sort:1,
    };
    //alert('here');
    var events = JSON.parse(Server.searchEvents(request));
    events = util.formatSearchResults(events);
    if (events.length > 0) {
      $$('#cinemaTab').html(Template7.templates.eventsTemplate(events));
    }

  });

  $$('#travelTab').on('show', function () {
    var request = {
      category: 15,
      country: 0,
      keywords:0,
      sort:1,
    };
    //alert('here');
    var events = JSON.parse(Server.searchEvents(request));
    events = util.formatSearchResults(events);
    if (events.length > 0) {
      $$('#travelTab').html(Template7.templates.eventsTemplate(events));
    }

  });


});

$$(document).on('click','.social-icon',  function () {
  var social = $$(this).attr('social');
  var options = "";
  var target = "_self";
  var url;
  if (social == "facebook") {
    url = 'https://www.facebook.com/suntixxcaribbean';
  } else if (social == "twitter") {
    url = 'https://twitter.com/suntixx';
  } else if (social == "instagram") {
    url = "https://www.instagram.com/suntixx/";
  } else if (social == "linkedin") {
    url = "https://www.linkedin.com/company/sun-tixx-caribbean-limited";
  } else if (social == "google") {
    url = "https://plus.google.com/105277447868361703738/posts";
  }

  window.open(url, target);
});

$$(document).on('click','.create-event',  function () {
  if (!user) {
    app.loginScreen();
    return;
  }
  $$(document).find('.view-main').hide();
  $$(document).find('.view-form').show();
  formView.router.load({
    url: 'views/events/create-event.html',
  });
});

$$(document).on(' click','.purchase-tickets',  function () {
  if (!user) {
    app.loginScreen();
    return;
  }
  var eventId = $$(this).attr('event-id');
  var eventInfo = JSON.parse(Server.getEvent(eventId));
  $$(document).find('.view-main').hide();
  $$(document).find('.view-form').show();
  formView.router.load({
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

$$(document).on('click', '.goto-sell', function () {
  eventsMenuClick('committee');
});

$$(document).on('click', '.goto-scan', function () {
  eventsMenuClick('access');
});

$$(document).on('click','.home', function () {
  //alert('going home');
  mainView.router.back({
    url: 'home.html',
    force: true,
    ignoreCache: true,
    //reload: true,
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

$$(document).on('click','.back-events', function () {
  allEvents = JSON.parse(Server.getEvents(user.id));
  //$$(document).find('.view-form').hide();
  //$$(document).find('.view-main').show();
  mainView.router.back ({
    force:true,
    ignoreCache: true,
    url: 'views/events/events.html',
    context: allEvents,
  });
});

$$(document).on('click','.back-committee', function () {
  mainView.router.back({
    url: 'views/events/update-committee.html',
    ignoreCache: true,
    context:selectedEventLocal,
    force:true,
  });
});
