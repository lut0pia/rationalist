function time_unit(u) {
  let seconds = 1;
  switch(u) {
    case 'y': return seconds * 31557600;
    case 'w': seconds *= 7;
    case 'd': seconds *= 24;
    case 'h': seconds *= 60;
    case 'm': seconds *= 60;
    //case 's': seconds *= 1;
    break;
  }
  return seconds;
}

function dist_unit(u) {
  return {
    cm: 0.01,
    feet: 0.3048,
    km: 1000,
    leagues: 5556, // 5.556 kilometres for the english league https://en.wikipedia.org/wiki/League_(unit)
    m: 1,
    meters: 1,
    miles: 1609.344,
    mm: 0.001,
    step: 0.74, // https://en.wikipedia.org/wiki/Step_(unit)
  }[u];
}
