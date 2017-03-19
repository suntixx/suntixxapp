var app;
var $$ = Dom7;
var storage = window.localStorage;
var user = JSON.parse(storage.getItem('userData'));
if (user) {
  user.password = storage.getItem('userPassword');
}
var selectedEventLocal = null;
var appActive = true;
var afterLoginLink = null;
var returnFromStoreTab = null;
var loginScreenOpened = false;
var refreshButton;
//storage.removeItem(myEvents);
var allUserEvents = JSON.parse(storage.getItem('myEvents'));
if (!allUserEvents || !allUserEvents.managedEventList || !allUserEvents.scanningEventList || !allUserEvents.committeeEventList || !allUserEvents.favoriteEventList || !allUserEvents.previousEventList) {
  allUserEvents = {
    managedEventList: [],
    scanningEventList: [],
    committeeEventList: [],
    favoriteEventList: [],
    previousEventList: []
  };
}
var allUserFavorites = JSON.parse(storage.getItem('myFavorites'));
if (!allUserFavorites) {
  allUserFavorites = {
    attending: [],
    interested: []
  };
}
var allUserTickets = JSON.parse(storage.getItem('myTickets'));
if (!allUserTickets || !allUserTickets.selltickets || !allUserTickets.mytickets) {
  allUserTickets = {
    selltickets: [],
    mytickets: [],
  };
}

//storage.removeItem('myWallet');
//storage.setItem('myWallet', '');
var myWallet = JSON.parse(storage.getItem('myWallet'));
if (!myWallet) {
  myWallet = [];
}
var upcomingEvents = [];
var camera;
var geolocation;
var connection;
var fileTransfer;
var fileSystem;
var db;
var language;
var push;
var config;
var utcOffset;
storage.setItem('servertimezone', '-07:00');

/*var onlineScan = storage.getItem('onlinescan');
if (!onlineScan) {
  storage.setItem('onlinescan', false);
  onlineScan = true;
}*/


$$.ajax ({
  method: "GET",
  async: false,
  url: "config/config.json",
  success: function(data, status, xhr) {
    config = JSON.parse(data);
    var settings = JSON.parse(storage.getItem('settings'))
    if (settings) {
      config.settings = settings;
    } else {
      storage.setItem('settings', settings);
    }
    //config.settings.autoScan = autoScan;
  },
  error: function(status, xhr) {
    alert("Application Failure. Re-install may be required");
  }
});
moment().format();
//moment().utcOffset(-7////);

