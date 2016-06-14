var app;

storage = window.localStorage;
var autoScan = storage.getItem('autoscan');
if (!autoScan) {
  storage.setItem('autoscan', false);
}
var config = {
  server: "https://www.suntixx.com",
  version: "1.0.0",
  Developer: "Jason Cox",
  appName: "Sun Tixx",
  secret: "SunT1xxPhon#AppAPISecret",
  owner: "Sun Tixx Caribbean",
  settings: {
    autoScan :storage.getItem('autoscan'),
  },
  paypalIds: {
      "PayPalEnvironmentProduction": "APP-6NU67772PM858250S",
      "PayPalEnvironmentSandbox" :"AfbXNxAP7tf-teLj2t8S4gP2eVyTAznqr2tIRC-u79hS6KLjB7cYtOzGML-0"
  },
};
moment().format();


//localStorage.clear();
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
//var cropper;





config.settings.autoScan = autoScan;

//storage.setItem('userId', 1);
//storage.setItem('userEmail', 'admin@suntixx.com');
//storage.setItem('userPassword', '123123');

user = {
  id: storage.getItem('userId'),
  email: storage.getItem('userEmail'),
  password: storage.getItem('userPassword'),
};


/*user = {
  id: 1,
  email: 'admin@suntixx.com',
  password: '123123'
};*/

// Initialize your app
app = new Framework7({
      //cache: true,
      modalTitle: config.appName,
      uniqueHistory: true,
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
    //  template7Data: {
       // This context will applied for page/template with "about.html" URL
       //'url:event.html': {},
       //'EditTicket': {},
    // }
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
  //if (connection.type === Connection.NONE) {
  //xhr.abort();
  //  app.alert("Unable to Find an Internet Connection");
  //}
  document.addEventListener("offline", function() {
    app.alert("No Internet Connection Detected");
  }, false);

}

function onBackKey() {
  if ( $$(document).find('.back').length > 0 ){
    $$('.back').click();
  } else {
    $$('.back-button').click();
  }
}

var mainView = app.addView('.view-main', {
  domCache: true,
});
mainView.router.loadPage('home.html');
