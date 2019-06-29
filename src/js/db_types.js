const db_types = {
  movie: {
    plural: 'movies',
    info: async function(entry) {
      return imdb_info(entry, 'feature');
    },
  },
  music: {
    plural: 'songs',
    info: async function(entry) {
      return {
        url: 'https://www.youtube.com/results?search_query='+encodeURIComponent(entry.title),
      };
    },
  },
  show: {
    plural: 'shows',
    info: async function(entry) {
      return await imdb_info(entry, 'TV series');
    },
  },
  book: {
    plural: 'books',
    info: async function(entry) {
      return {
        url: 'https://en.wikipedia.org/wiki/Special:Search/'+encodeURIComponent(entry.title),
      };
    }
  },
  vgame: {
    plural: 'video games',
    info: async function(entry) {
      return await imdb_info(entry, 'video game');
    },
  },
};

async function imdb_info(entry, type) {
  const var_safe_title = entry.imdb || entry.title.replace(/ /gi, '_').replace(/\W/gi, '');
  const first_letter = var_safe_title.substr(0, 1).toLowerCase();
  const request_url = 'https://sg.media-imdb.com/suggests/' + first_letter + '/' + var_safe_title + '.json';
  const func_name = 'imdb$' + var_safe_title;
  const imdb = await jsonp(request_url, func_name);
  const content = imdb.d.find(function(content) {
    return content.q == type && content.l == entry.title;
  }) || imdb.d.find(function(content) {
    return content.q == type;
  });
  return content ? {
    img: content.i[0].replace("._V1_.jpg", "._V1_UY64_0,0,64,64_AL_.jpg"),
    url:'https://www.imdb.com/title/' + content.id,
  } : {
    url: 'https://www.imdb.com/find?q='+encodeURIComponent(entry.title),
  };
}
