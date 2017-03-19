 function formatEventData (serverEvent, condition) {
  var data = {};
  //alert("here");
  var start = new Date(serverEvent.starttime);
  var end = new Date(serverEvent.endtime);
  data.starttime = moment.utc(start).format("HH:mm");
  data.startdate = moment(start).format("YYYY-MM-DD");
  data.endtime = moment.utc(end).format("HH:mm");
  data.enddate = moment(end).format("YYYY-MM-DD");
  data.category_id = serverEvent.category_id;
  data.restrictions_id = serverEvent.restrictions_id;
  data.dresscode_id = serverEvent.dresscode_id;
  data.status_id = serverEvent.status_id;
  data.hostedby = serverEvent.hostedby;
  data.recommend = serverEvent.recommend;
  data.featured = serverEvent.featured;
  data.name = serverEvent.name;
  data.headline = serverEvent.headline;
  data.description = serverEvent.description;
  data.currency = serverEvent.currency;
  data.facebook = serverEvent.facebook;
  data.twitter = serverEvent.twitter;
  data.imagePath = "/thumbnails/events/" + serverEvent.id + "/portrait.png";
  data.imageLandscapePath = "/thumbnails/events/" + serverEvent.id + "/landscape.png";
  //data.imagePath = "foo";
  //data.imageLandscapePath = "foo";
  //alert(JSON.stringify(data));
  if (condition == 1) {
    data.venue = serverEvent.venue;
    data.city = serverEvent.city;
    data.country = serverEvent.country;
    data.maplink = serverEvent.maplink;
    data.venuetype_id = serverEvent.venuetype_id;
  }
  return data;
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function validateStartTime(dateString) {
    var todayString = new Date().toString();
    //var tz = todayString.indexOf("GMT");
    //var timezone = todayString.slice(tz+3, tz+8);
    //console.log(todayString);
    //console.log(timezone);
    var today = moment.utc(todayString.slice(0,23));
    //console.log(today);

    var startDate = moment(new Date(dateString));
    //console.log(startDate);
    //console.log(startDate.diff(today));
    return startDate.diff(today) > 0;
}

function validateEndTime(dateString) {
    var startdate = moment.utc(new Date( $$('#start').val() ));
    console.log(startdate);
    var endDate = moment.utc(new Date(dateString));
    console.log(endDate);
    console.log(endDate.diff(startdate));
    return endDate.diff(startdate) > 0;
}

function validateNumber(number) {
  return !isNaN(parseFloat(number)) && isFinite(number);
}

var eventsService = {

  canScan: function (event) {
    var now = new Date();

    if (moment.utc(now).add('h', 6).toDate() > moment.utc(event.starttime).toDate()) {
      return false;
    }
    return true;
  },

  getEventLocation: function(url) {
    if (url == "") return null;
    var data = $$.parseUrlQuery(url);
    var result = {};
    if (data.ll) {
      var tmp = data.ll.split(',');
      result.latitude = tmp[0];
      result.longitude = tmp[1];
      return result;
    } else {
      return null;
    }
  },

  addScanCondition: function (events) {
    //alert(JSON.stringify(events));
    var now = new Date();
    if(events) {
      for (var i in events) {
        if (moment.utc(now).add('h', 6).toDate() > moment.utc(events[i].starttime).toDate()) {
          events[i].CanScan = 0;
        }
        events[i].CanScan = 1;
      }
    }
    //alert(JSON.stringify(events));
    return events;
  },

  getMoreEvents: function (list, lastIndex) {
    var result =  {
      index: 0,
      events: [],
    };
    var offset = lastIndex + 5;
    if (offset > list.length) {
      offset = list.length;
    }
    var i;
    for (i=lastIndex; i < offset; i++) {
      result.events.push(list[i]);
    }

    result.index = i;
    return result;
  },

  validateForm: function(formid) {
    //alert('here');
    $$(formid).find('.form-error').each(function () {
      $$(this).text('');
    });
    var invalidFields = 0;
    $$(formid).find('input').each(function () {
      if ($$(this).prop('required') == true) {
        var name = $$(this).attr('name');
        var type = $$(this).attr('type');
        var value = $$(this).val().trim();
        if ( type == "text" && value == "" || value == "" ) {
          $$('.'+name).text('This Field Is Required');
          invalidFields++;
          //next();
        } else if (type == "datetime-local" && name == "start" && !validateStartTime(value)) {
          $$('.'+name).text('Event must start in the future');
          invalidFields++;
          //next();
        } else if (type == "datetime-local" && name == "end" && !validateEndTime(value)) {
          $$('.'+name).text('Event must end after it starts');
          invalidFields++;
        //  next();
        } else if (type == "hidden" && name == "imageLandscapePath" && value == " ") {
            $$('.'+name).text('An Image is required');
            invalidFields++;
        } else if (type == "email" && !validateEmail(value)) {
          $$('.'+name).text('Error in your email');
          invalidFields++;
          //next();
        } else if (type == "number" && !validateNumber(value)) {
          $$('.'+name).text('Value must be a number');
          invalidFields++;
          //next();
        }

     }
   });
   if(invalidFields > 0) {
     app.alert(language.OTHER.FORM_ERRORS, function() {
       return false;
     });
   } else {
     return true;
   }
 },


  generateUpdateEventRequest: function (serverEvent, options) {
    var result;
    var data = options.data;
    if (options.area == "details") { //update event details
      result = data;
      result.starttime = moment.utc(data.start).format("HH:mm");
      result.startdate = moment(data.start).format("YYYY-MM-DD");
      result.endtime = moment.utc(data.end).format("HH:mm");
      result.enddate = moment(data.end).format("YYYY-MM-DD");
      result.category_id = util.getCategoryId(data.category);
      result.restrictions_id = util.getRestrictionId(data.restriction);
      //alert(result.restrictions_id+ " "+ data.restriction);
      result.dresscode_id = util.getDresscodeId(data.dresscode);

      result.status_id = "18";
      if (data.private == "on") {
        result.status_id = "19";
      }
      delete result.private;
      delete result.category;
      delete result.restriction;
      delete result.dresscode;
      result.hostedby = data.hostedby;
      result.recommend = serverEvent.recommend;
      result.featured = serverEvent.featured;
      result.venue = serverEvent.venue;
      result.city = serverEvent.city;
      result.country = serverEvent.country;
      result.venuetype_id = serverEvent.venuetype_id;
      result.imagePath = "/thumbnails/events/" + serverEvent.id + "/portrait.png";
      //result.imagePath = "foo";
      result.imageLandscapePath = data.imageLandscapePath;
      result.poslist = [{}];
    } else if (options.area == "tickets") {
      result = formatEventData(serverEvent, 1);
      //result.tickets = [];
      //var tickets = new Array();

      var existingTickets = serverEvent.tickets;
      var tickettype = [];
      var price = [];
      var quantity = [];
      var limit = [];
      var ticketimagepath = [];
      var tickets_id = [];
      var enable = [];
      for (var x=0;x<existingTickets.length;x++) {
        //var y = {};
        if (options.edit == true && data.id == existingTickets[x].id) {
          tickettype.push(data.tickettype);// = existingTickets[x].tickettype;
          price.push(data.price);// = existingTickets[x].id;
          quantity.push(data.quantity);
          limit.push(data.limit);
          ticketimagepath.push(data.ticketimagepath);
          tickets_id.push(data.id);
          //enable.push = " ";
          if (data.enable == false) {
            enable.push(0);
          } else {
            enable.push(1);
          }
        } else {
          tickettype.push(existingTickets[x].tickettype);// = existingTickets[x].tickettype;
          price.push(existingTickets[x].price);// = existingTickets[x].id;
          quantity.push(existingTickets[x].quantity);
          limit.push(existingTickets[x].limit);
          ticketimagepath.push("foo");
          tickets_id.push(existingTickets[x].id);
          //enable.push = " ";
          if (existingTickets[x].enable == false) {
            enable.push(0);
          } else {
            enable.push(1);
          }
        }
        //alert(JSON.stringify(existingTickets[x]));
        //result.tickets.push(y);
      }
      if (options.add == true) {
        tickettype.push(data.tickettype);
        price.push(data.price);
        quantity.push(data.quantity);
        limit.push(data.limit);
        ticketimagepath.push(data.ticketimagepath);
        tickets_id.push(0);
        enable.push(0);
      }
      result.tickettype = tickettype;
      result.price = price;
      result.quantity = quantity;
      result.limit = limit;
      result.ticketimagepath = ticketimagepath;
      result.tickets_id = tickets_id;
      result.enable = enable;
      //result.tickets.push(data);
      //var ticketsJSON = JSON.parse(tickets);
      //result.tickets = ticketsJSON;
      result.poslist = [{}];
    } else if (options.area == "venue") {
      result = formatEventData(serverEvent, 0);
      result.poslist = new Array();
      //result.selectPOS = "";
      result.venue = data.venue;
      result.city = data.city;
      result.country = data.country;
      result.maplink = data.maplink;
      result.venuetype_id = util.getVenueTypeId(data.venuetype);

    } else if (options.area == "pos") {
      result = formatEventData(serverEvent, 1);
      result.poslist = data.posList;
    }

    result.phoneApp = 1;
    result.eventId = serverEvent.id;
    return result;
  },

  generateNewEventRequest: function(eventInfo, venue) {
    //eventInfo.hostedby = user.name2+' '+user.name4
    eventInfo.VenueSelect = venue.name;
    eventInfo.venue = venue.address;
    eventInfo.city = venue.city;
    eventInfo.country = venue.country;
    eventInfo.maplink = venue.maplink;
    eventInfo.tickettype =[];
    eventInfo.price = [];
    eventInfo.quantity = [];
    eventInfo.enable = [];
    eventInfo.selectPOS = " ";
    eventInfo.captcha = config.secret;
    eventInfo.ticketimagepath = [" "];
    eventInfo.recommend = " ";
    eventInfo.featured = " ";
    var start = new Date(eventInfo.start);
    var end = new Date(eventInfo.end);
    eventInfo.starttime = moment.utc(start).format("HH:mm");
    eventInfo.startdate = moment(start).format("YYYY-MM-DD");
    eventInfo.endtime = moment.utc(end).format("HH:mm");
    eventInfo.enddate = moment(end).format("YYYY-MM-DD");
    eventInfo.category_id = util.getCategoryId(eventInfo.category);
    eventInfo.restrictions_id = util.getRestrictionId(eventInfo.restriction);
    eventInfo.dresscode_id = util.getDresscodeId(eventInfo.dresscode);
    eventInfo.venuetype_id = util.getVenueTypeId(venue.venuetype);
    eventInfo.status_id = "18";
    if (eventInfo.private == "on") {
      eventInfo.status_id = "19";
    }
    var repeatsTimeArray =[{
      starttime: eventInfo.startdate+ ' '+eventInfo.starttime,
      endtime: eventInfo.enddate+ ' '+eventInfo.endtime,
    }];
    eventInfo.repeatsTimeArray = JSON.stringify(repeatsTimeArray);
    delete eventInfo.start;
    delete eventInfo.end;
    delete eventInfo.category;
    delete eventInfo.restriction;
    delete eventInfo.dresscode;
    delete eventInfo.private;
    delete eventInfo.venuetype;

    return eventInfo;
  },

  downloadEvents: function(background) {
    $$.ajax({
      async: true,
      cache: false,
      timeout: 1000 * 30,
      url: config.server + "/api/getprofileevents/" + user.id,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          allUserEvents = JSON.parse(data);
          allUserEvents.hasManageEvents = allUserEvents.managedEventList.length + allUserEvents.scanningEventList.length > 0;
          storage.setItem('myEvents', data);
          if (!background) {
            eventsView.router.load({
              url: 'views/events/myevents.html',
              context: allUserEvents,
              reload: true,
              ignoreCache: true,
            });
          }
        }
      },
    });
  },

  downloadFavorites: function() {
    $$.ajax({
      async: true,
      cache: false,
      timeout: 1000 * 30,
      url: config.server + "/api/getuserfavoriteevents/" + user.id,
      method: "GET",
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          allUserFavorites = JSON.parse(data);
          storage.setItem('myFavorites', data);
        }
      },
    });
  },

  updateEvent: function(data, redirect) {
    app.showIndicator();
    var returnEvent = {};
    $$.ajax({
      async: true,
      cache: false,
      url: config.server + "/api/event/" + selectedEventLocal.id,
      method: "PUT",
      timeout: 20 * 1000,
      //contentType: "application/x-www-form-urlencoded",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(data),
      //data: data,
      xhrFields: { withCredentials: true },
      //header: {"Get-Cookie" : storedUser.session},
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          app.hideIndicator();
          app.alert("Event Update Successful!");
          returnEvent = JSON.parse(data);
          if (returnEvent && returnEvent.id) {
            selectedEventLocal = returnEvent;
            eventsView.router.back({
              url: redirect,
              context: selectedEventLocal,
              force: true,
            });
          }
        }
      },
      error: function (xhr, status){
        app.hideIndicator();
        app.alert("Event Update Failed!");
      },
    });
  }
};
