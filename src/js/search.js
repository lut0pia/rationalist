var searches = {}

function search(query) {
  // Check for already stored results
  const search_key = JSON.stringify(query);
  if(searches[search_key]) {
    return searches[search_key];
  }

  // Do search
  let results = [];
  for(let i=0;i<db.length;i++) {
    const entry = db[i];
    if(entry.hasOwnProperty(query.criterion) && (!query.type || entry.type==query.type)) {
      results.push(i);
    }
  }

  results.sort(function(a,b) {
    return db[a][query.criterion] - db[b][query.criterion];
  });

  return searches[search_key] = results;
}
