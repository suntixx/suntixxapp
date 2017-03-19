var Menus = {};
Menus.event = '<div class="list-block page-content accordion-list custom-accordion">' +
          ' <ul>' +
          '   <li class="accordion-item">'+
          '     <a href="#" class="item-link item-content">'+
          '       <div class="item-inner">'+
          '           <div class="item-title"><b>Manage Event</b></div>'+
          '       </div>'+
          '     </a>'+
          '     <div class="accordion-item-content">' +
          '      <a href="#" class="item-link item-content event-menu-link" menuItem="details" event-id={{id}}>'+
          '        <div class="item-inner">'+
          '           <div class="item-title">Edit Details</div>'+
          '        </div>'+
          '       </a>'+
          '       <a href="#" class="item-link item-content event-menu-link" menuItem="tickets" event-id={{id}}>'+
          '         <div class="item-inner">'+
          '            <div class="item-title">Manage Tickets</div>'+
          '        </div>'+
          '      </a>'+
          //'      <a href="#" class="item-link item-content event-menu-link" menuItem="preprinted" event-id={{id}}>'+
          //'        <div class="item-inner">'+
          //'            <div class="item-title">Order Preprinted Tickets</div>'+
          ///'        </div>'+
          //'      </a>'+
          //'      <a href="#" class="item-link item-content event-menu-link" menuItem="pos" event-id={{id}}>'+
          //'        <div class="item-inner">'+
          //'            <div class="item-title">Retail Outlets</div>'+
          //'        </div>'+
          //'      </a>'+

          '       <a href="#" class="item-link item-content event-menu-link" menuItem="venue" event-id={{id}}>'+
          '        <div class="item-inner">'+
          '            <div class="item-title">Manage Venue</div>'+
          '        </div>'+
          '      </a>'+
          '       <a href="#" class="item-link item-content event-menu-link" menuItem="clone" event-id={{id}}>'+
          '        <div class="item-inner">'+
          '            <div class="item-title">Duplicate Event</div>'+
          '        </div>'+
          '      </a>'+
          '     </div>' +
          '   </li>'+
          '   <li class="accordion-item">'+
          '     <a href="#" class="item-link item-content">'+
          '        <div class="item-inner">'+
          '          <div class="item-title"><b>Access Control</b></div>'+
          '        </div>'+
          '      </a>'+
          '     <div class="accordion-item-content">' +
          '       <a href="#" class="item-link item-content event-menu-link" menuItem="scan" event-id={{id}}>'+
          '         <div class="item-inner">'+
          '            <div class="item-title">Scan Tickets</div>'+
          '        </div>'+
          '      </a>'+
          '       <a href="#" class="item-link item-content event-menu-link" menuItem="access" event-id={{id}}>'+
          '         <div class="item-inner">'+
          '            <div class="item-title">Access Control Devices</div>'+
          '        </div>'+
          '      </a>'+
          '     </div>' +
          '    </li>'+
          '   <li class="accordion-item">'+
          '     <a href="#" class="item-link item-content">'+
          '        <div class="item-inner">'+
          '          <div class="item-title"><b>Box Office</b></div>'+
          '        </div>'+
          '      </a>'+
          '     <div class="accordion-item-content">' +
          '       <a href="#" class="item-link item-content event-menu-link" menuItem="ctickets" event-id={{id}}>'+
          '         <div class="item-inner">'+
          '            <div class="item-title">Box Office Tickets</div>'+
          '        </div>'+
          '      </a>'+
          '       <a href="#" class="item-link item-content event-menu-link" menuItem="cmembers" event-id={{id}}>'+
          '         <div class="item-inner">'+
          '            <div class="item-title">Sellers</div>'+
          '        </div>'+
          '      </a>'+
          '     </div>' +
          '    </li>'+
          '    <li>'+
          '      <a href="#" class="item-link item-content event-menu-link" menuItem="reports" event-id={{id}}>'+
          '        <div class="item-inner">'+
          '          <div class="item-title"><b>Reports</b></div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          '  </ul>'+
          '</div>';

