const dist_units = [
  {sym:'mm', mul:0.001, display:true},
  {sym:'cm', mul:0.01, display:true},
  {sym:'in', mul:0.0254},
  {sym:'inch', mul:0.0254},
  {sym:'inches', mul:0.0254},
  {sym:'feet', mul:0.3048},
  {sym:'step', mul:0.74},
  {sym:'steps', mul:0.74}, // https://en.wikipedia.org/wiki/Step_(unit)
  {sym:'m', mul:1, display:true},
  {sym:'meters', mul:1},
  {sym:'km', mul:1000, display:true},
  {sym:'miles', mul:1609.344},
  {sym:'M', mul:1852}, // https://en.wikipedia.org/wiki/Nautical_mile
  {sym:'leagues', mul:5556}, // 5.556 kilometres for the english league https://en.wikipedia.org/wiki/League_(unit)
  {sym:'Mm', mul:1000000, display:true},
];

const mass_units = [
  {sym:'g', mul:1, display:true},
  {sym:'lb', mul:453.5924},
  {sym:'kg', mul:1000, display:true},
  {sym:'t', mul:1000000, display:true},
  {sym:'kt', mul:1000000000, display:true},
  {sym:'Mt', mul:1000000000000, display:true},
  {sym:'Gt', mul:1000000000000000, display:true},
];

const price_units = [
  {sym:' USD', mul:1, display:true},
  {sym:'K USD', mul:1000, display:true},
  {sym:'M USD', mul:1000000, display:true},
  {sym:'B USD', mul:1000000000, display:true},
  {sym:'T USD', mul:1000000000000, display:true},
];

const speed_units = [
  {sym:'ms⁻¹', mul:1, display:true},
  {sym:'kms⁻¹', mul:1000, display:true},
];

const time_units = [
  {sym:'s', mul:1, display:true},
  {sym:'m', mul:60, display:true},
  {sym:'min', mul:60},
  {sym:'h', mul:60*60, display:true},
  {sym:'hour', mul:60*60},
  {sym:'d', mul:60*60*24, display:true},
  {sym:'day', mul:60*60*24},
  {sym:'w', mul:60*60*24*7, display:true},
  {sym:'week', mul:60*60*24*7},
  {sym:'mo', mul:31557600/12, display:true},
  {sym:'month', mul:31557600/12},
  {sym:'y', mul:31557600, display:true},
];

function unit_mul(units, sym) {
  return units.find(unit => {
    return unit.sym == sym;
  }).mul;
}

function unit_display(units, value) {
  for(let i = units.length -1; i >= 0; i--) {
    const unit = units[i];
    if(unit.display && (value >= unit.mul || i == 0)) {
      value /= unit.mul;
      if(Math.floor(value) != value) {
        value = value.toFixed(2).replace(/0+$/, '');
      }
      return value + unit.sym;
    }
  }
}
