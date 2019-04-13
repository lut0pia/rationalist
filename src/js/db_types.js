const db_types = {
  movie: {
    plural: 'movies',
    info: async function(entry) {
      return {
        url:'https://www.imdb.com/find?q='+encodeURIComponent(entry.title),
      };
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
    info: function(entry) {
      return {
        url: 'https://www.imdb.com/find?q='+encodeURIComponent(entry.title),
      };
    },
  },
  book: {
    plural: 'books',
    info: function(entry) {
      return {
        url: 'https://en.wikipedia.org/wiki/Special:Search/'+encodeURIComponent(entry.title),
      };
    }
  },
};
