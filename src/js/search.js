var searches = {}

async function search(query) {
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
      for(let j = 0; j < entry[query.criterion].length; j++) {
        if(entry[query.criterion][j] instanceof Promise) {
          entry[query.criterion][j] = await entry[query.criterion][j];
        }
        results.push({index: i, subindex: j});
      }
    }
  }

  results.sort(function(a, b) {
    return db[a.index][query.criterion][a.subindex] - db[b.index][query.criterion][b.subindex];
  });

  return searches[search_key] = results;
}
