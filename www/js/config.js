var app;

storage = window.localStorage;
var autoScan = storage.getItem('autoscan');
if (!autoScan) {
  storage.setItem('autoscan', false);
}

var config = {
  server: "https://www.suntixx.com",
  version: "1.1.6",
  Developer: "Jason Cox",
  appName: "Sun Tixx",
  secret: "SunT1xxPhon#AppAPISecret",
  owner: "Sun Tixx Caribbean",
  settings: {
    autoScan :storage.getItem('autoscan'),
  },
  paypalIds: {
      "PayPalEnvironmentProduction": "AcrD2hBfccAOZ5yjNum7YtVjhGSEd-G3fExIUHy-1_EpFYwARcG8SGkK5U0N",
      "PayPalEnvironmentSandbox" :"AfbXNxAP7tf-teLj2t8S4gP2eVyTAznqr2tIRC-u79hS6KLjB7cYtOzGML-0"
  },
};
moment().format();

var user = null;
var selectedEventLocal;
var allUserEvents;
var storage;
var storedUser;
var camera;
var geolocation;
var connection;
var fileTransfer;
var fileSystem;
var db;
var immersiveMode;


config.settings.autoScan = autoScan;


user = {
  id: storage.getItem('userId'),
  email: storage.getItem('userEmail'),
  password: storage.getItem('userPassword'),
};



// Initialize your app
app = new Framework7({
      //cache: true,
      modalTitle: config.appName,
      modalTemplate: '<div class="modal {{#unless buttons}}modal-no-buttons{{/unless}}">'+
                        '<div class="modal-inner">'+
                          '{{#if title}}'+
                            '<div class="modal-title">{{title}}</div>'+
                          '{{/if}}'+
                          '{{#if text}}'+
                            '<div class="modal-text">{{text}}</div>'+
                          '{{/if}}'+
                          '{{#if afterText}}'+
                            '{{afterText}}'+
                          '{{/if}}'+
                        '</div>'+
                        '{{#if buttons}}'+
                          '<div class="modal-buttons">'+
                            '{{#each buttons}}'+
                              '<span class="modal-button {{#if bold}}modal-button-bold{{/if}}">{{text}}</span>'+
                            '{{/each}}'+
                          '</div>'+
                        '{{/if}}'+
                        '</div>',
      uniqueHistory: true,
      notificationHold: 1750,
      init: false,
      material: true,
      swipePanelOnlyClose: true,
      sortable: false,
      smartSelectOpenIn:'popup',
      preloadPreviousPage: true,
      template7Pages: true,
      precompileTemplates: true,
      imagesLazyLoadSequential: true,
      hideNavbarOnPageScroll: true,
      hideToolbarOnPageScroll: true,
      notificationCloseOnClick: true,
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

var $$ = Dom7;

var eventPartial =  '<div class="card event-details">' +

                    '  <div class="header">'+
                      '<div style="background-image:url(\'{{@global.config.server}}/thumbnails/events/{{id}}/landscape.png\')" valign="bottom" class="lazy card-header color-white no-border"><div class="category">{{category.name}}</div></div>'+
                //  '  <img src="{{@global.config.server}}/thumbnails/events/{{id}}/landscape.png" valign="bottom" class="lazy color-white no-border"/>'+
                    '</div>'+
                    '<div class="card-content">'+
                    '  <div class="card-content-inner">'+
                    '   <div class="event-name">{{name}}</div>'+
                    '   <div class="color-gray hosted-by"><span class="small">by</span>&nbsp;{{#if user.organization}}{{user.organization.name}}{{else}}{{hostedby}}{{/if}}</div>'+
                    '    <span class="color-black">{{EnglishTime}}</span><br>'+
                    '    <span class="color-gray">{{venue}}</span>'+
                    '  </div>'+
                    '</div>'+
                  '</div>';

Template7.registerPartial('eventPartial', eventPartial);

Template7.global = {
  config: config,
  user: user,
};

app.init();

document.addEventListener('deviceready', onDeviceReady, false);
document.addEventListener('backbutton', onBackKey, false);

function onDeviceReady() {
  camera = navigator.camera;
  navigator.splashscreen.hide();
  geolocation = navigator.geolocation;
  window.open = cordova.InAppBrowser.open;
  connection= navigator.connection;
  db = window.sqlitePlugin.openDatabase({name: 'suntixx.db', location: 'default',  androidLockWorkaround: 1}, onDatabaseCreate, onDatabaseCreateError);
}



var onDatabaseCreate = function () {
  db.sqlBatch([
  'DROP TABLE IF EXISTS scanhistory',
  'CREATE TABLE scanhistory ('+
    'code varchar(255),'+
    'scandate datetime,'+
    'scanresponse varchar(255),'+
    'scancolor varchar(255),'+
    'valid boolean )',
  ], function() {
    //alert("Scan history table created");
  }, function(error) {
    app.alert("There was a problem configuring the application database. You won't have access to scanning history");
    db = null;
  });
};

var onDatabaseCreateError = function (err) {
  app.alert("There was a problem configuring the application database. You won't have access to scanning history");
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
              url = 'itms-apps://itunes.apple.com/app/id1128174731';
          } else if (device.platform.toLowerCase() == "android") {
              url = 'market://details?id=com.suntixx.application';
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
if (!appRateInterval) {appRateInterval = 20;}

if (appUsage == appRateInterval) {
  appUsage = 0;
  promptForRating;
} else {
  appUsage++;
}
storage.setItem('appusage', appUsage);

function onBackKey() {
  if ( $$(document).find('.back-button').length > 0 ) {
    $$('.back-button').click();
  } else if ( $$('.page').attr('data-page') == "homepage") {
    navigator.app.exitApp();
  } else {
    window.history.back(-1);
  }
}

var mainView = app.addView('.view-main', {
  domCache: true,
});
