var Menus = {
  event: '<div class="list-block page-content accordion-list custom-accordion">' +
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
          '            <div class="item-title">Resellers</div>'+
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
          '</div>',

    user: '<div class="page-content list-block">'+
          '  <ul>'+
          '    <li>'+
          '      <a href="views/user/update-details.html" class="close-panel item-link item-content user-menu-link" menuItem="details">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Personal Details</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          '    <li>'+
          '      <a href="views/user/update-organization.html" class="close-panel item-link item-content user-menu-link" menuItem="organization">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Event Organization</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          '    <li>'+
          '      <a href="views/user/update-venue.html" class="close-panel item-link item-content user-menu-link" menuItem="venue">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Venue Ownership</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          '    <li>'+
          '      <a href="views/user/update-password.html" class="close-panel item-link item-content user-menu-link" menuItem="password">'+
          '        <div class="item-inner">'+
          '          <div class="item-title">Change Password</div>'+
          '        </div>'+
          '      </a>'+
          '    </li>'+
          //'    <li>'+
          //'      <a href="views/user/update-preferences.html" class="close-panel item-link item-content user-menu-link" menuItem="preferences">'+
          //'        <div class="item-inner">'+
          //'          <div class="item-title">Manage Recommended</div>'+
          //'        </div>'+
          //'      </a>'+
          //'    </li>'+


          '  </ul>'+
          '</div>',

  scan: '<div class="page-content list-block">'+
        '  <ul>'+
        '    <li>'+
        '      <a href="#" class="close-panel item-link item-content user-menu-link" menuItem="details">'+
        '        <div class="item-inner">'+
        '          <div class="item-title">Scan History</div>'+
        '        </div>'+
        '      </a>'+
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
        '</div>',
};




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
    mainView.router.load({
      url: 'views/events/event-tickets.html',
      context: {
        event: selectedEventLocal,
        onlineTickets: onlineTickets
      }
    });
  } else if (menuItem == "details") {
    //alert(menuItem);
    //selectedEventLocal.mystarttime = selectedEventLocal.starttime.substring(0,19);
    mainView.router.load({
      url: 'views/events/event-details.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "venue") {
    var venueList = JSON.parse(Server.getVenueList());
    selectedEventLocal.venues = venueList;
    mainView.router.load({
      url: 'views/events/update-venue.html',
      context: selectedEventLocal,
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
    mainView.router.load({
      url: 'views/events/update-pos.html',
      context: data,
    });
  } else if (menuItem == "scan") {
    mainView.router.load({
      url: 'views/access/access-home.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "access") {
    mainView.router.load({
      url: 'views/events/update-access.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "reports") {
    mainView.router.load({
      url: 'views/events/report.html',
      context: selectedEventLocal,
    });
  } else if (menuItem == "cmembers") {
    mainView.router.load({
      url: 'views/events/update-committee.html',
      context: selectedEventLocal
    });
  } else if (menuItem == "ctickets") {
    var commTickets = [];
    for (var i=0;i<selectedEventLocal.tickets.length;i++) {
      if (Number(selectedEventLocal.tickets[i].permissions) != 0 && Number(selectedEventLocal.tickets[i].permissions) % 9 == 0) {
        commTickets.push(selectedEventLocal.tickets[i]);
      }
    }
    mainView.router.load({
      url: 'views/events/committee-tickets.html',
      context: {
        event: selectedEventLocal,
        commTickets: commTickets,
      }
    });
  }
});
