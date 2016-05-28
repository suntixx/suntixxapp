/*!
 * Barcode39 v0.0.2 ~ Copyright (c) 2012 Erik Zettersten, http://zettersten.com
 * Released under MIT license
 */

(function(){

  "use strict";

  // General
  var Barcode39;
  var version = "0.0.2";

  // adds index of compatibility
  [].indexOf||(Array.prototype.indexOf=function(a,b,c){for(c=this.length,b=(c+~~b)%c;b<c&&(!(b in this)||this[b]!==a);b++);return b^c?b:-1;});

  // adds trim compatibility
  ''.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g,'')});

  // Code Mappings
  var code_map = [
    ["0", "NnNwWnWnN", "bwbWBwBwb"],
    ["1", "WnNwNnNnW", "BwbWbwbwB"],
    ["2", "NnWwNnNnW", "bwBWbwbwB"],
    ["3", "WnWwNnNnN", "BwBWbwbwb"],
    ["4", "NnNwWnNnW", "bwbWBwbwB"],
    ["5", "WnNwWnNnN", "BwbWBwbwb"],
    ["6", "NnWwWnNnN", "bwBWBwbwb"],
    ["7", "NnNwNnWnW", "bwbWbwBwB"],
    ["8", "WnNwNnWnN", "BwbWbwBwb"],
    ["9", "NnWwNnWnN", "bwBWbwBwb"],
    ["A", "WnNnNwNnW", "BwbwbWbwB"],
    ["B", "NnWnNwNnW", "bwBwbWbwB"],
    ["C", "WnWnNwNnN", "BwBwbWbwb"],
    ["D", "NnNnWwNnW", "bwbwBWbwB"],
    ["E", "WnNnWwNnN", "BwbwBWbwb"],
    ["F", "NnWnWwNnN", "bwBwBWbwb"],
    ["G", "NnNnNwWnW", "bwbwbWBwB"],
    ["H", "WnNnNwWnN", "BwbwbWBwb"],
    ["I", "NnWnNwWnN", "bwBwbWBwb"],
    ["J", "NnNnWwWnN", "bwbwBWBwb"],
    ["K", "WnNnNnNwW", "BwbwbwbWB"],
    ["L", "NnWnNnNwW", "bwBwbwbWB"],
    ["M", "WnWnNnNwN", "BwBwbwbWb"],
    ["N", "NnNnWnNwW", "bwbwBwbWB"],
    ["O", "WnNnWnNwN", "BwbwBwbWb"],
    ["P", "NnWnWnNwN", "bwBwBwbWb"],
    ["Q", "NnNnNnWwW", "bwbwbwBWB"],
    ["R", "WnNnNnWwN", "BwbwbwBWb"],
    ["S", "NnWnNnWwN", "bwBwbwBWb"],
    ["T", "NnNnWnWwN", "bwbwBwBWb"],
    ["U", "WwNnNnNnW", "BWbwbwbwB"],
    ["V", "NwWnNnNnW", "bWBwbwbwB"],
    ["W", "WwWnNnNnN", "BWBwbwbwb"],
    ["X", "NwNnWnNnW", "bWbwBwbwB"],
    ["Y", "WwNnWnNnN", "BWbwBwbwb"],
    ["Z", "NwWnWnNnN", "bWBwBwbwb"],
    ["-", "NwNnNnWnW", "bWbwbwBwB"],
    [".", "WwNnNnWnN", "BWbwbwBwb"],
    [" ", "NwWnNnWnN", "bWBwbwBwb"],
    ["$", "NwNwNwNnN", "bWbWbWbwb"],
    ["/", "NwNwNnNwN", "bWbWbwbWb"],
    ["+", "NwNnNwNwN", "bWbwbWbWb"],
    ["%", "NnNwNwNwN", "bwbWbWbWb"],
    ["*", "NwNnWnWnN", "bWbwBwBwb"]
  ];

  // Retrieves Map Value given character (optional type)
  var char_lookup = function( character, type ){
    character = ("" + character).toUpperCase();
    type = type ? +type : 2;
    for (var i = 0; i < code_map.length; i++)
      if (character === code_map[i][0])
        return code_map[i][type];
  };

  // toBarcode helper
  var formatter_helper = [];
  var format = function(code){
    formatter_helper.push("[" + code + "]w");
  }
  
  // Barcode39 Class
  Barcode39 = function(elementId, type, delimeter){
    this.codes = code_map;
    this.version = version;
    this.barcode = null;
    this.element = document.getElementById(elementId || "barcode");
    this.delimeter = delimeter || "*";
    this.type = type || 2;
    this.init();
  };

  // Stringify the values
  Barcode39.prototype.toString = function(){
    if (!this.barcode)
      return "";
    return (this.delimeter + this.barcode + this.delimeter).trim();
  };

  // Barcode representation
  Barcode39.prototype.toBarcode = function(){
    var str = formatter_helper.join("");
    str = str.slice(0, str.length - 1);
    return str.trim();
  }

  // base64 URL representation
  Barcode39.prototype.toDataURL = function(){

    if (typeof this.element === "undefined") 
      throw new Error("Element not defined.");

    var canvas = document.createElement("canvas");

    if (!canvas.getContext)
      throw new Error("Canvas not supported.");

    var text = (this.element.innerText.toUpperCase()).trim(),
        length = +text.length,
        full_width = (length * 15) + (length - 1),
        width = ( full_width < 360 ) ? 400 : (full_width + 40),
        height = 120,
        ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    canvas.height = height;
    canvas.width = width;

    ctx.fillStyle = "rgba(255,255,255, 0.0)"; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var i,
        j,
        currentx = Math.round( width / 2 - full_width / 2 ), 
        currenty = 20,
        widewidth = 3,
        barheight = 80;

    for ( i = 0; i < text.length; i++) {
      
      var code = char_lookup(text[i]);
      format(code);


      // sets default to "-" if no code is found
      if (typeof code === "" || typeof code === "undefined") 
        code = char_lookup("-");

      for ( j = 0; j < code.length; j++) {

        if (j % 2 == 0)
          ctx.fillStyle = "rgb(0,0,0)";  
        else
          ctx.fillStyle = "rgba(255,255,255, 0.0)"; 
           
        if ( code.charCodeAt(j) < 91 ) {
          ctx.fillRect (currentx, currenty, widewidth, barheight);
          currentx += 3;
        } else {
          ctx.fillRect (currentx, currenty, 1, barheight);
          currentx += 1;
        }
           
      }
                 
      if ( i != (text.length - 1) ) {
        ctx.fillStyle = "rgba(255,255,255, 0.0)";
        ctx.fillRect (currentx, currenty, 1, barheight);
        currentx += 1;
      }

    }

    this.barcode = text;

    return canvas.toDataURL();

  };

  Barcode39.prototype.init = function(){
    formatter_helper = [];
    var url = this.toDataURL();
    this.element.innerHTML = ("<img src=\"" + url + "\" />");
  }

  // export
  window.Barcode39 = Barcode39;

})();


