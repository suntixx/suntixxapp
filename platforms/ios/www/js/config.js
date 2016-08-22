var app;
var $$ = Dom7;
var storage = window.localStorage;
var user = JSON.parse(storage.getItem('userData'));
if (user) {
  user.password = storage.getItem('userPassword');
}
var selectedEventLocal;
var allUserEvents;
var camera;
var geolocation;
var connection;
var fileTransfer;
var fileSystem;
var db;
var language;
var socket;
var push;
var config;
var storeView = null;
var autoScan = storage.getItem('autoscan');
if (!autoScan) {
  storage.setItem('autoscan', false);
}

$$.ajax ({
  method: "GET",
  async: false,
  url: "config/config.json",
  success: function(data, status, xhr) {
    config = JSON.parse(data);
    config.settings.autoScan = autoScan;
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
                          '{{#if title}}'+
                            '<div class="modal-title"><i class="icon icon-suntixx"></i></div>'+
                          '{{/if}}'+
                          '{{#if text}}'+
                            '<div class="modal-text">{{text}}</div>'+
                          '{{/if}}'+
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
      //cache: true,
      //cacheDuration: 1000*60*5,
      //cacheIgnore: ['home.html'],
      notificationHold: 1750,
      init: false,
      material: true,
      swipePanelOnlyClose: true,
      sortable: false,
      smartSelectOpenIn:'popup',
      preloadPreviousPage: false,
      template7Pages: true,
      precompileTemplates: true,
      imagesLazyLoadSequential: true,
      hideNavbarOnPageScroll: true,
      hideToolbarOnPageScroll: true,
      notificationCloseOnClick: true,
      fastClicksDelayBetweenClicks: 500,
      preroute: function (view, options) {
          if (!navigator.onLine) {
            app.addNotification({
              message: "There was a problem connecting to the Internet.  Please check your connection",
            });
            return false;
          }
        },
      onAjaxStart: function (view, options) {
          if (!navigator.onLine) {
            app.addNotification({
              message: "There was a problem connecting to the Internet.  Please check your connection",
            });
            return false;
          }
        },
});



var eventPartial =  '<div class="card event-details">' +

                    '  <div class="header">'+
                      '<div style="background-image:url(\'{{@global.config.server}}/thumbnails/events/{{id}}/landscape.png\')" valign="bottom" class="lazy card-header color-white no-border"><div class="category">{{category.name}}</div></div>'+
                //  '  <img src="{{@global.config.server}}/thumbnails/events/{{id}}/landscape.png" valign="bottom" class="lazy color-white no-border"/>'+
                    '</div>'+
                    '<div class="card-content">'+
                    '  <div class="card-content-inner">'+
                    '   <div class="event-name">{{name}}</div>'+
                    '   <div class="color-gray hosted-by"><span class="small">by</span>&nbsp;{{#js_compare "this.hostedby == 0"}}'+
                      '{{user.fullname}}'+
                  '  {{else}}'+
                        '{{#js_compare "this.hostedby == 1"}}'+
                        '{{user.organization.name}}'+
                        '{{else}}'+
                        '  {{hostedby}}'+
                        '{{/js_compare}}'+
                    '{{/js_compare}}</div>'+
                    '    <span class="color-black">{{englishtime starttime}}</span><br>'+
                    '    <span class="color-gray">{{venue}}</span>'+
                    '  </div>'+
                    '</div>'+
                  '</div>';

Template7.registerPartial('eventPartial', eventPartial);
Template7.registerHelper('count', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  return arr.length;
});
Template7.registerHelper('englishtime', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  //moment().utcOffset(-7);
  //var serverTime = moment.utc(arr).utcOffset(-3).format('ddd MMM Do YYYY, h:mm A')
  return moment.utc(arr).utcOffset(-7).format('ddd MMM Do YYYY, h:mm A');
});
Template7.registerHelper('nocache', function (arr, options) {
  if (typeof arr === 'function') arr = arr.call(this);
  return '?'+moment().unix();
});

