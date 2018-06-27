var db_types = {
  movie: {
    plural: 'movies',
    url: function(entry) {
      return 'https://www.imdb.com/find?q='+encodeURIComponent(entry.title);
    },
  },
  music: {
    plural: 'songs',
    url: function(entry) {
      return 'https://www.youtube.com/results?search_query='+encodeURIComponent(entry.title);
    },
  },
  shows: {
    plural: 'shows',
    url: function(entry) {
      return 'https://www.imdb.com/find?q='+encodeURIComponent(entry.title);
    },
  },
  book: {
    plural: 'books',
    url: function(entry) {
      return 'https://en.wikipedia.org/wiki/Special:Search/'+encodeURIComponent(entry.title);
    }
  }
};
