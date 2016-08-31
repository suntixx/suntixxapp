var chatService = {};

chatService.openChat = function(receiverId, receiverName, isEvent) {
  if (user && receiverId == user.id) {
    return;
  }
  if (!isEvent) isEvent = false;
  db.transaction(function(tx) {
    var sql = 'INSERT or REPLACE INTO chatrooms (roomid, receiver_name, isevent) values (?,?,?)';
    tx.executeSql(sql, [receiverId,  receiverName, isEvent], function(tx, resultSet) {
      console.log("added chatroom "+receiverId);
    }, function(tx, error) {
        console.log("insert error " +error);
    });
  }, function(error) {
    console.log(error);
    myApp.addNotification({
        message: language.SYSTEM.DATABASE_CONFIGURATION_ERROR
    });
  }, function() {
    var context = {
      isevent: isEvent,
      receiver: receiverId,
    };
    /*if (isEvent) {
      context.eventId = receiverId;
    } else {
      context.receiver = receiverId
    }*/
    mainView.router.load({
      url: 'views/user/chat.html',
      context : context
    });
  });
};
