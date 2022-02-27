import json
from math import inf
from time import sleep
from urllib import parse
import requests
import re

criteria = [
    "color", "date", "distance", "duration",
    "element", "letter", "mass", "number",
    "ordinal", "price", "speed"
]


class Entry:
    def __init__(self, title,
                 color=None, date=None, distance=None, duration=None,
                 element=None, letter=None, mass=None, number=None,
                 ordinal=None, price=None, speed=None):
        self.title = title

        self.color = color
        self.date = date
        self.distance = distance
        self.duration = duration
        self.element = element
        self.letter = letter
        self.mass = mass
        self.number = number
        self.ordinal = ordinal
        self.price = price
        self.speed = speed

        if color != None:
            assert(isinstance(color, str) and len(color) == 6)

        if date != None:
            assert(isinstance(date, str))

        if distance != None:
            assert(isinstance(distance, str))

        if duration != None:
            assert(isinstance(duration, str))

        if element != None:
            assert(isinstance(element, int))

        if letter != None:
            assert(isinstance(letter, str) and len(letter) == 1)

        if mass != None:
            assert(isinstance(mass, str))

        if number != None:
            assert(isinstance(number, int) or isinstance(number, float))

        if ordinal != None:
            assert(isinstance(ordinal, int))

        if price != None:
            assert(isinstance(price, str))

        if speed != None:
            assert(isinstance(speed, str))

    async def fetch_json(self, url):
        sleep(1)
        return requests.get(url).json()

    def to_json(self):
        out = {
            "title": self.title,
            "url": f"https://en.wikipedia.org/wiki/Special:Search/{parse.quote_plus(self.title)}",
        }

        for criterion in criteria:
            value = getattr(self, criterion, None)
            if value != None:
                out[criterion] = value

        return out

    async def to_json_imdb(self, types):
        out = {
            "url": f"https://www.imdb.com/find?q={parse.quote_plus(self.title)}"
        }
        var_safe_title = re.sub("\\W", "", self.title.replace(" ", "_"))
        first_letter = var_safe_title[0].lower()
        request_url = f"https://sg.media-imdb.com/suggests/{first_letter}/{var_safe_title}.json"
        func_name = 'imdb$' + var_safe_title
        imdb = requests.get(request_url).text
        imdb = imdb.replace(func_name + "(", "")[:-1]
        imdb = json.loads(imdb)

        def keep_letters(t):
            return re.sub("[^a-z]", "", t, flags=re.IGNORECASE).lower()

        def content_score(c):
            score = ((c["l"].lower() == self.title.lower()) * 2
                     + (keep_letters(c["l"]) == keep_letters(self.title))
                     + ("i" in c))
            return score
        contents = list(filter(lambda c: "q" in c and c["q"] in types, imdb["d"]))
        contents.sort(key=content_score, reverse=True)
        content = next(iter(contents), None)
        if content != None:
            out["found_title"] = content["l"]
            out["url"] = f"https://www.imdb.com/title/{content['id']}"
            if "i" in content:
                out["img"] = content["i"][0].replace("._V1_.jpg", "._V1_UY64_0,0,64,64_AL_.jpg")

        return out


class Book(Entry):
    async def to_json(self):
        out = Entry.to_json(self)
        out["type"] = "book"
        return out


class Movie(Entry):
    async def to_json(self):
        out = Entry.to_json(self)
        out["type"] = "movie"
        return {**out, **await self.to_json_imdb(["feature", "TV movie", "video"])}


class Music(Entry):
    async def to_json(self):
        out = Entry.to_json(self)
        out["type"] = "music"
        search_query = await self.fetch_json(f"https://musicbrainz.org/ws/2/artist/?query={parse.quote_plus(self.title)}&fmt=json")
        if len(search_query["artists"]) == 0:
            return search_query
        artist = search_query["artists"][0]
        out["found_title"] = artist["name"]

        artist_query = await self.fetch_json(f"https://musicbrainz.org/ws/2/artist/{artist['id']}?inc=release-groups+url-rels&fmt=json")
        wikidata_id = None

        url_score = inf
        url_types = ["official homepage", "free streaming", "streaming"]
        for relation in artist_query["relations"]:
            if relation["type"] == "wikidata":
                wikidata_id = relation["url"]["resource"].split("/")[-1]
            elif relation["type"] in url_types and url_types.index(relation["type"]) < url_score:
                out["url"] = relation["url"]["resource"]
                url_score = url_types.index(relation["type"])

        # Follow wikidata to find info
        if wikidata_id != None:
            pass

        # Use first album cover as img
        if len(artist_query["release-groups"]) > 0:
            release_group = artist_query["release-groups"][0]
            try:
                cover_query = await self.fetch_json(f"https://coverartarchive.org/release-group/{release_group['id']}")
                if len(cover_query["images"]) > 0:
                    out["img"] = cover_query["images"][0]["thumbnails"]["small"]
            except:
                pass

        return out


class TVShow(Entry):
    async def to_json(self):
        out = Entry.to_json(self)
        out["type"] = "tv_show"
        return {**out, **await self.to_json_imdb(["TV series", "TV mini-series"])}


class VideoGame(Entry):
    async def to_json(self):
        out = Entry.to_json(self)
        out["type"] = "video_game"
        return {**out, **await self.to_json_imdb(["video game"])}