// Initialize your app
app = new Framework7({
      //cache: true,
      modalTitle: config.appName,
      modalTemplate: '<div class="modal bg-indigo color-white {{#unless buttons}}modal-no-buttons{{/unless}}">'+
                        '<div class="modal-inner" style="text-align:center">'+
                            '<div class="modal-title"><i class="icon icon-suntixx"></i></div>'+
                          //'{{#if text}}'+
                            '<div class="modal-text">{{text}}</div>'+
                          //'{{/if}}'+
                          '{{#if afterText}}'+
                            '{{afterText}}'+
                          '{{/if}}'+
                        '</div>'+
                        '{{#if buttons}}'+
                          '<div class="modal-buttons bg-white {{#if verticalButtons}}modal-buttons-vertical{{/if}}">'+
                            '{{#each buttons}}'+
                              '<span class="modal-button {{#if bold}}modal-button-bold{{/if}}">{{text}}</span>'+
                            '{{/each}}'+
                          '</div>'+
                        '{{/if}}'+
                        '</div>',
      //uniqueHistory: true,
      cache: false,
      cacheDuration: 1000*60*5,
      cacheIgnore: ['home.html'],
      animatePages: false,
      //notificationHold: 1750,
      init: false,
      material: true,
      swipePanelOnlyClose: true,
      sortable: false,
      smartSelectOpenIn:'popup',
      preloadPreviousPage: true,
      template7Pages: true,
      precompileTemplates: true,
      imagesLazyLoadSequential: true,
      hideNavbarOnPageScroll: false,
      hideToolbarOnPageScroll: false,
      notificationCloseOnClick: true,
      fastClicks:true,
      fastClicksDelayBetweenClicks: 500,
      tapHold:true,
      tapHoldDelay: 1000,
      tapHoldPreventClicks: true,
      /*preroute: function (view, options) {
          if (!navigator.onLine) {
            app.addNotification({
              message: "There was a problem connecting to the Internet.  Please check your connection",
            });
            return false;
          }
        },*/
      /*onAjaxStart: function (view, options) {
          if (!navigator.onLine) {
            app.addNotification({
              message: language.ERRORS.NO_INTERNET,
            });
            return false;
          }
        },*/
      onPageInit: function(app, page) {
        //$$.each($$(document).find('.cache-image'), function(key, item) {
        //  console.log(item);
        //  if (item.attr('src') != "") {
          if (ImgCache.ready) {
            $$(page.container).find('.cache-image').each(function() {
              var imageElement = this;
              ImgCache.isBackgroundCached( imageElement , function(path, success) {
                if (success) {
                  // already cached
                  //var backgroundImageProperty = imageElement.css('background-image');
                //  if (backgroundImageProperty !== "none") {
                  //    ImgCache.useCachedBackground(imageElement);
                  //}
                  ImgCache.useCachedBackground(imageElement);
                } else {
                  // not there, need to cache the image
                  ImgCache.cacheBackground(imageElement, function () {
                    //var backgroundImageProperty = imageElement.css('background-image');
                    //if (backgroundImageProperty !== "none") {
                        ImgCache.useCachedBackground(imageElement);
                    //}
                  });
                }
              });
            });
          }
          //}
        //});
      }
});





var eventPartial =  '<div class="card event-details">' +

                    '  <div class="header">'+
                      '<div style="background-image:url(\'{{@global.config.server}}/thumbnails/events/{{id}}/landscape.png\')" valign="bottom" class="lazy card-header color-white no-border cache-image"></div>'+
                //  '  <img src="{{@global.config.server}}/thumbnails/events/{{id}}/landscape.png" valign="bottom" class="lazy color-white no-border"/>'+
                    '</div>'+
                    '<div class="card-content">'+
                    '  <div class="card-content-inner">'+
                    '   <div class="event-name">{{name}}</div>'+
                  //  '   <div class="color-gray hosted-by"><span class="small">by</span>&#58;&nbsp;{{#js_compare "this.hostedby == 0"}}'+
                  //    '{{user.name2}}&nbsp;{{user.name4}}'+
                //  '  {{else}}'+
                //        '{{#js_compare "this.hostedby == 1"}}'+
                //        '{{user.organization.name}}'+
                //        '{{else}}'+
                  //      '  {{hostedby}}'+
                //        '{{/js_compare}}'+
                //    '{{/js_compare}}</div>'+
                    '    <span class="color-black">{{englishtime starttime}}</span><br>'+
                    '    <span class="color-gray">{{venue}}</span>'+
                    '  </div>'+
                    '</div>'+
                  '</div>';

var homeNavBarPartial =  ' <div class="toolbar toolbar-bottom">'+
                          '  <div class="toolbar-inner">'+
                            '  <a href="#" class="link icon-only"><i class="icon icon-home active"></i></a>'+
                              '<a href="#" class="link switch-events icon-only"><i class="icon icon-events"></i></a>'+
                              '<a href="#" class="link switch-tickets icon-only"><i class="icon icon-tickets"></i></a>'+
                              '<a href="#" class="link switch-profile icon-only"><i class="icon icon-profile"></i></a>'+
                              '<a href="#" class="link chatrooms switch-chats icon-only"><i class="icon icon-chats">{{#if @global.config.chats}}<span class="badge bg-green">{{@global.config.chats}}</span>{{/if}}</i></a>'+
                            '</div>'+
                        '  </div>';

