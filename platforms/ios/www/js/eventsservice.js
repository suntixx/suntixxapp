function formatEventData (serverEvent, condition) {
  var data = {};
  //alert("here");
  var start = new Date(serverEvent.starttime);
  var end = new Date(serverEvent.endtime);
  data.starttime = moment(start).format("HH:mm");
  data.startdate = moment(start).format("YYYY-MM-DD");
  data.endtime = moment(end).format("HH:mm");
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
  //data.imagePath = "/thumbnails/events/" + serverEvent.id + "/portrait.png";
  //data.imageLandscapePath = "/thumbnails/events/" + serverEvent.id + "/landscape.png";
  data.imagePath = " ";
  data.imageLandscapePath = " ";
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

function validateStartTime(dateString) {
    var today = new Date();
    var startDate = new Date(dateString);
    return startDate >= today;
}

function validateEndTime(dateString) {
    var startdate = new Date( $$('#starttime').val() );
    var endDate = new Date(dateString);
    return endDate > startdate;
}

var eventsService = {

  canScan: function (event) {
    var now = moment();

    if (moment(now).add('h', 6).toDate() > moment(event.starttime).toDate()) {
      return false;
    }
    return true;
  },

  addScanCondition: function (events) {
    //alert(JSON.stringify(events));
    var now = moment();
    if(events) {
      for (var i in events) {
        if (moment(now).add('h', 6).toDate() > moment(events[i].starttime).toDate()) {
          events[i].CanScan = 0;
        }
        events[i].CanScan = 1;
      }
    }
    //alert(JSON.stringify(events));
    return events;
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
        } else if (type == "date" && name == "start" && !validateStartTime(value)) {
          $$('.'+name).text('Event must start in the future');
          invalidFields++;
          //next();
        } else if (type == "date" && name == "end" && !validateEndTime(value)) {
          $$('.'+name).text('Event must end after it starts');
          invalidFields++;
        //  next();
        } else if (type == "hidden" && name == "imageLandscapePath" && value == " ") {
            $$('.'+name).text('An Image is required');
            invalidFields++;
        }

     }
   });
   return invalidFields == 0;
 },

  generateUpdateEventRequest: function (serverEvent, options) {
    var result;
    var data = options.data;
    if (options.area == "details") { //update event details
      result = data;
      result.starttime = moment(data.start).format("HH:mm");
      result.startdate = moment(data.start).format("YYYY-MM-DD");
      result.endtime = moment(data.end).format("HH:mm");
      result.enddate = moment(data.end).format("YYYY-MM-DD");
      result.category_id = serverEvent.category_id;
      result.restrictions_id = util.getRestrictionId(data.restriction);
      result.dresscode_id = util.getDresscodeId(data.dresscode);
      result.status_id = 19;
      if (data.private.length == 0) {
        result.status_id = 18;
      }
      result.hostedby = data.hostedby;
      result.recommend = serverEvent.recommend;
      result.featured = serverEvent.featured;
      result.venue = serverEvent.venue;
      result.city = serverEvent.city;
      result.country = serverEvent.country;
      result.venuetype_id = serverEvent.venuetype_id;
      //result.imagePath = "/thumbnails/events/" + serverEvent.id + "/portrait.png";
      result.imagePath = " ";
      result.imageLandscapePath = data.imageLandscapePath;
      result.poslist = [];
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
          ticketimagepath.push(" ");
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
      result.poslist = [];
    } else if (options.area == "venue") {
      result = formatEventData(serverEvent, 0);
      result.poslist = [];
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
    eventInfo.hostedby = user.name2+' '+user.name4
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
    eventInfo.starttime = moment(start).format("HH:mm");
    eventInfo.startdate = moment(start).format("YYYY-MM-DD");
    eventInfo.endtime = moment(end).format("HH:mm");
    eventInfo.enddate = moment(end).format("YYYY-MM-DD");
    eventInfo.category_id = util.getCategoryId(eventInfo.category);
    eventInfo.restrictions_id = util.getRestrictionId(eventInfo.restriction);
    eventInfo.dresscode_id = util.getDresscodeId(eventInfo.dresscode);
    eventInfo.venuetype_id = util.getVenueTypeId(venue.venuetype);
    eventInfo.status_id = 19;
    if (eventInfo.private.length == 0) {
      eventInfo.status_id = 18;
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


};
