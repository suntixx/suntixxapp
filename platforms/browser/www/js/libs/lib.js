// Barcode JS Library
// Author: Edward Slipszenko (http://slipszenko.net, edd@slipszenko.net)

function barcode(opts) {
    var hook = document.getElementById(opts.renderToID);
    var barcodeString = "";
    var count = opts.string.length;
    var quietZone = 10 * opts.barWidth -1;
    var paddingTop = 5;
    var paddingBottom = 5;
    // Include string length + start + stop + checksum + front and back quiet zones
    var totalWidth = (opts.barWidth * (count + 3) * 11) + 2 + (quietZone * 2);

    var stop = "11000111010";
    var terminateBarcode = "11";

    var runningChecksum = 104;
    barcodeString += b_enc[104];

    // Build the barcode
    for(var i = 0; i < count; i++) {
        var position = i + 1;
        var key = b_chr.indexOf(opts.string[i]);
        barcodeString += b_enc[key];
        runningChecksum += position * key;
        //console.log("Position: " + position + ", Character: " + opts.string[i]  + ", Key: " + key  + ", barcodeString: " + barcodeString + ", runningChecksum: " + runningChecksum);
    }

    var checksum = runningChecksum % 103;

    // If the checksum is greater than 94, send the raw value. Otherwise, add 32 and use the ASCII character to lookup the key of the hash array for that character
    var key;
    if(checksum > 94) {
        key = checksum;
    } else {
        checksum += 32;
        var checksum2 = String.fromCharCode(checksum);
        key = b_chr.indexOf(checksum2);
    }

    //console.log(key);
    barcodeString += b_enc[key] + stop + terminateBarcode;
    
    var lastChar = '0';
    var barcodeCount = barcodeString.length;
    var barcodeHTML = '';

    for(var i = 0; i < barcodeCount; i++) {
        if((barcodeString[i] == 1 && barcodeString[i] != lastChar)
            || (barcodeString[i] == 1 && barcodeString[i] == lastChar)) {
            // Dark space
            barcodeHTML += '<div style="display: inline-block; width:' + opts.barWidth + 'px; height: ' + opts.height + 'px; background-color: #000;"></div>';
        }
        if(barcodeString[i] == 0 && barcodeString != lastChar || i == barcodeCount - 1) {
            // White space
            // ADD HTML
            barcodeHTML += '<div style="display: inline-block; width:' + opts.barWidth + 'px; height: ' + opts.height + 'px; background-color: #FFF;"></div>';
        }
        lastChar = barcodeString[i];
    }

    if(opts.showText) {
        barcodeHTML += '<br /><span>' + opts.string + "</span>";
    }

    hook.innerHTML = barcodeHTML;
}

// Character lookup
var b_chr = [
    " ",
    "!",
    '"',
    "#",
    "$",
    "%",
    "&",
    "'",
    "(",
    ")",
    "*",
    "+",
    ",",
    "-",
    ".",
    "/",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    ":",
    ";",
    "<",
    "=",
    ">",
    "?",
    "@",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "[",
    "\\",
    "]",
    "^",
    "_",
    "`",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "{",
    "|",
    "}",
    "~",
    "DEL",
    "FNC3",
    "FNC2",
    "SHIFT",
    "Code C",
    "FNC4",
    "Code A",
    "FNC1",
    "START A",
    "START B",
    "START C"
]

// Encoding lookup
var b_enc = [
    "11011001100",
    "11001101100",
    "11001100110",
    "10010011000",
    "10010001100",
    "10001001100",
    "10011001000",
    "10011000100",
    "10001100100",
    "11001001000",
    "11001000100",
    "11000100100",
    "10110011100",
    "10011011100",
    "10011001110",
    "10111001100",
    "10011101100",
    "10011100110",
    "11001110010",
    "11001011100",
    "11001001110",
    "11011100100",
    "11001110100",
    "11101101110",
    "11101001100",
    "11100101100",
    "11100100110",
    "11101100100",
    "11100110100",
    "11100110010",
    "11011011000",
    "11011000110",
    "11000110110",
    "10100011000",
    "10001011000",
    "10001000110",
    "10110001000",
    "10001101000",
    "10001100010",
    "11010001000",
    "11000101000",
    "11000100010",
    "10110111000",
    "10110001110",
    "10001101110",
    "10111011000",
    "10111000110",
    "10001110110",
    "11101110110",
    "11010001110",
    "11000101110",
    "11011101000",
    "11011100010",
    "11011101110",
    "11101011000",
    "11101000110",
    "11100010110",
    "11101101000",
    "11101100010",
    "11100011010",
    "11101111010",
    "11001000010",
    "11110001010",
    "10100110000",
    "10100001100",
    "10010110000",
    "10010000110",
    "10000101100",
    "10000100110",
    "10110010000",
    "10110000100",
    "10011010000",
    "10011000010",
    "10000110100",
    "10000110010",
    "11000010010",
    "11001010000",
    "11110111010",
    "11000010100",
    "10001111010",
    "10100111100",
    "10010111100",
    "10010011110",
    "10111100100",
    "10011110100",
    "10011110010",
    "11110100100",
    "11110010100",
    "11110010010",
    "11011011110",
    "11011110110",
    "11110110110",
    "10101111000",
    "10100011110",
    "10001011110",
    "10111101000",
    "10111100010",
    "11110101000",
    "11110100010",
    "10111011110",
    "10111101110",
    "11101011110",
    "11110101110",
    "11010000100",
    "11010010000",
    "11010011100"
]