var eventsNavBarPartial =  ' <div class="toolbar toolbar-bottom">'+
                          '  <div class="toolbar-inner">'+
                            '  <a href="#" class="link switch-home icon-only"><i class="icon icon-home "></i></a>'+
                              '<a href="#" class="link icon-only"><i class="icon icon-events active"></i></a>'+
                              '<a href="#" class="link switch-tickets icon-only"><i class="icon icon-tickets"></i></a>'+
                              '<a href="#" class="link switch-profile icon-only"><i class="icon icon-profile"></i></a>'+
                              '<a href="#" class="link chatrooms switch-chats icon-only icon-only"><i class="icon icon-chats">{{#if @global.config.chats}}<span class="badge bg-green">{{@global.config.chats}}</span>{{/if}}</i></a>'+
                            '</div>'+
                        '  </div>';

var ticketsNavBarPartial =  ' <div class="toolbar toolbar-bottom">'+
                            '  <div class="toolbar-inner">'+
                              '  <a href="#" class="link switch-home icon-only"><i class="icon icon-home "></i></a>'+
                                '<a href="#" class="link switch-events icon-only"><i class="icon icon-events"></i></a>'+
                                '<a href="#" class="link icon-only"><i class="icon icon-tickets active"></i></a>'+
                                '<a href="#" class="link switch-profile icon-only"><i class="icon icon-profile"></i></a>'+
                                '<a href="#" class="link chatrooms switch-chats icon-only"><i class="icon icon-chats">{{#if @global.config.chats}}<span class="badge bg-green">{{@global.config.chats}}</span>{{/if}}</i></a>'+
                              '</div>'+
                          '  </div>';

var profileNavBarPartial =  ' <div class="toolbar toolbar-bottom">'+
                            '  <div class="toolbar-inner">'+
                              '  <a href="#" class="link switch-home icon-only"><i class="icon icon-home "></i></a>'+
                                '<a href="#" class="link switch-events icon-only"><i class="icon icon-events "></i></a>'+
                                '<a href="#" class="link switch-tickets icon-only"><i class="icon icon-tickets "></i></a>'+
                                '<a href="#" class="link icon-only"><i class="icon icon-profile active"></i></a>'+
                                '<a href="#" class="link chatrooms switch-chats icon-only"><i class="icon icon-chats">{{#if @global.config.chats}}<span class="badge bg-green">{{@global.config.chats}}</span>{{/if}}</i></a>'+
                              '</div>'+
                          '  </div>';

var chatsNavBarPartial =  ' <div class="toolbar toolbar-bottom">'+
                            '  <div class="toolbar-inner">'+
                              '  <a href="#" class="link switch-home icon-only"><i class="icon icon-home "></i></a>'+
                                '<a href="#" class="link switch-events icon-only"><i class="icon icon-events "></i></a>'+
                                '<a href="#" class="link switch-tickets icon-only"><i class="icon icon-tickets "></i></a>'+
                                '<a href="#" class="link switch-profile icon-only"><i class="icon icon-profile"></i></a>'+
                                '<a href="#" class="link chatrooms icon-only"><i class="icon icon-chats active">{{#if @global.config.chats}}<span class="badge bg-green">{{@global.config.chats}}</span>{{/if}}</i></a>'+
                              '</div>'+
                          '  </div>';

