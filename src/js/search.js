var searches = {}

function search(query) {
  // Check for already stored results
  var search_key = JSON.stringify(query);
  if(searches[search_key]) {
    return searches[search_key];
  }

  // Do search
  var results = [];
  for(var i=0;i<db.length;i++) {
    var entry = db[i];
    if(entry.hasOwnProperty(query.criterion) && (!query.type || entry.type==query.type)) {
      results.push(i);
    }
  }

  results.sort(function(a,b) {
    return db[a][query.criterion]-db[b][query.criterion];
  });

  return searches[search_key] = results;
}
