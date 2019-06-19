const db_criteria = {
  color: {
    regex: new RegExp(/^[a-f\d]{6}$/i),
    sanitation: function(str) {
      if(this.regex.test(str)) {
        const i = parseInt(str, 16);
        const r = ((i >> 16) & 0xff) / 255;
        const g = ((i >> 8) & 0xff) / 255;
        const b = ((i >> 0) & 0xff) / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if(max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }

        h = Math.ceil(h * 255);
        s = Math.ceil(s * 255);
        l = Math.ceil(l * 255);
        return (h << 16) + (s << 8) + l;
      }
    },
    to_rgb_hex: function(value) {
      const h = (value>>16 & 0xff) / 255.0;
      const s = (value>>8 & 0xff) / 255.0;
      const l = (value>>0 & 0xff) / 255.0;
      let r, g, b;

      if(s == 0){
          r = g = b = l; // achromatic
      } else {
          const hue2rgb = function hue2rgb(p, q, t){
              if(t < 0) t += 1;
              if(t > 1) t -= 1;
              if(t < 1/6) return p + (q - p) * 6 * t;
              if(t < 1/2) return q;
              if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
              return p;
          }

          const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          const p = 2 * l - q;
          r = hue2rgb(p, q, h + 1/3);
          g = hue2rgb(p, q, h);
          b = hue2rgb(p, q, h - 1/3);
      }

      r = Math.ceil(r * 255);
      g = Math.ceil(g * 255);
      b = Math.ceil(b * 255);

      return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    print: function(value, node) {
      node.style.backgroundColor = '#'+this.to_rgb_hex(value);
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
    print: function(value, node) {
      node.innerText = value.toLocaleDateString();
    },
  },
  distance: {
    regex: new RegExp(/([\d\.]+)\s*(\S+)/i),
    units: {
      cm: 0.01,
      feet: 0.3048,
      km: 1000,
      leagues: 5556, // 5.556 kilometres for the english league https://en.wikipedia.org/wiki/League_(unit)
      m: 1,
      meters: 1,
      miles: 1609.344,
    },
    sanitation: function(str) {
      const value_unit = this.regex.exec(str);
      return parseFloat(value_unit[1])*this.units[value_unit[2]];
    },
    print: function(value, node) {
      let unit;
      if(value > 2000) {
        unit = 'km';
        value /= 1000;
      } else if(value > 1) {
        unit = 'm';
      } else if(value > 0.01) {
        unit = 'cm';
        value *= 100;
      }
      node.innerText = value.toFixed() + unit;
    },
  },
  duration: {
    regex: new RegExp(/([\d\.]+)\s*(\S)/i),
    sanitation: function(str) {
      var seconds = 1;
      var dur_parts = this.regex.exec(str);
      if(dur_parts) {
        seconds *= time_unit(dur_parts[2]);
        seconds *= parseFloat(dur_parts[1]);
      }
      return seconds;
    },
    print: function(value, node) {
      node.innerText = value+'s';
    }
  },
  element: {
    sanitation: function(str) {
      return Number(str);
    },
    print: function(value, node) {
      node.innerText = value;
    },
  },
  letter: {
    sanitation: function(value) {
      return value.toUpperCase().charCodeAt(0);
    },
    print: function(value, node) {
      node.innerText = String.fromCharCode(value);
    },
  },
  mass: {
    regex: new RegExp(/([\d\.]+)\s*(\S+)/i),
    units: {
      g: 1,
      kg: 1000,
      lb: 453.5924,
    },
    sanitation: function(str) {
      const value_unit = this.regex.exec(str);
      return parseFloat(value_unit[1])*this.units[value_unit[2]];
    },
    print: function(value, node) {
      let unit;
      if(value > 2000) {
        unit = 'kg';
        value /= 1000;
      } else {
        unit = 'g';
      }
      node.innerText = value.toFixed() + unit;
    },
  },
  number: {
    print: function(value, node) {
      node.innerText = value;
    }
  },
  price: {
    regex: new RegExp(/([\d\.]+)\s*(\S+)/i),
    sanitation: async function(str) {
      const value_code = this.regex.exec(str);
      let value = parseFloat(value_code[1]);
      let code = value_code[2];

      if(code == 'FRF') {
        value /= 6.55957;
        code = 'EUR';
      }

      const request_url = 'https://api.exchangeratesapi.io/latest?base=USD&symbols=' + code;
      const exra = JSON.parse(await xhr(request_url));
      const rate = exra.rates[code];

      return (value / rate).toFixed(2);
    },
    print: function(value, node) {
      node.innerText = value + ' USD';
    }
  },
};

window.addEventListener('load', async function() {
  for(let entry of db) {
    for(let key in entry) {
      if(db_criteria[key] && db_criteria[key].sanitation) {
        entry[key] = await db_criteria[key].sanitation(entry[key]);
      }
    }
  }
});