Template7.registerPartial('homeNavBarPartial', homeNavBarPartial);
Template7.registerPartial('eventsNavBarPartial', eventsNavBarPartial);
Template7.registerPartial('ticketsNavBarPartial', ticketsNavBarPartial);
Template7.registerPartial('profileNavBarPartial', profileNavBarPartial);
Template7.registerPartial('chatsNavBarPartial', chatsNavBarPartial);
Template7.registerPartial('eventPartial', eventPartial);
Template7.registerHelper('birthdate', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  var birthdate = moment(new Date()).subtract(18, 'years').format('YYYY-MM-DD');
  return birthdate;
});
Template7.registerHelper('count', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  return arr.length;
});
Template7.registerHelper('favorite', function (arr, user, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  var fav = null;
  if (user && user.id) {
    fav = _.find(arr, function(item) { return item.id===user.id; });
  }
  if (fav) {
    return '<span class="favorite-count">'+arr.length+'</span>&nbsp;<i class="icon icon-favorites active"></i>';
  } else {
    return '<span class="favorite-count">'+arr.length+'</span>&nbsp;<i class="icon icon-favorites"></i>';
  }
});
Template7.registerHelper('calender', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);

  return '<i class="icon icon-calender"></i>';
});
Template7.registerHelper('messageTime', function(arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  return moment.utc(arr).utcOffset(utcOffset).format('h:mm a');
});
Template7.registerHelper('englishtime', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  //moment().utcOffset(-7);
  //var serverTime = moment.utc(arr).utcOffset(-3).format('ddd MMM Do YYYY, h:mm A')
  return moment.utc(arr).utcOffset(storage.getItem('servertimezone')).format('ddd MMM Do YYYY, h:mm A');
});
Template7.registerHelper('nocache', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  return '?'+moment().unix();
});
Template7.registerHelper('sellerChat', function (sellerId, userId, name2, name4) {
  var ret = '<a href="#" class="link message-seller" user-id="'+sellerId+'" user-name="'+ name2 +'&nbsp;'+ name4+'"><i class="icon icon-chats-orange"></i></a>';
  if (sellerId != userId)
    return ret;
  else
    return '';
});

Template7.global = {
  config: config,
  user: user,
};

app.init();

$$(document).on('ajax:start', function (e) {
  if (!navigator.onLine) {
    app.addNotification({
      message: language.ERRORS.NO_INTERNET,
      hold: 2000,
    });
    //return false;
  }
});

document.addEventListener('deviceready', onDeviceReady, false);


function onDeviceReady() {
  navigator.globalization.getPreferredLanguage(getLanguageSuccess, getLanguageError);
  navigator.globalization.getDatePattern(getDatePatternSuccess, getDatePatternFail, {formatLength:'full', selector:'date and time'});
  camera = navigator.camera;

  geolocation = navigator.geolocation;
  connection= navigator.connection;

  window.open = cordova.InAppBrowser.open;
  document.addEventListener("pause", onPauseApp, false);
  document.addEventListener("resume", onResumeApp, false);
  document.addEventListener('backbutton', onBackKey, false);
  document.addEventListener("online", onOnline, false);
  document.addEventListener("offline", onOnline, false);
  StatusBar.backgroundColorByHexString("#3f51b5");
  StatusBar.styleBlackTranslucent();
  initializePushMessaging();

  ImgCache.options.debug = false;
  ImgCache.options.chromeQuota = 50*1024*1024;
  ImgCache.options.cordovaFilesystemRoot = cordova.file.cacheDirectory;
  ImgCache.options.headers = { 'Connection': 'close' };
  ImgCache.options.withCredentials = true;
  ImgCache.init(function () {
    console.log('ImgCache init: success!');
  }, function () {
      console.log('ImgCache init: error! Check the log for errors');
  });
  db = window.sqlitePlugin.openDatabase({name: 'suntixx.db', location: 'default',  androidLockWorkaround: 1}, onDatabaseCreate, onDatabaseCreateError);
  init();
  navigator.splashscreen.hide();

  /*AppRate.preferences = {
    useCustomRateDialog: true,
    openStoreInApp: true,
    displayAppName: config.appName,
    usesUntilPrompt: 1,
    promptAgainForEachNewVersion: true,
    storeAppURL: {
      ios: config.mobileAppLinks.iosAppId,
      android: config.mobileAppLinks.android
    },
    customLocale: {
      title: "Rate %@",
      message: "If you enjoy using %@, would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!",
      cancelButtonLabel: "No, Thanks",
      laterButtonLabel: "Remind Me Later",
      rateButtonLabel: "Rate It Now"
    },
    callbacks: {
      onButtonClicked: function(buttonIndex){
        console.log("onButtonClicked -> " + buttonIndex);
      }
    }
  };

  AppRate.promptForRating();*/


  var appUsage = storage.getItem('appusage');
  var appRateInterval = storage.getItem('rateinterval');
  if (!appUsage) { appUsage = 0; }
  if (!appRateInterval) {appRateInterval = 10;}

  if (appRateInterval > 0 && appUsage >= appRateInterval) {
    appUsage = 0;
    promptForRating();
  } else {
    appUsage++;
  }
  storage.setItem('appusage', appUsage);
  //document.addEventListener('online', , false);
}

