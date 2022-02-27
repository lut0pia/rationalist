import asyncio
import json

import db


async def update():
    output = []

    db.entries.sort(key=lambda e: e.title.lower())

    for entry in db.entries:
        print(f"Processing {entry.title}...")
        output.append(await entry.to_json())

    with open("src/js/db.js", "w") as db_out:
        db_out.write("const db = ")
        json.dump(output, db_out, indent=2, sort_keys=True)
        db_out.write(";")

asyncio.run(update())