Menus.previousEvent = '<div class="list-block page-content accordion-list custom-accordion">' +
                    ' <ul>' +
                    '   <li class="accordion-item">'+
                    '     <a href="#" class="item-link item-content">'+
                    '       <div class="item-inner">'+
                    '           <div class="item-title"><b>Manage Event</b></div>'+
                    '       </div>'+
                    '     </a>'+
                    '     <div class="accordion-item-content">' +
                    '      <a href="#" class="item-link item-content event-menu-link" menuItem="clone" event-id={{id}}>'+
                    '        <div class="item-inner">'+
                    '           <div class="item-title">Duplicate Event</div>'+
                    '        </div>'+
                    '       </a>'+
                    '     </div>' +
                    '   </li>'+
                    '    <li>'+
                    '      <a href="#" class="item-link item-content event-menu-link" menuItem="reports" event-id={{id}}>'+
                    '        <div class="item-inner">'+
                    '          <div class="item-title"><b>Reports</b></div>'+
                    '        </div>'+
                    '      </a>'+
                    '    </li>'+
                    '  </ul>'+
                    '</div>';

Menus.user = '<div class="page-content list-block">'+
          '  <ul id="user-menu">'+
          '    <li>'+
          '      <a href="views/user/update-details.html" data-view=".view-profile" class="close-panel item-link item-content user-menu-link" menuItem="details">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Personal Details</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          '    <li>'+
          '      <a href="views/user/update-organization.html" data-view=".view-profile" class="close-panel item-link item-content user-menu-link" menuItem="organization">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Event Organization</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          '    <li>'+
          '      <a href="views/user/update-venue.html" data-view=".view-profile" class="close-panel item-link item-content user-menu-link" menuItem="venue">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Venue Ownership</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          '    <li>'+
          '      <a href="views/user/update-password.html" data-view=".view-profile" class="close-panel item-link item-content user-menu-link" menuItem="password">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Change Password</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          /*'    <li>'+
          //'      <a href="views/user/update-preferences.html" class="close-panel item-link item-content user-menu-link" menuItem="preferences">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Preferences</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+*/
          /*'     <li>'+
          '       <a href="#" class="close-panel item-link facebook-menu item-content">'+
          '        <div class="item-inner">'+
          '         <div class="item-title"></div>'+
          '        </div>'+
          '       </a>'+
          '    </li>'+
          '     <li>'+
          '       <a href="#" class="close-panel item-link open-settings item-content">'+
          '        <div class="item-inner">'+
          '         <div class="item-title">Settings</div>'+
          '        </div>'+
          '       </a>'+
          '    </li>'+*/
          '     <li>'+
          '       <a href="#" class="close-panel item-link logout item-content">'+
          '        <div class="item-inner">'+
          '         <div class="item-title">Logout</div>'+
          '        </div>'+
          '       </a>'+
          '    </li>'+
          '  </ul>'+
          '</div>';

Menus.scan = '<div class="page-content list-block">'+
        '  <ul>'+
        '    <li>'+
        '      <a href="#" class="close-panel item-link item-content open-scan-history">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Scan History</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+
        '    <li>'+
        '       <div class="item-content">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Online Scan</div>'+
        //'          <div class="item-input">'+
        '            <label class="label-switch">'+
        '              <input class="online-scan" type="checkbox">'+
        '              <div class="checkbox"></div>'+
        '            </label>'+
      //  '          </div>'+
        '        </div>'+
        '      </div>' +
        '    </li>'+
        '    <li>'+
        '       <div class="item-content">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Auto Scan</div>'+
        //'          <div class="item-input">'+
        '            <label class="label-switch">'+
        '              <input class="auto-scan" type="checkbox">'+
        '              <div class="checkbox"></div>'+
        '            </label>'+
      //  '          </div>'+
        '        </div>'+
        '      </div>' +
        '    </li>'+
        '  </ul>'+
        '</div>';

