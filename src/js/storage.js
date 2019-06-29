// Local storage helper
const current_storage_version = 1;

try {
  storage = JSON.parse(localStorage.json);
} catch(e) {
  storage = {};
}

if(!storage.version || storage.version < current_storage_version) {
  storage = {
    version: current_storage_version,
  };
}

window.addEventListener('unload', function() {
  try {
    localStorage.json = JSON.stringify(storage);
  } catch(e) {}
});