var init = function(background) {
  if (navigator.onLine && user && user.id) {
    eventsService.downloadEvents(background);
    //eventsService.downloadFavorites();
    ticketsService.downloadTickets(background);
    chatService.downloadMessages();
  } else if (user && user.id && !background) {
    eventsView.router.load({
        url: 'views/events/myevents.html?local=1',
        context: allUserEvents
    });
    ticketsView.router.load({
        url: 'views/tickets/purchases.html?local=1',
        context: allUserTickets
    });
  }
};


var getServerTime = function() {
  $$.ajax({
    async: true,
    cache: false,
    url: config.server + "/api/servertime",
    method: "GET",
    timeout: 20 * 1000,
    success: function(data, status, xhr) {
      if (status == 200) {
        storage.setItem('servertimezone', JSON.parse(data).timezone);
      }
    },
    error: function (xhr, status){
      //do nothing
    },
  });
};
//getServerTime();

var getDatePatternSuccess = function (date) {
  utcOffset = date.utc_offset;
  utcOffset = utcOffset / 3600; //3600 seconds per hour
  //getServerTime();
  //console.log(JSON.stringify(date));
};

var getDatePatternFail = function(err) {
  //do nothing
  console.log(JSON.stringify(err));
};

var onResumeApp = function() {
  appActive = true;
  checkLogin(function() {
    init(true);
  });
};

var onPauseApp = function () {
  appActive = false;
  //initializePushMessaging();
};

updateOnlineScan = function(onlineScan) {
  config.settings.onlineScan = onlineScan;
  if (onlineScan) {
    $$('.icon-internet').addClass('active');
  } else {
    $$('.icon-internet').removeClass('active');
  }
  $$('.online-scan').prop('checked', config.settings.onlineScan);
  storage.setItem('settings', JSON.stringify(config.settings));
}

var onOnline = function () {
  updateOnlineScan(true);
};

var onOffline = function() {
  updateOnlineScan(false);
}

var getLanguageSuccess = function(lang) {
  if(lang.value == "en-US"  || lang.value == "en-UK" || lang.value =="en" || lang.value == "UK" || lang.value == "US") {
    $$.getJSON('lang/en.json', function(data, status, xhr) {
      language = data;
      Template7.global.language = language;
      loadInitialLanguageVariables();
    });
  }
};

var loadInitialLanguageVariables = function () {
  refreshButton = '<div style="width:80vw;text-align:center;margin:40vh auto 0 auto; font-size:18px">'+
                      '<p>'+language.HOMEPAGE.FEED_ERROR+'</p>' +
                      '</div>';
}

$$.getJSON('lang/en.json', function(data) {
  language = data;
  Template7.global.language = language;
  loadInitialLanguageVariables();
});

var getLanguageError = function (err) {
  console.log(JSON.stringify(err));
  $$.getJSON('lang/en.json', function(data, status, xhr) {
    language = data;
    Template7.global.language = language;
    loadInitialLanguageVariables();
  });
};

