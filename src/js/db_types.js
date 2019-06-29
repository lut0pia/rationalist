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
      let img = undefined;
      for(let i = 0; i < 10 && !img; i++) {
        try {
          const artist = entry.title.split(' - ')[0].trim();
          const track = entry.title.split(' - ')[1].trim();
          const recordings_xml = await xhr('https://musicbrainz.org/ws/2/recording/?query=artist:' + encodeURIComponent(artist) + '%20AND%20recording:' + encodeURIComponent(track) + '%20AND%20type:album%20AND%20status:official');
          const dom_parser = new DOMParser();
          const recordings = dom_parser.parseFromString(recordings_xml, 'text/xml');
          const release_groups = recordings.getElementsByTagName('release-group');
          for(let r = 0; r < release_groups.length; r++) {
            const release_group = release_groups[r];
            if(release_group.getAttribute('type') == 'Album') {
              const release_group_id = release_group.getAttribute('id');
              try {
                const release_group_cover = JSON.parse(await xhr('https://coverartarchive.org/release-group/' + release_group_id));
                img = release_group_cover.images[0].thumbnails.small;
                console.log(img);
                break;
              } catch(e) {}
            }
          }
        } catch(e) {
          await new Promise((r) => setTimeout(r, 10000));
        }
      }
      return {
        img: img,
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
