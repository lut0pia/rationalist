# rationalist

## What is this?

Useless database/website to sort movies/songs/shows by absurd criteria based on title only (colors, numbers, etc.).

Live at [rationalist.lucien.cat](http://rationalist.lucien.cat)

## Contributing

I'm definitely open to contributions, especially content additions, but also style modifications or new functionality.

### Contribution guidelines

- Use 2-spaces indenting
- Do not include any dependency on other software (there may be some in the future but I'll be the judge of that)

### Submiting Data

- New entries should be added to the `db.js` file
- The entries data should only be added if they can be indirectly be inferred from the title of the Entry alone. If you should watch the movie/read the book/listen to the music to know the value of the data, it's not good.
- Example : `{type:'book', title:'From the Earth to the Moon', distance: '384400 km'}`
  - `type` is any type found in `db_type.js`
  - `title` is the title of the entry, typicaly the one you would found on it's wikipedia page
  - The other data are the ones found in `db_criteria.js`, like `color`, `date`, `distance`, `duration`, `number`. Values like distance and time can be converted from usual units. To see the list of units, check the criteria entry in the `db_criteria.js`
