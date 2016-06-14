var util = {

  getCategoryId: function(name) {
    var a = name.split(' ');
    if (a[0] == "Concerts") {
      return 9;
    } else if (name == "Sports") {
        return 10;
    } else if (a[0] == "Arts") {
        return 11;
    } else if (name == "Family") {
        return 12;
    } else if (a[0] == "Conferences") {
        return 13;
    } else if (name == "Cinema") {
        return 14;
    } else if (a[0] == "Travel") {
        return 15;
    }

  },

  getRestrictionId: function (name) {
    if (name == "All Ages") {
      return 28;
    } else if (name == "12yrs & Over") {
        return 29;
    } else if (name == "18yrs & Over") {
        return 30;
    }
  },

  getDresscodeId: function (name) {
    if (name == "Formal") {
      return 20;
    } else if (name == "Semi-Formal") {
        return 21;
    } else if (name == "Elegantly Casual") {
        return 22;
    } else if (name == "Casual") {
        return 23;
    } else if (name == "Cocktail") {
        return 24;
    } else if (name == "Athletic") {
        return 25;
    } else if (name == "Beach") {
        return 26;
    } else if (name == "Sleep Wear") {
        return 27;
    }

  },

  getVenueTypeId: function (name) {
    if (name == "Indoor") {
      return 31;
    } else if (name == "Outdoor") {
        return 32;
    } else if (name == "Indoor & Outdoor") {
        return 33;
    }
  },

  getCreditCardId: function (name) {
    if (name == "VISA") {
      return 34;
    } else if (name == "Master Card") {
      return 35;
    } else if (name == "Discover Card") {
      return 36;
    } else if (name == "American Express") {
      return 37;
    }
  },

  getCartSummary: function (data) {
    var result = [];
    for(var i in data) {
      var lineInfo = i.split('-');
      var item =  {
        nameonticket: data[i],
        ticketid: lineInfo[1],
      };
      result.push(item);
    }
    return result;
  },

  getQtySummary: function (data) {
    var result =[];
    for(var i in data) {
      var qtyInfo = i.split('-');
      var item = {
        quantity: data[i],
        ticketid: qtyInfo[1]
      };
      result.push(item);
    }
    return result;
  },

  formatSearchResults: function (data) {
    var result =[];
    for (var i in data)  {
      var month = data[i];
      for(var n =0;n<month.length;n++) {
        var startTime = month[n].EnglishTime.split('@');
        var lowestPrice = 0;
        var highestPrice = lowestPrice;
        for(var ticket in month[n].tickets) {
          var thisPrice = month[n].tickets[ticket].price;
          if (lowestPrice == 0) {
            lowestPrice = thisPrice;
            highestPrice = thisPrice;
          }
          if (thisPrice > highestPrice) {
            highestPrice = thisPrice;
          }
          if (thisPrice < lowestPrice) {
            lowestPrice = thisPrice;
          }
        }
        month[n].highestPrice = highestPrice;
        month[n].lowestPrice = lowestPrice;
        month[n].EnglishStartTime = startTime[1];
        result.push(month[n]);
      }

    }

    return result;
  },

  dataToBlob: function (dataURL) {
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1) {
      var parts = dataURL.split(',');
      var contentType = parts[0].split(':')[1];
      var raw = decodeURIComponent(parts[1]);

      return new Blob([raw], {type: contentType});
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], {type: contentType});
  },

  serializeTicketTypes: function(data) {
    var result = "";
    var x;
    //alert(selectedTickets);
    for (x in data) {
      if (data[x] != "") {
        if (result == "") {
          result += data[x];
        } else {
          result = result + "-" + data[x];
        }
      }
    }
    //alert(result);
    return result;
  },

  getTicketsToSell: function(needles, haystack) {
    var result = [];
    for (var i in needles) {
      var item = needles[i];
        //alert(JSON.stringify(item));
      if (item.length>0) {
        //alert(JSON.stringify(item));
        var needle = SEARCHJS.matchArray(haystack, {id: Number(item[0])});
        result.push(needle[0]);
      }
    }
    return result;
  },

};
