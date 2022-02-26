const db_criteria = {
  color: {
    icon: '🎨',
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
    icon: '📅',
    relative_regex: new RegExp(/(\S)(\+|\-)(\d+)/i),
    bc_regex: new RegExp(/\-(\d+)/i),
    pack_date: function(d, m, y) {
      return d + (m << 5) + (y << 14);
    },
    unpack_date: function(p) {
      return {
        d: p % 32,
        m: (p >> 5) & 0xf,
        y: (p >> 14),
      };
    },
    sanitation: function(str) {
      const bc = this.bc_regex.exec(str);
      if(bc) {
        return - (bc[1] << 14);
      }

      const relative = this.relative_regex.exec(str);
      let date;
      if(relative) {
        let add_ms = 1000;
        add_ms *= unit_mul(time_units, relative[1]);
        if(relative[2]=='-') add_ms *= -1;
        add_ms *= parseFloat(relative[3]);
        date = new Date(Date.now()+add_ms);
      } else {
        date = new Date(str);
      }

      return this.pack_date(date.getDate(), date.getMonth() + 1, date.getFullYear());
    },
    print: function(value, node) {
      const date = this.unpack_date(value);
      if(value >= 0) {
        node.innerText = date.d.toString().padStart(2, '0')
          + '/' + date.m.toString().padStart(2, '0')
          + '/' + date.y.toString();
      } else {
        node.innerText = Math.abs(date.y) + ' BC';
      }
    },
  },
  distance: {
    icon: '📏',
    regex: new RegExp(/([\d\.]+)\s*(\S+)/i),
    sanitation: function(str) {
      const value_unit = this.regex.exec(str);
      return parseFloat(value_unit[1]) * unit_mul(dist_units, value_unit[2]);
    },
    print: function(value, node) {
      node.innerText = unit_display(dist_units, value);
    },
  },
  duration: {
    icon: '⏲️',
    regex: new RegExp(/([\d\.]+)\s*(\S)/i),
    sanitation: function(str) {
      var seconds = 1;
      var dur_parts = this.regex.exec(str);
      if(dur_parts) {
        seconds *= unit_mul(time_units, dur_parts[2]);
        seconds *= parseFloat(dur_parts[1]);
      }
      return seconds;
    },
    print: function(value, node) {
      node.innerText = unit_display(time_units, value);
    }
  },
  element: {
    icon: '🧪',
    sanitation: function(str) {
      return Number(str);
    },
    print: function(value, node) {
      node.innerText = value;
    },
  },
  letter: {
    icon: '🔤',
    sanitation: function(value) {
      return value.toUpperCase().charCodeAt(0);
    },
    print: function(value, node) {
      node.innerText = String.fromCharCode(value);
    },
  },
  mass: {
    icon: '⚖️',
    regex: new RegExp(/([\d\.]+)\s*(\S+)/i),
    sanitation: function(str) {
      const value_unit = this.regex.exec(str);
      return parseFloat(value_unit[1]) * unit_mul(mass_units, value_unit[2]);
    },
    print: function(value, node) {
      node.innerText = unit_display(mass_units, value);
    },
  },
  number: {
    icon: '#️⃣',
    print: function(value, node) {
      node.innerText = value;
    }
  },
  ordinal: {
    icon: '🥇',
    print: function(value, node) {
      switch(value) {
        case 1: node.innerText = value+'st'; break;
        case 2: node.innerText = value+'nd'; break;
        case 3: node.innerText = value+'rd'; break;
        default: node.innerText = value+'th'; break;
      }
    }
  },
  price: {
    icon: '🪙',
    regex: new RegExp(/([\d\.]+)\s*(\S+)/i),
    sanitation: async function(str) {
      const value_code = this.regex.exec(str);
      let value = parseFloat(value_code[1]);
      let code = value_code[2];

      if(code == 'FRF') { // Could handle other dead currencies but no title mentions them yet so...
        value /= 6.55957;
        code = 'EUR';
      }

      if(!this.rates) {
        try {
          if(!this.rates_request) {
            this.rates_request = xhr('https://freecurrencyapi.net/api/v2/latest?apikey=11fdc150-8b73-11ec-bee3-75b6d7af5f26');
          }
          this.rates = JSON.parse(await this.rates_request).data;
        } catch(e) {
          this.rates = {};
        }
        this.rates.USD = 1;
      }

      return code in this.rates ?  (value / this.rates[code]).toFixed(2) : 0;
    },
    print: function(value, node) {
      node.innerText = unit_display(price_units, value)
    }
  },
  speed: {
    icon: '🏎️',
    regex: new RegExp(/([\d\.]+)\s*(\S+)\s*([\d\.]+)?\s*(\S+)/i), // number / distance unit / time unit
    sanitation: async function(str) {
      const value_dist_time = this.regex.exec(str);
      const meters = parseFloat(value_dist_time[1]) * unit_mul(dist_units, value_dist_time[2]);
      const seconds = parseFloat(value_dist_time[3] || 1) * unit_mul(time_units, value_dist_time[4])
      return (meters / seconds).toFixed(2);
    },
    print: function(value, node) {
      node.innerText = unit_display(speed_units, value);
    }
  },
};