Menus.ownerScan = '<div class="page-content list-block">'+
        '  <ul>'+
        '    <li>'+
        '      <a href="#" class="close-panel item-link item-content open-scan-history">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Scan History</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+
        '    <li>'+
        '     <li>'+
        '      <a href="#" class="close-panel item-link item-content open-event-report">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Full Report</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+
        '    <li>'+
        '       <div class="item-content">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Online Scan</div>'+
        //'          <div class="item-input">'+
        '            <label class="label-switch">'+
        '              <input class="online-scan" type="checkbox">'+
        '              <div class="checkbox"></div>'+
        '            </label>'+
      //  '          </div>'+
        '        </div>'+
        '      </div>' +
        '    </li>'+
        '    <li>'+
        '       <div class="item-content">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Auto Scan</div>'+
        //'          <div class="item-input">'+
        '            <label class="label-switch">'+
        '              <input class="auto-scan" type="checkbox">'+
        '              <div class="checkbox"></div>'+
        '            </label>'+
      //  '          </div>'+
        '        </div>'+
        '      </div>' +
        '    </li>'+
        '  </ul>'+
        '</div>';

Menus.chatRoom = '<div class="page-content list-block">'+
        '  <ul>'+
        '    <li>'+
        '      <a href="#" class="close-panel item-link item-content get-members">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Members</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+
        '    <li>'+
        '      <a href="#" class="close-panel item-link item-content leave-room">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Leave Room</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+
        '    <li>'+
        '      <a href="#" class="close-panel item-link item-content clear-chat">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Clear Chat</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+
        '  </ul>'+
        '</div>';

Menus.privateChat = '<div class="page-content list-block">'+
        '  <ul>'+
        /*'    <li>'+
        '      <a href="#" class="close-panel item-link item-content open-user-profile">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">User Profile</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+*/
        '    <li>'+
        '      <a href="#" class="close-panel item-link item-content clear-chat">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Clear Chat</div>'+
        '        </div>'+
        '      </a>'+
        '    </li>'+
        '  </ul>'+
        '</div>';


$$(document).on('click', '.open-event-report', function() {
  var nocache = "?t="+moment().unix();
  var result;
  $$.ajax({
    async: true,
    url: config.server + "/api/event/" + selectedEventLocal.id + nocache,
    method: "GET",
    timeout: 20 * 1000,
    success: function(data, status, xhr) {
      if (status == 200 || status == 0 ){
        result = JSON.parse(data);
        if (result && result.id>0) {
          selectedEventLocal = result;
          selectedEventLocal.onlineTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 0});
          selectedEventLocal.prePrintedTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 1});
          selectedEventLocal.boxOfficeTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2});
          selectedEventLocal.fromScan = true;
          eventsView.router.load({
            url: 'views/events/reports.html',
            context: selectedEventLocal,
          });
        }
      }
    },
    error: function(status, xhr) {
      app.alert("There was a problem downloading report information");
      return;
    },
  });

});


