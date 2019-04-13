window.onload = function() {
  const search_type_select = document.getElementById('search_type');
  const search_criterion_select = document.getElementById('search_criterion');
  const results_div = document.getElementById('results');

  search_type_select.innerHTML += '<option value="">everything</option>';
  for(let type in db_types)
    search_type_select.innerHTML += '<option value="'+type+'">'+db_types[type].plural+'</option>';

  for(let crit in db_criteria)
    search_criterion_select.innerHTML += '<option value="'+crit+'">'+crit+'</option>';

  document.getElementById('search_button').onclick = function() {
    const query = {
      type: search_type_select.value,
      criterion: search_criterion_select.value
    };

    const results = search(query);
    results_div.innerHTML = '';
    const criterion = db_criteria[query.criterion];
    for(let i of results) {
      const entry = db[i];

      const article = document.createElement('article');
      results_div.appendChild(article);

      const index = document.createElement('index');
      article.appendChild(index);
      criterion.print(entry[query.criterion], index);

      const title = document.createElement('title');
      title.innerText = entry.title;
      article.appendChild(title);

      const a = document.createElement('a');
      article.appendChild(a);
      a.target = '_blank';
      a.rel = 'noopener';
      a.innerText = '☞ Check it out!';
      a.href = db_types[entry.type].url(entry)
    }
  }
}
