// Local storage helper
try {
  storage = JSON.parse(localStorage.json);
} catch(e) {
  storage = {};
}
window.addEventListener('unload', function() {
  try {
    localStorage.json = JSON.stringify(storage);
  } catch(e) {}
});
