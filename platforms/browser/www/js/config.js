var app;
var config = {
  server: "https://dev.suntixx.com",
  version: "1.0.0",
  Developer: "Jason Cox",
  appName: "Sun Tixx",
  secret: "SunT1xxPhon#AppAPISecret",
};
moment().format();


//localStorage.clear();
var user = null;
var selectedEventLocal;
var allEvents;
var storage;
var storedUser;
var camera;
var connection;
var fileTransfer;
var fileSystem;
//var cropper;


//storage = window.localStorage;
//storage.setItem('userId', 1);
//storage.setItem('userEmail', 'admin@suntixx.com');
//storage.setItem('userPassword', '123123');

//storedUser = {
//  id: storage.getItem('userId'),
//  email: storage.getItem('userEmail'),
//  password: storage.getItem('userPassword'),
//  session : ''
//};

/*user = {
  id: 1,
  email: 'admin@suntixx.com',
  password: '123123'
};*/

// Initialize your app
app = new Framework7({
      //cache: true,
      modalTitle: 'Sun Tixx',
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
  window.open = cordova.InAppBrowser.open;
  fileSystem = cordova.file;
  //fileTransfer = FileTransfer;
  //connection= navigator.connection;
//  navigator.camera.getPicture(onCameraSuccess, onCameraFail, { quality: 50,
    //  destinationType: Camera.DestinationType.FILE_URI });
      navigator.splashscreen.show();
    setTimeout( function() {
      navigator.splashscreen.hide();
    }, 3000);
    //alert(JSON.stringify(camera));

}


function onBackKey() {
  if ($$('.back')) {
    $$('.back').click();
  } else if ($$('.back-button')){
      $$('.back-button').click();
  }

}
//alert(JSON.stringify(camera));



//alert(JSON.stringify(navigator));