var onDatabaseCreate = function () {
  db.sqlBatch([
  'DROP TABLE IF EXISTS scanhistory',
  //'DROP TABLE IF EXISTS localscan',
  //'DROP TABLE IF EXISTS chatrooms',
  //'DROP TABLE IF EXISTS messages',
  'CREATE TABLE scanhistory ('+
    'code text,'+
    'scandate text,'+
    'created_on timestamp DEFAULT CURRENT_TIMESTAMP,'+
    'scanresponse text,'+
    'scancolor text,'+
    'valid boolean' +
  ')',
  'CREATE TABLE IF NOT EXISTS chatrooms ('+
    'roomid text PRIMARY KEY,'+
    'isevent boolean DEFAULT 0,'+
    'receiver_name text,'+
    'created_on timestamp DEFAULT CURRENT_TIMESTAMP,'+
    'modified_on timestamp DEFAULT CURRENT_TIMESTAMP'+
  ')',
  'CREATE TABLE IF NOT EXISTS messages ('+
    'message_id text PRIMARY KEY,'+
    'roomid text,'+
    'isevent boolean DEFAULT 0,'+
    /*'message text,'+
    'sender_id text,'+
    'sender_name text,'+
    'receiver_id text'+
    'receiver_name text,'+
    'isdelivered boolean DEFAULT 0,'+*/
    'isread boolean DEFAULT 0,'+
    'isdelivered boolean DEFAULT 0,'+
    'messageJSON text,'+
    'isreceived boolean DEFAULT 0,'+
    'created_on timestamp DEFAULT CURRENT_TIMESTAMP'+
  ')',
  'CREATE TABLE IF NOT EXISTS localscan ('+
    'id text PRIMARY KEY,'+
    'event_id text,'+
    'code text,'+
    'tickettypeid text,'+
    'nameonticket text, '+
    'scandate timestamp DEFAULT NULL,'+
    'purchasedate timestamp DEFAULT NULL,'+
    'scancount text DEFAULT 0,'+
    'verified boolean DEFAULT 0'+
  ')',
  /*'CREATE TABLE IF NOT EXISTS events ('+
    'id text PRIMARY KEY,'+
    'name text,'+
    'hostedby text,'+
    'starttime text,'+
    'venue text,'+
    'city text,'+
    'country text,'+
    'currency text'+
  ')',
  'CREATE TABLE IF NOT EXISTS tickets ('+
    'id text PRIMARY KEY,'+
    'ticketno text,'+
    'code text,'+
    'nameonticket text,'+
    'tickettype text,'+
    'price text'+
  ')'*/
  ], function() {
    console.log("Configuration tables created");
    //init();
    chatService.getChats();

  }, function(error) {
    //console.log(error);
    app.alert(language.SYSTEM.DATABASE_CONFIGURATION_ERROR);
    db = null;
  });
};

var onDatabaseCreateError = function (err) {
  console.log(err);
  app.alert(language.SYSTEM.FATAL_CONFIGURATION_ERROR);
  db = null;
};


var promptForRating = function() {
  app.modal({
    title:  'Rate Sun Tixx',
    text: "If you enjoy using Sun Tixx would you mind taking a moment to rate it? It won’t take more than a minute. Thanks for your support!",
    verticalButtons: true,
    buttons: [
      {
        text: 'Rate It Now',
        onClick: function() {
          app.closeModal();
          storage.setItem('rateinterval', -1);
          var options = "";
          var target = "_system";
          var url;
          if (device.platform.toLowerCase() == "ios") {
              url = config.mobileAppLinks.ios;
          } else if (device.platform.toLowerCase() == "android") {
              url = config.mobileAppLinks.android;
          }
          window.open(url, target, options);
        }
      },
      {
        text: 'Remind Me Later',
        onClick: function() {
          app.closeModal();
          storage.setItem('rateinterval', 15);
        }
      },
      {
        text: 'No Thanks',
        onClick: function() {
          storage.setItem('rateinterval', 20);
          app.closeModal();
        }
      },
    ]
  });
}



var mainView = app.addView('.view-main', {
  domCache: false
});
var eventsView = app.addView('.view-events', {
  domCache: true
});
var ticketsView = app.addView('.view-tickets', {
  domCache: false,
});
var profileView = app.addView('.view-profile', {
  domCache: true
});

var storeView = app.addView(".view-store", {
  domCache: false,
  allowDuplicateUrls: true,
  uniqueHistory: true
});

var chatsView = app.addView('.view-chats', {
  domCache: false,
});


function onBackKey() {
  var thisView = app.getCurrentView();
  var backButton = $$(thisView.activePage.container).find('.navbar .navbar-inner .left .back-button');
  //console.log(backButton.length);
  switch (backButton.length) {
    case 1:
      $$(thisView.activePage.container).find('.navbar .navbar-inner .left .back-button').click();
    break;

    case 0:
      if (loginScreenOpened) {
        app.closeModal('.login-screen');
      } else {
        navigator.app.exitApp();
      }
    break;
  }
}
