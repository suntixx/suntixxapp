var appPickers = {

  limitPicker: function(input, limit) {
    var values = [];
    for(var i=0;i<=limit;i++) {
      values.push(i);
    }
    var picker = app.picker({
      scrollToInput: true,
      closeByOutsideClick: true,
      toolbarCloseText: language.OTHER.SELECT,
      input: '#'+input,
      cols: [
        {
          textAlign: 'center',
          values: values,
        }
      ]
    });
    return picker;
  },

  hostedBy: function() {
    var picker;
    if (user.organization) {
      picker = app.picker({
        scrollToInput: true,
        closeByOutsideClick: true,
        toolbarCloseText: language.OTHER.SELECT,
        input: '#event-host',
        //closeByOutsideClick: true,
        cols: [
           {
             textAlign: 'center',
             displayValues: ['personal','organization'],
             values: [user.name2+" "+user.name4, user.organization.name],
           },
         ]
     });
   } else {
     picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#event-host',
       //closeByOutsideClick: true,
       cols: [
          {
            textAlign: 'center',
            displayValues: ['personal'],
            values: [user.fullname],
          },
        ]
    });
   }
   return picker;
  },

  userTitle: function() {
      var picker = app.picker({
        scrollToInput: true,
        closeByOutsideClick: true,
        toolbarCloseText: language.OTHER.SELECT,
        input: '#title-field',
        //closeByOutsideClick: true,
        cols: [
           {
             textAlign: 'center',
             values: ['Mr.', 'Mrs.', 'Miss'],
           },
         ]
     });
     return picker;
   },

   ticketCategory: function () {
    var picker = app.picker({
      scrollToInput: true,
      closeByOutsideClick: true,
      toolbarCloseText: language.OTHER.SELECT,
      input: '#ticket-category',
      //closeByOutsideClick: true,
      cols: [
        {
          textAlign: 'center',
          values: ['Paid', 'Donation', 'Reserve (free)' ],
        },
      ]
    });
    return picker;
   },


   ticketLimit: function () {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#ticket-limit',
       //closeByOutsideClick: true,
       cols: [
         {
           textAlign: 'center',
           values: [1,2,3,4,5,6,7,8,9,10],
         },
       ]
     });
     return picker;
   },

   eventCategories: function (element) {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#' + element,
       //closeByOutsideClick: true,
       cols: [
         {
           textAlign: 'center',
           //values: [9,10,11,12,13,14,15],
           values: ['Concerts & Parties', 'Sports', 'Arts & Theatre', 'Family', 'Conferences & Expos', 'Cinema', 'Travel Packages' ],
         },
       ]
     });
     return picker;

   },

   eventRestrictions: function (element) {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#' + element,
       //closeByOutsideClick: true,
       cols: [
         {
           textAlign: 'center',
           //values: [28,29,30],
           values: ['All Ages', '12 & Over', '18 & Over' ],
         },
       ]
     });
     return picker;

   },

   eventDresscode: function (element) {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#' + element,
      // closeByOutsideClick: true,
       cols: [
         {
           textAlign: 'center',
           //values: [20,21,22,23,24,25,26,27 ],
           values: ['Formal', 'Semi-Formal', 'Elegantly Casual', 'Casual', 'Cocktail', 'Athletic', 'Beach', 'Sleep Wear' ],
         },
       ]
     });
     return picker;
   },

   cardTypes: function (element) {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#' + element,
       cols: [
         {
           textAlign: 'center',
           //values: [34, 35, 36, 37]
           values:['VISA', 'Master Card', 'Discover Card', 'American Express'],
         },
       ]
     });
     return picker;
   },

   countries: function (element) {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#' + element,
       momentumRatio: 40,
       scrollToInput: true,
       updateValuesOnMomentum: true,
      // closeByOutsideClick: true,
       cols: [
         {
           textAlign: 'center',
           //values: [20,21,22,23,24,25,26,27 ],
           values: [
               "Trinidad And Tobago",
               "Antigua And Barbuda",
               "Barbados",
               "Dominica",
               "Grenada",
               "Guyana",
               "Haiti",
               "Jamaica",
               "Montserrat",
               "Saint Kitts And Nevis",
               "Saint Lucia",
               "Saint Vincent And The Grenadines",
               "Afghanistan",
               "Albania",
               "Algeria",
               "American Samoa",
               "Andorra",
               "Anguilla",
               "Antarctica",
               "Argentina",
               "Armenia",
               "Aruba",
               "Australia",
               "Austria",
               "Ayerbaijan",
               "Bahamas, The",
               "Bahrain",
               "Bangladesh",
               "Belarus",
               "Belize",
               "Belgium",
               "Benin",
               "Bermuda",
               "Bhutan",
               "Bolivia",
               "Bouvet Is",
               "Bosnia and Herzegovina",
               "Botswana",
               "Brazil",
               "British Indian Ocean Territory",
               "Brunei",
               "Bulgaria",
               "Burkina Faso",
               "Burundi",
               "Cambodia",
               "Cameroon",
               "Canada",
               "Cape Verde",
               "Cayman Is",
               "Central African Republic",
               "Chad",
               "Chile",
               "China",
               "China (Hong Kong S.A.R.)",
               "China (Macau S.A.R.)",
               "China (Taiwan T.W)",
               "Christmas Is",
               "Cocos (Keeling) Is",
               "Colombia",
               "Comoros",
               "Cook Islands",
               "Costa Rica",
               "Cote D'Ivoire (Ivory Coast)",
               "Croatia (Hrvatska)",
               "Cyprus",
               "Czech Republic",
               "Democratic Republic of the Congo",
               "Denmark",
               "Dominican Republic",
               "Djibouti",
               "East Timor",
               "Ecuador",
               "Egypt",
               "El Salvador",
               "Equatorial Guinea",
               "Eritrea",
               "Estonia",
               "Ethiopia",
               "Falkland Is (Is Malvinas)",
               "Faroe Islands",
               "Fiji Islands",
               "Finland",
               "France",
               "French Guiana",
               "French Polynesia",
               "French Southern Territories",
               "F.Y.R.O. Macedonia",
               "Gabon",
               "Gambia, The",
               "Georgia",
               "Germany",
               "Ghana",
               "Gibraltar",
               "Greece",
               "Greenland",
               "Guadeloupe",
               "Guam",
               "Guatemala",
               "Guinea",
               "Guinea-Bissau",
               "Heard and McDonald Is",
               "Honduras",
               "Hungary",
               "Iceland",
               "India",
               "Indonesia",
               "Ireland",
               "Israel",
               "Italy",
               "Japan",
               "Jordan",
               "Kayakhstan",
               "Kenya",
               "Kiribati",
               "Korea, South",
               "Kuwait",
               "Kyrgyzstan",
               "Laos",
               "Latvia",
               "Lebanon",
               "Lesotho",
               "Liberia",
               "Liechtenstein",
               "Lithuania",
               "Luxembourg",
               "Madagascar",
               "Malawi",
               "Malaysia",
               "Maldives",
               "Mali",
               "Malta",
               "Marshall Is",
               "Mauritania",
               "Mauritius",
               "Martinique",
               "Mayotte",
               "Mexico",
               "Micronesia",
               "Moldova",
               "Monaco",
               "Mongolia",
               "Morocco",
               "Mozambique",
               "Myanmar",
               "Namibia",
               "Nauru",
               "Nepal",
               "Netherlands, The",
               "Netherlands Antilles",
               "New Caledonia",
               "New Zealand",
               "Nicaragua",
               "Niger",
               "Nigeria",
               "Niue",
               "Norway",
               "Norfolk Island",
               "Northern Mariana Is",
               "Oman",
               "Pakistan",
               "Palau",
               "Panama",
               "Papua new Guinea",
               "Paraguay",
               "Peru",
               "Philippines",
               "Pitcairn Island",
               "Poland",
               "Portugal",
               "Puerto Rico",
               "Qatar",
               "Republic of the Congo",
               "Reunion",
               "Romania",
               "Russia",
               "Saint Helena",
               "Saint Pierre and Miquelon",
               "Samoa",
               "San Marino",
               "Sao Tome and Principe",
               "Saudi Arabia",
               "Senegal",
               "Seychelles",
               "Sierra Leone",
               "Singapore",
               "Slovakia",
               "Slovenia",
               "Solomon Islands",
               "Somalia",
               "South Africa",
               "South Georgia & The S. Sandwich Is",
               "Spain",
               "Sri Lanka",
               "Suriname",
               "Svalbard And Jan Mayen Is",
               "Swaziland",
               "Sweden",
               "Switzerland",
               "Syria",
               "Tajikistan",
               "Tanzania",
               "Thailand",
               "Timor-Leste",
               "Togo",
               "Tokelau",
               "Tonga",
               "Tunisia",
               "Turkey",
               "Turks And Caicos Is",
               "Turkmenistan",
               "Tuvalu",
               "Uganda",
               "Ukraine",
               "United Arab Emirates",
               "United Kingdom",
               "United States",
               "United States Minor Outlying Is UM",
               "Uruguay",
               "Uzbekistan",
               "Vanuatu",
               "Vatican City State (Holy See)",
               "Venezuela",
               "Vietnam",
               "Virgin Islands (British)",
               "Virgin Islands (US)",
               "Wallis And Futuna Islands",
               "Western Sahara",
               "Yemen",
               "Zambia",
               "Zimbabwe",
               "Cuba",
               "Curaçao",
               "Saint Barthélemy",
               "Saint Martin",
               "Sint Maarten",
           ],
         },
       ]
     });
     return picker;
   },

   currency: function (element) {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#' + element,
      // closeByOutsideClick: true,
       cols: [
         {
           textAlign: 'center',
           //values: [20,21,22,23,24,25,26,27 ],
           values: ['TTD', 'XCD', 'GBP', 'CAD', 'BDD', 'JMD', 'USD', 'EUR' ],
         },
       ]
     });
     return picker;


   },

   venueType: function (element) {
     var picker = app.picker({
       scrollToInput: true,
       closeByOutsideClick: true,
       toolbarCloseText: language.OTHER.SELECT,
       input: '#' + element,
      // closeByOutsideClick: true,
       cols: [
         {
           textAlign: 'center',
           //values: [20,21,22,23,24,25,26,27 ],
           values: ['Indoor', 'Outdoor', 'Indoor & Outdoor'],
         },
       ]
     });
     return picker;


   },


};
