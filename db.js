var db = [
  {type:'movie',title:'10 Things I Hate About You',number:10},
  {type:'movie',title:'10,000 BC',number:10000},
  {type:'movie',title:'127 Hours',number:127,duration:'127h'},
  {type:'movie',title:'17 Again',number:17},
  {type:'movie',title:'1941',number:1941,date:'1941'},
  {type:'movie',title:'1984',number:1984,date:'1984'},
  {type:'movie',title:'20,000 Leagues Under the Sea',number:20000, distance:'20000 leagues'},
  {type:'movie',title:'2001: A Space Odyssey',date:'2001',number:2001},
  {type:'movie',title:'2012',number:2012,date:'2012'},
  {type:'movie',title:'2046',number:2046,date:'2046'},
  {type:'movie',title:'21 Grams',number:21},
  {type:'movie',title:'21 Jump Street',number:21},
  {type:'movie',title:'27 Dresses',number:27},
  {type:'movie',title:'28 Days Later',date:'d+28',number:28,duration:'28d'},
  {type:'movie',title:'28 Weeks Later',date:'w+28',number:28,duration:'28w'},
  {type:'movie',title:'30 Days of Night',number:30,duration:'30d'},
  {type:'movie',title:'300',number:300},
  {type:'movie',title:'40 Days & 40 Nights',number:40,duration:'40d'},
  {type:'movie',title:'5 Centimeters per Second',number:5,speed:'5 cm s'},
  {type:'movie',title:'50/50',number:50},
  {type:'movie',title:'8 Mile',number:8,distance:"8 miles"},
  {type:'movie',title:'8 and a Half',number:8.5},
  {type:'movie',title:'A Clockwork Orange',color:'ffa500'},
  {type:'movie',title:'Apollo 13',number:13},
  {type:'movie',title:'Black Swan',color:'000000'},
  {type:'movie',title:'District 9',number:9},
  {type:'movie',title:'Fantastic Four',number:4},
  {type:'movie',title:'Friday the 13th',number:13},
  {type:'movie',title:'Ocean\'s Eleven',number:11},
  {type:'movie',title:'One Day',number:1,duration:'1d'},
  {type:'movie',title:'One Hundred and One Dalmatians',number:101},
  {type:'movie',title:'Seven Psychopaths',number:7},
  {type:'movie',title:'Seven Samurai',number:7},
  {type:'movie',title:'Soylent Green',color:'00ff00'},
  {type:'movie',title:'Super 8',number:8},
  {type:'movie',title:'THX 1138',number:1138},
  {type:'movie',title:'The 40 Year-Old Virgin',number:40},
  {type:'movie',title:'The 400 Blows',number:400},
  {type:'movie',title:'The Day After Tomorrow',date:'d+2'},
  {type:'movie',title:'The Fifth Element',number:5},
  {type:'movie',title:'The Next Three Days',number:3},
  {type:'movie',title:'The Number 23',number:23},
  {type:'movie',title:'The Sixth Sense',number:6},
  {type:'movie',title:'Twelve Monkeys',number:12},
  {type:'movie',title:'Two Weeks Notice',number:2,duration:'2w'},
  {type:'movie',title:'Zero for Conduct',number:0},
  {type:'music',title:'Mac DeMarco - Blue Boy',color:'0000ff'},
  {type:'music',title:'The Proclaimers - I\'m Gonna Be (500 Miles)',number:500,distance:"500 miles"},
  {type:'music',title:'Vanessa Carlton - A Thousand Miles',number:1000,distance:"1000 miles"},
  {type:'shows',title:'13 Reasons Why',number:13},
  {type:'movie',title:'Around the World in 80 Days', number:80, duration:'80d', distance:'40075 km', speed:'5.79788773 m s'},
  {type:'movie',title:'From Dusk till Dawn', duration:'12h'},
  {type:'movie',title:'The Green Mile', distance:'1 miles', color:'00ff00'},
  {type:'book', title:'From the Earth to the Moon', distance: '384400 km'},
  {type:'book', title:'The Fifth Elephant', number:5},
  {type:'book', title:'The Two Towers', number:2},
  {type:'movie',title:'The Lord of the Rings: The Two Towers', number:2},
  {type:'movie',title:'Seven', number:7},
  {type:'movie',title:'Million Dollar Baby', number:1000000}

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
  book: {
    plural: 'books',
    url: function(entry) {
      return 'https://en.wikipedia.org/wiki/Special:Search/'+encodeURIComponent(entry.title);
    }
  }
};

function time_unit(u) {
  var seconds = 1;
  switch(u) {
    case 'w': seconds *= 7;
    case 'd': seconds *= 24;
    case 'h': seconds *= 60;
    case 'm': seconds *= 60;
    //case 's': seconds *= 1;
    break;
  }
  return seconds;
}
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
        var add_ms = 1000;
        add_ms *= time_unit(relative[1]);
        if(relative[2]=='-') add_ms *= -1;
        add_ms *= parseFloat(relative[3]);
        return new Date(Date.now()+add_ms);
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
      leagues: 5556 // 5.556 kilometres for the english league https://en.wikipedia.org/wiki/League_(unit)
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
    regex: new RegExp(/(\d+)(\S)/i),
    sanitation: function(str) {
      var seconds = 1;
      var dur_parts = this.regex.exec(str);
      if(dur_parts) {
        seconds *= time_unit(dur_parts[2]);
        seconds *= parseFloat(dur_parts[1]);
      }
      return seconds;
    },
    print: function(value) {
      return value+'s';
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
