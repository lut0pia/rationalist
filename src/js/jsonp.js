async function jsonp(url, funcname) {
  return new Promise(function(resolve, reject) {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    document.head.appendChild(script);
    window[funcname] = function(result) {
      delete window[funcname];
      document.head.removeChild(script);
      resolve(result);
    }
  });
}