Template7.global = {
  config: config,
  user: user,
};

app.init();

$$('.app-version').html("Sun Tixx v"+config.version);
document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('backbutton', onBackKey, false);

function onDeviceReady() {
  camera = navigator.camera;
  navigator.splashscreen.hide();
  geolocation = navigator.geolocation;
  window.open = cordova.InAppBrowser.open;
  connection= navigator.connection;
  db = window.sqlitePlugin.openDatabase({name: 'suntixx.db', location: 'default',  androidLockWorkaround: 1}, onDatabaseCreate, onDatabaseCreateError);
  navigator.globalization.getPreferredLanguage(getLanguageSuccess, getLanguageError);
  push = PushNotification.init({
    android: {
        senderID: "326258679945"
    },
    browser: {
        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
    },
    ios: {
        alert: "true",
        badge: true,
        sound: 'false'
    },
  });
}

var getLanguageSuccess = function(lang) {
  if(lang.value == "en-US"  || lang.value == "en-UK" || lang.value =="en" || lang.value == "UK" || lang.value == "US") {
    $$.getJSON('lang/en.json', function(data, status, xhr) {
      language = data;
      Template7.global.language = language;
    });
  }
};

$$.getJSON('lang/en.json', function(data) {
  language = data;
  Template7.global.language = language;
});

var getLanguageError = function () {
  $$.getJSON('lang/en.json', function(data, status, xhr) {
    language = data;
    Template7.global.language = language;
  });
};

var onDatabaseCreate = function () {
  db.sqlBatch([
  'DROP TABLE IF EXISTS scanhistory',
  'CREATE TABLE scanhistory ('+
    //'id integer PRIMARY KEY AUTOINCREMENT NOT NULL,'+
    'code text,'+
    'scandate text,'+
    'created_on timestamp DEFAULT CURRENT_TIMESTAMP,'+
    'scanresponse text,'+
    'scancolor text,'+
    'valid boolean' +
    ')',
  ], function() {
    console.log("Configuration tables created");
  }, function(error) {
    //console.log(error);
    app.alert(language.SYSTEM.DATABASE_CONFIGURATION_ERROR);
    db = null;
  });

  /*db.sqlBatch([
  'CREATE TABLE IF NOT EXISTS user ('+
    'id int NOT NULL PRIMARY KEY AUTO_INCREMENT,'+
    'serverId varchar(255) NOT NULL UNIQUE,'+
    'created_on datetime,'+
    'modified_on datetime,'+
    'data varchar(5000), )',
  ], function() {
    console.log("User table created");
  }, function(error) {
    app.alert(config.language.SYSTEM.FATAL_CONFIGURATION_ERROR);
    db = null;
  });*/
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
          storage.setItem('rateinterval', 20);
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
          storage.setItem('rateinterval', 5);
        }
      },
      {
        text: 'No Thanks',
        onClick: function() {
          app.closeModal();
        }
      },
    ]
  });
}

var checkInternet = function() {
  if (!navigator.onLine) {
    app.addNotification({
      message: "There was a problem connecting to the Internet.  Please check your connection",
    });
    return false;
  }
}

var appUsage = storage.getItem('appusage');
var appRateInterval = storage.getItem('rateinterval');
if (!appUsage) { appUsage = 0; }
if (!appRateInterval) {appRateInterval = 1;}

if (appUsage >= appRateInterval) {
  appUsage = 0;
  promptForRating;
} else {
  appUsage++;
}
storage.setItem('appusage', appUsage);

var mainView = app.addView('.view-main', {
  //domCache: true,
});

function onBackKey() {
  if ( $$(document).find('.back-button').length > 0 ) {
    $$('.back-button').click();
  } else if ( mainView.activePage.name == "homepage") {
    navigator.app.exitApp();
  } else {
    window.history.back(-1);
  }
}