$$(document).on('click', '.event-menu-link', function () {
  //var eventId = $$(this).attr('event-id');
  var menuItem = $$(this).attr('menuItem');
  app.closePanel();
  if (menuItem == "tickets") {
    var onlineTickets = [];
    for (var i=0;i<selectedEventLocal.tickets.length;i++) {
      if (Number(selectedEventLocal.tickets[i].permissions) == 0 || Number(selectedEventLocal.tickets[i].permissions) % 9 > 0) {
        onlineTickets.push(selectedEventLocal.tickets[i]);
      }
    }
    eventsView.router.load({
      url: 'views/events/event-tickets.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "details") {
    //alert(menuItem);
    //selectedEventLocal.mystarttime = selectedEventLocal.starttime.substring(0,19);
    eventsView.router.load({
      url: 'views/events/event-details.html',
      context: selectedEventLocal,
    });
  }  else if (menuItem == "clone") {
    //alert(menuItem);
    //selectedEventLocal.mystarttime = selectedEventLocal.starttime.substring(0,19);
    var eventId = $$(this).attr('event-id');
    if ($$(this).hasClass('previous')) {
      selectedEventLocal = _.find(allUserEvents.previousEventList, function(item) {
        return item.id == eventId;
      });
    }
    selectedEventLocal.cloneEvent = true;
    var now = new Date();
    now = now.toISOString();
    selectedEventLocal.now = now.substring(0,19);
    if (selectedEventLocal.hostedby >= 0) {
      selectedEventLocal.HostedBy = user.fullname;
    } else {
      selectedEventLocal.HostedBy = selectedEventLocal.hostedby;
    }
    eventsView.router.load({
      url: 'views/events/create-event.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "venue") {
    var venueList;
    $$.ajax({
      async: true,
      cache: false,
      url: config.server + "/api/venuelist/",
      method: "GET",
      contentType: "application/x-www-form-urlencoded",
      xhrFields: { withCredentials: true },
      success: function(data, status, xhr) {
        if (status == 200 || status == 0 ){
          venueList = JSON.parse(data);
          selectedEventLocal.venues = venueList;
          app.hidePreloader();
          eventsView.router.load({
            url: 'views/events/update-venue.html',
            context: selectedEventLocal,
          });
        }
      },
      error: function (xhr, status){
        app.hidePreloader();
        app.alert("Failed to get Venue Data! Error Response:" + status, "Suntixx Scanner");
      },
    });
  } else if (menuItem == "pos") {
    var posList = JSON.parse(Server.getPOSList());
    for (var i=0; i<posList.length; i++) {
      for (var n=0; n<selectedEventLocal.posuser.length; n++) {
        if (posList[i].id == selectedEventLocal.posuser[n].id) {
          posList[i].selected = true;
          break;
        }
      }
    }
    var data = {};
    data.id = selectedEventLocal.id;
    data.posFullList = posList;
    data.posUser = selectedEventLocal.posuser;
    //alert(JSON.stringify(data));
    eventsView.router.load({
      url: 'views/events/update-pos.html',
      context: data,
    });
  } else if (menuItem == "scan") {
    eventsView.router.load({
      url: 'views/access/scan.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "access") {
    eventsView.router.load({
      url: 'views/events/update-access.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "reports") {
    var eventId = $$(this).attr('event-id');
    if ($$(this).hasClass('previous')) {
      selectedEventLocal = _.find(allUserEvents.previousEventList, function(item) {
        return item.id == eventId;
      });
    } else {
      selectedEventLocal = _.find(allUserEvents.managedEventList, function(item) {
        return item.id == eventId;
      });
    }
    selectedEventLocal.onlineTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 0});
    selectedEventLocal.prePrintedTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 1});
    selectedEventLocal.boxOfficeTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2});

    eventsView.router.load({
      url: 'views/events/reports.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "cmembers") {
    eventsView.router.load({
      url: 'views/events/update-committee.html',
      context: selectedEventLocal
    });
  } else if (menuItem == "ctickets") {
    if (selectedEventLocal.committeeplan_id > 0) {
      var commTickets = [];
      if (selectedEventLocal.tickets) {
        commTickets = SEARCHJS.matchArray(selectedEventLocal.tickets, {origin: 2});
      }
      eventsView.router.load({
        url: 'views/events/committee-tickets.html',
        context: {
          event: selectedEventLocal,
          commTickets: commTickets,
        }
      });
    } else {
      var nocache = "?t="+moment().unix();
      $$.ajax({
        timeout: 5 * 1000,
        async: true,
        url: config.server + "/api/getcommitteeplans" + nocache,
        method: "GET",
        success: function(data, status, xhr) {
          if (status == 200 || status == 0 ){
            var result = JSON.parse(data);
            eventsView.router.load({
              url: 'views/events/committee-plans.html',
              context: result,
            });
          }
        },
        error: function (xhr, status){
          app.alert("Oops, Someting went wrong");
        },
      });
    }
  }
});
