# rationalist

## What is this?

Rationalist is a useless database/website to sort movies/songs/shows/books by absurd criteria based on title only (colors, numbers, etc.).

Live at [rationalist.lucien.cat](http://rationalist.lucien.cat)

## Contributing

Rationalist is open to contributions, especially content additions, but also style modifications or new functionality. There are some rules below but they're subject to change and up for discussion.

All values must be derived from title only, you should not have to know the content of the piece to deduce the value. All values should be deterministic, which doesn't necessarily mean that they wouldn't change over time (some dates change) or are exact, but that the result would always be consistent (for instance someone else wouldn't interpret it differently).

Any entry has to at least bring one unique value for its type/criterion pair. In case of competing entries (both bring the same value for the same type/criterion pair), the more well-known or appreciated entry remains while the other is removed. Trusted sources are preferred to determine the entry that will remain. For instance, `Black Swan` and `Black Panther` are both movies with the color black, one must be removed, according to IMDB, `Black Swan` has the better reviews, therefore it remains.

- Dependencies
  - Do not include any dependency on other software
  - Remote API requests are more likely to be accepted
- Criteria
  - Color
    - Use wikipedia to get the hex color from a color name
  - Date
    - Relative dates are allowed (e.g. `The Day After Tomorrow`)
  - Distance
  - Duration
  - Element
  - Letter
    - The letter in the title should be pronounced as the sole letter would, `a boy` does not count for the letter `A`, but `Boy A` does
  - Mass
    - Must be deterministic (the average elephant's mass for `Elephant Man` does not work)
  - Number
    - Saga numbering (e.g. `Iron Man 2`) is forbidden
    - No restriction on the format of the number (e.g. Roman numerals are ok)
- Titles
  - Currently all in english, but may change to original only
