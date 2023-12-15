import json
import re
from math import inf
from time import sleep
from urllib import parse

import requests
from requests.structures import CaseInsensitiveDict

criteria = [
    "color", "date", "distance", "duration",
    "element", "letter", "mass", "number",
    "ordinal", "price", "speed"
]


class Entry:
    def __init__(self, title,
                 color=None, date=None, distance=None, duration=None,
                 element=None, letter=None, mass=None, number=None,
                 ordinal=None, price=None, speed=None,
                 year_hint=None):
        self.title = title
        self.year_hint = year_hint

        if color != None:
            assert(isinstance(color, str) and len(color) == 6)
            self.color = color

        if date != None:
            assert(isinstance(date, str))
            self.date = date

        if distance != None:
            assert(isinstance(distance, str) and not " " in distance)
            self.distance = distance

        if duration != None:
            assert(isinstance(duration, str))
            self.duration = duration

        if element != None:
            assert(isinstance(element, int))
            self.element = element

        if letter != None:
            assert(isinstance(letter, str) and len(letter) == 1)
            self.letter = letter

        if mass != None:
            assert(isinstance(mass, str))
            self.mass = mass

        if number != None:
            assert(isinstance(number, int) or isinstance(number, float))
            self.number = number

        if ordinal != None:
            assert(isinstance(ordinal, int))
            self.ordinal = ordinal

        if price != None:
            assert(isinstance(price, str))
            self.price = price

        if speed != None:
            assert(isinstance(speed, str))
            self.speed = speed

    async def fetch_json(self, url):
        if "musicbrainz.org" in url or "wikidata.org" in url:
            sleep(1)
        headers = CaseInsensitiveDict()
        headers["Accept"] = "application/json"
        return requests.get(url, headers=headers).json()

    async def wikidata_query(self, query):
        results = await self.fetch_json(f"https://query.wikidata.org/sparql?query={parse.quote_plus(query)}")
        return results["results"]["bindings"]

    def to_json(self):
        out = {
            "title": self.title,
            "url": f"https://en.wikipedia.org/wiki/Special:Search/{self.title}",
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
        var_safe_title = self.title.replace(" ", "_")
        if self.year_hint:
            var_safe_title += "_" + str(self.year_hint)
        first_letter = var_safe_title[0].lower()
        request_url = f"https://sg.media-imdb.com/suggests/{first_letter}/{var_safe_title}.json"
        imdb = requests.get(request_url).text
        imdb = imdb[imdb.find("(")+1:-1]
        imdb = json.loads(imdb)

        def keep_letters(t):
            return re.sub("[^a-z]", "", t, flags=re.IGNORECASE).lower()

        def content_score(c):
            score = ((c["l"].lower() == self.title.lower()) * 2
                     + ("y" in c and c["y"] == self.year_hint) * 2
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
            if "y" in content:
                out["year"] = content["y"]

        return out

    async def to_json_wikidata(
            self, instance_of,
            image_props=[
                "P154",  # Logo
                "P18",  # Image
            ]):
        out = {}

        safe_title = self.title.replace("'", "\\'")
        query = "SELECT * WHERE {{"
        query += f"?entity rdfs:label '{safe_title}'@en;"
        query += "wdt:P31 ?instanceOf;"
        query += f"filter({' || '.join(map(lambda i: f'?instanceOf = wd:{i}',instance_of))})"
        query += "}}"

        results = await self.wikidata_query(query)

        if len(results) == 0:
            print(f"Could not find {self.title} in Wikidata")
            return out

        id = results[0]["entity"]["value"].split("/")[-1]

        data = await self.fetch_json(f"https://www.wikidata.org/wiki/Special:EntityData/{id}.json")
        data = data["entities"][id]

        def find_prop_value(props, type):
            for prop in props:
                if prop in data["claims"]:
                    for claim in data["claims"][prop]:
                        if claim["mainsnak"]["datatype"] == type:
                            return claim['mainsnak']['datavalue']['value']
            return None

        image_value = find_prop_value(image_props, "commonsMedia")
        if image_value:
            img_info = await self.fetch_json(f"https://api.wikimedia.org/core/v1/commons/file/File:{image_value}")
            out["img"] = img_info["preferred"]["url"]

        year_value = find_prop_value([
            "P577",  # Publication date
            "P571",  # Inception
        ], "time")
        if year_value:
            out["year"] = int(year_value["time"][1:5])

        return out


class Book(Entry):
    async def to_json(self):
        out = Entry.to_json(self)
        out["type"] = "book"
        return {**out, **await self.to_json_wikidata([
            "Q7725634",  # Literary work
            "Q47461344",  # Written work
            "Q17537576",  # Creative work
        ])}


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
        url_types = ["free streaming", "streaming"]
        for relation in artist_query["relations"]:
            if relation["type"] == "wikidata":
                wikidata_id = relation["url"]["resource"].split("/")[-1]
            elif relation["type"] in url_types and url_types.index(relation["type"]) < url_score:
                out["url"] = relation["url"]["resource"]
                url_score = url_types.index(relation["type"])

        first_release_group = None
        for release_group in artist_query["release-groups"]:
            if (release_group["first-release-date"] != ''
                and (not first_release_group
                     or release_group["first-release-date"] < first_release_group["first-release-date"])):
                first_release_group = release_group

        # Year
        if artist_query["life-span"]["begin"] != None and len(artist_query["life-span"]["begin"]) == 4:
            out["year"] = int(artist_query["life-span"]["begin"])
        elif first_release_group:
            out["year"] = int(first_release_group["first-release-date"][:4])

        # Use first album cover as img
        if len(artist_query["release-groups"]) > 0:
            release_group = artist_query["release-groups"][0]
            try:
                cover_query = await self.fetch_json(f"https://coverartarchive.org/release-group/{release_group['id']}")
                if len(cover_query["images"]) > 0:
                    out["img"] = cover_query["images"][0]["thumbnails"]["small"]
            except:
                pass

        # Follow wikidata to find info
        if wikidata_id != None:
            out = {**out, **await self.to_json_wikidata(
                instance_of=[
                    "Q215380",  # Musical group
                    "Q5741069",
                ],
                image_props=[
                    "P154",  # Logo
                ])}

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
