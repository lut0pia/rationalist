var db = [
  {type:'movie',title:'2001: A Space Odyssey',date:'2001',number:2001},
  {type:'movie',title:'28 Days Later',date:'d+28',number:28},
  {type:'movie',title:'28 Weeks Later',date:'w+28',number:28},
  {type:'movie',title:'A Clockwork Orange',color:'ffa500'},
  {type:'movie',title:'Black Swan',color:'000000'},
  {type:'movie',title:'Seven Psychopaths',number:7},
  {type:'movie',title:'Soylent Green',color:'00ff00'},
  {type:'movie',title:'The Day After Tomorrow',date:'d+2'},
  {type:'movie',title:'Twelve Monkeys',number:12},
  {type:'music',title:'Mac DeMarco - Blue Boy',color:'0000ff'},
  {type:'music',title:'The Proclaimers - I\'m Gonna Be (500 Miles)',number:500,distance:"500 miles"},
  {type:'music',title:'Vanessa Carlton - A Thousand Miles',number:1000,distance:"1000 miles"},
  {type:'shows',title:'13 Reasons Why',number:13},
];
var db_types = {
  movie: {
    plural: 'movies',
    url: function(entry) {
      return 'https://www.imdb.com/find?q='+encodeURIComponent(entry.title);
    },
  },
  music: {
    plural: 'songs',
    url: function(entry) {
      return 'https://www.youtube.com/results?search_query='+encodeURIComponent(entry.title);
    },
  },
  shows: {
    plural: 'shows',
    url: function(entry) {
      return 'https://www.imdb.com/find?q='+encodeURIComponent(entry.title);
    },
  },
};
var db_criteria = {
  color: {
    regex: new RegExp(/^[a-f\d]{6}$/i),
    sanitation: function(str) {
      if(this.regex.test(str)) {
        var i = parseInt(str, 16);
        return {
          r: (i >> 16) & 0xff,
          g: (i >> 8) & 0xff,
          b: (i >> 0) & 0xff,
        };
      }
    },
    to_hex: function(value) {
      return ((1<<24)+(value.r<<16)+(value.g<<8)+value.b).toString(16).slice(1);
    },
    print: function(value) {
      return '<div style="width: 100%; height: 100%; background-color: #'+this.to_hex(value)+';"></div>';
    },
  },
  date: {
    relative_regex: new RegExp(/(\S)(\+|\-)(\d+)/i),
    sanitation: function(str) {
      var relative = this.relative_regex.exec(str);
      if(relative) {
        var add = 1;
        switch(relative[1]) {
          case 'w': add *= 7;
          case 'd': add *= 24;
          case 'h': add *= 60;
          case 'm': add *= 60;
          case 's': add *= 1000;
        }
        if(relative[2]=='-') add *= -1;
        add *= parseFloat(relative[3]);
        return new Date(Date.now()+add);
      } else {
        return new Date(str);
      }
    },
    print: function(value) {
      return value.toLocaleDateString();
    },
  },
  distance: {
    regex: new RegExp(/(\d+)\s+(\S+)/i),
    units: {
      m: 1,
      km: 1000,
      meters:1,
      miles:1609.344,
    },
    sanitation: function(str) {
      var value_unit = this.regex.exec(str);
      return parseFloat(value_unit[1])*this.units[value_unit[2]];
    },
    print: function(value) {
      return value+'m';
    },
  },
  duration: {
    print: function(value) {
      return value;
    }
  },
  number: {
    print: function(value) {
      return value;
    }
  },
};

for(var i=0;i<db.length;i++) {
  var entry = db[i];
  for(var key in entry)
    if(db_criteria[key] && db_criteria[key].sanitation)
      entry[key] = db_criteria[key].sanitation(entry[key]);
}
