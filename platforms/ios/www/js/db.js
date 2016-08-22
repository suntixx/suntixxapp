var dBase = {

};

dBase.getUser = function () {
  db.transaction(function (tx) {
    var query = "SELECT data FROM user";
    tx.executeSql(query, function (tx, res) {
      return JSON.parse(res.rows.item(0).data);
    },
    function (tx, error) {
        console.log('SELECT user error: ' + error.message);
    });
  }, function (error) {
      console.log('user transaction error: ' + error.message);
  }, function () {
      console.log('transaction ok');
  });
};

dBase.setUser = function (info) {
  db.transaction(function (tx) {
    var query = "INSERT INTO user (serverId, data) VALUES (?,?)";
    tx.executeSql(query, [info.id, JSON.stringify(info)], function(tx, res) {
        return res.rowsAffected > 0;
    },
    function(tx, error) {
        console.log('INSERT user error: ' + error.message);
    });
  }, function(error) {
      console.log('user insert transaction error: ' + error.message);
  }, function() {
      console.log('user insert transaction ok');
  });
};

dBase.updateUser = function (info) {
  db.transaction(function (tx) {
    var query = "UPDATE user SET data = ? WHERE serverId = ?";
    tx.executeSql(query, [JSON.stringify(info), info.id], function(tx, res) {
        return res.rowsAffected > 0;
    },
    function(tx, error) {
        console.log('UPDATE user error: ' + error.message);
    });
  }, function(error) {
      console.log('user UPDATE transaction error: ' + error.message);
  }, function() {
      console.log('user UPDATE transaction ok');
  });
};
