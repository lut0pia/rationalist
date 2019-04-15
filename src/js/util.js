function time_unit(u) {
  var seconds = 1;
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
