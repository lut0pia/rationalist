window.onload = function() {
  var search_type_select = document.getElementById('search_type');
  var search_criterion_select = document.getElementById('search_criterion');
  var results_div = document.getElementById('results');
  
  search_type_select.innerHTML += '<option value="">everything</option>';
  for(var type in db_types)
    search_type_select.innerHTML += '<option value="'+type+'">'+db_types[type].plural+'</option>';
  
  for(var crit in db_criteria)
    search_criterion_select.innerHTML += '<option value="'+crit+'">'+crit+'</option>';

  document.getElementById('search_button').onclick = function() {
    var query = {type:search_type_select.value,criterion:search_criterion_select.value};

    if(query.type=='') query.type = false; // Select everything

    var results = search(query);
    results_div.innerHTML = '';
    var criterion = db_criteria[query.criterion];
    for(var i in results) {
      var entry = db[results[i]];
      var index = criterion.print(entry[query.criterion]);
      var url = db_types[entry.type].url(entry);
      results_div.innerHTML +=
        '<article>'
        +'<index>'+index+'</index>'
        +'<title>'+entry.title+'</title>'
        +'<a href="'+url+'" target="_blank" rel="noopener">☞ Check it out!</a>'
        +'</article>';
    }
  }  
}
