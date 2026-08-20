from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, session, url_for

load_dotenv()

app = Flask(__name__)
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

SECRET_KEY = os.environ.get("SECRET_KEY", "").strip()
SITE_PASSCODE = os.environ.get("SITE_PASSCODE", "").strip()

if not SECRET_KEY or SECRET_KEY == "your_random_secret_key_here":
    raise RuntimeError("SECRET_KEY environment variable is required")
if not SITE_PASSCODE or SITE_PASSCODE == "your_passcode_here":
    raise RuntimeError("SITE_PASSCODE environment variable is required")

app.secret_key = SECRET_KEY

PROGRESS_ORDER = ["locked", "unlocked", "loading", "hero", "gallery", "letter", "finale"]
LETTER_TEXT = """**Naa Ammulu… ❤️**

Nuvvu ante naaku chala ishtam ani cheppadam chala chinna maata. Nijanga cheppalante, “ishtam” ane word tho naa feeling motham cheppalenu. Endukante nuvvu naaku just oka person kaadu… naa life lo oka very special part. Konni sarlu naa feelings ni words lo cheppadaniki try chesthe, words saripovu anipisthayi. Nuvvu naa life lo entha important ani explain cheyyalante, naa daggara unna prati word kuda takkuve anipisthundi.

Nee navvu naaku chala ishtam. Nuvvu navvuthunte, teliyakundaane naa face meeda kuda smile vasthundi. Nee way of talking, nee soft care, chinna chinna vishayalani kuda gurthupettukune vidhanam… ivanni naaku teliyakundane ninnu inka inka daggaraga feel avvalanipinchela chesayi.

Nuvvu naa life loki vachina taruvatha, ordinary days kuda konchem special ga anipinchayi. Oka simple conversation kuda oka memory aipoyindi. Oka small smile kuda oka beautiful moment aipoyindi. Nuvvu chesina chinna chinna things anni naaku pedda vishayalla gurthundipothayi.

Ee birthday roju, naa manasulo chala rojula nunchi dachukunna konni feelings ni konchem ekkuvaga cheppalani anipisthundi.

"Ninnu first time kiss chesinaa roju" gurinchi alochinchinappudu ippatiki naa face meeda smile vasthundi. Adhi vere vallaki chala small moment la anipinchachu… kani naaku matram adhi chala special. Endukante aa moment lo nuvvu unnava. And sometimes, oka memory special avvadaniki reason aa moment kaadu… aa moment lo unna person.

Nuvvu chala strong. At the same time, chala soft and caring. Nuvvu chala simple ga unna moments lone kuda oka special charm untundi. Nee lo unna aa combination naaku chala rare ga anipisthundi. And honestly, ade ninnu naa eyes lo inka special ga chesthundi.

Nuvvu entha mandi life lo oka smile ki reason avuthavo naaku teliyadu. Kani naa life lo matram, nuvvu chala sarlu naa smile ki reason ayyav. Nenu bad mood lo unna rojullo kuda nee oka message, nee oka maata, nee oka small gesture na mood ni marchagaligindi.

Anduke nee birthday roju nenu korukunedi okkate…

Nee life lo nuvvu deserve chese happiness motham ninnu cherukovali. Nuvvu eppudu vere vallaki ichina love, care, happiness anni double ga nee daggaraki tirigi ravali. Nuvvu silent ga carry chesina worries anni konchem konchem ga thaggipovali. Nee heart ki peace dorakali. Nee dreams anni okkokkatiga nijam avvali.

Life eppudu manam anukunna vidhamga undadu. Konni rojulu beautiful ga untayi, konni rojulu difficult ga untayi. Kani aa difficult days lo kuda, **nuvvu entha strong person vi ani eppudu marchipoku.**

Nuvvu chala valuable. Nuvvu chala loved. Nuvvu chala special.

And naa life lo nuvvu unna place ni evaritho compare cheyyalenu.

**Happy Birthday, naa Ammulu. 🎂❤️**

Ee roju nee face meeda unna smile, nee life motham lo continue avvali ani korukuntunna. Nee mundu unna prati year, ippatiki unna years kanna inka beautiful ga undali. Nuvvu kalalu kanna life kanna, nuvvu deserve chese life inka beautiful ga undali.

Nuvvu eppudu happy ga undali. Eppudu navvuthu undali. Nee heart lo unna aa beautiful person ni eppudu marchipokudadhu.

And finally…

**Ninnu entha ishtapaduthunnano cheppadaniki “I love you” ane three words kuda konni sarlu chala small ga anipisthayi.**

Nuvvu naaku **ishtam**.

Nuvvu naaku **chala special**.

Nuvvu naaku **pranam laanti person**.

And no matter how many words I write, naa heart lo nee kosam unna feeling ni complete ga explain cheyyalenu.

**I love you, Ammulu. ❤️**

**Eppatiki… naa heart lo oka special place nee kosame.**

"""

GALLERY_QUOTES = [
    "Nuvvu navvithe... naa roju complete avuthundi ❤️",
    "Every picture has a memory… every memory has you 🥹",
    "Naa favourite place ante… nee pakkane ✨",
    "Konni moments capture chestham… konni moments heart lo untayi ❤️",
    "Nee smile ki filter avasaram ledu 🌸",
    "Time marchipoyina… ee memories marchipovu 💕",
    "Life lo best surprise… ninnu kalavadam ❤️",
    "Mana story lo naa favourite chapter… nuvve 📖❤️",
    "Prathi photo oka memory… prathi memory lo nuvve 🫶",
    "Happy Birthday Ammulu… forever my favourite person 🎂❤️",
]


def current_progress() -> str:
    return session.get("progress", "locked")


def access_allowed(required_stage: str) -> bool:
    progress = current_progress()
    try:
        return PROGRESS_ORDER.index(progress) >= PROGRESS_ORDER.index(required_stage)
    except ValueError:
        return False


def gallery_images() -> list[str]:
    image_dir = Path(__file__).resolve().parent / "static" / "images"
    if not image_dir.exists():
        return ["/static/images/birthday-1.svg"]

    files = []
    for path in sorted(image_dir.iterdir()):
        if path.is_file() and path.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp", ".svg"}:
            files.append(url_for("static", filename=f"images/{path.name}"))

    if not files:
        return ["/static/images/birthday-1.svg"]
    return files


@app.get("/")
def lock_page():
    session.setdefault("progress", "locked")
    return render_template("lock.html")


@app.post("/verify-passcode")
def verify_passcode():
    if not request.is_json:
        return jsonify({"success": False, "error": "Request body must be JSON."}), 400

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"success": False, "error": "Malformed JSON body."}), 400

    passcode = str(payload.get("passcode", "")).strip()
    if not passcode:
        return jsonify({"success": False, "error": "Passcode is required."}), 400

    if passcode != SITE_PASSCODE:
        return jsonify({"success": False, "error": "Incorrect passcode."}), 401

    session["progress"] = "unlocked"
    return jsonify({"success": True, "next": "/loading"})


@app.post("/verify-puzzle")
def verify_puzzle():
    if not request.is_json:
        return jsonify({"success": False, "error": "Request body must be JSON."}), 400

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"success": False, "error": "Malformed JSON body."}), 400

    answer = str(payload.get("answer", "")).strip()
    if not answer:
        return jsonify({"success": False, "error": "Puzzle answer is required."}), 400

    if answer.casefold() != SITE_PASSCODE.casefold():
        return jsonify({"success": False, "error": "Incorrect puzzle answer."}), 401

    session["progress"] = "unlocked"
    return jsonify({"success": True, "next": "/loading"})


@app.get("/loading")
def loading_page():
    if not access_allowed("unlocked"):
        return redirect("/")
    session["progress"] = "loading"
    return render_template("loading.html")


@app.get("/hero")
def hero_page():
    if not access_allowed("loading"):
        return redirect("/")
    session["progress"] = "hero"
    return render_template("hero.html")


@app.get("/gallery")
def gallery_page():
    if not access_allowed("hero"):
        return redirect("/")
    session["progress"] = "gallery"
    return render_template("gallery.html", photos=gallery_images(), quotes=GALLERY_QUOTES)


@app.get("/letter")
def letter_page():
    if not access_allowed("gallery"):
        return redirect("/")
    session["progress"] = "letter"
    return render_template("letter.html", letter_text=LETTER_TEXT)


@app.get("/finale")
def finale_page():
    if not access_allowed("letter"):
        return redirect("/")
    session["progress"] = "finale"
    return render_template("finale.html")


@app.get("/health")
def health_check():
    return jsonify({"status": "ok", "progress": current_progress()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
