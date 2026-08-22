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

PROGRESS_ORDER = ["locked", "unlocked", "loading", "hero", "gallery", "letter", "finale", "one_last_thing", "hug", "midnight", "final_photo"]
LETTER_TEXT = """Nuvvu ante naaku chala ishtam. Chala ani cheppadam kuda takkuve, endukante nuvvu naaku just ishtam kaadu — nuvve naa pranam. ❤️

Nee navvu, nee care, nee tho maatladina prathi chinna moment… naa ordinary days ni kuda special ga marchestayi. Nuvvu naa life lo vachina taruvatha, konni simple moments kuda naaku beautiful memories ayyayi.

Ee birthday roju, naa manasulo unna oka chinna maata cheppali anipisthundi — ninnu kalavadam naa life lo jarigina beautiful things lo okati. Nuvvu happy ga unte chalu, aa happiness lo nenu oka small reason aina naaku chaalu.

Nee dreams anni nijam avvali. Nee face lo ee beautiful smile eppudu undali. Life lo enni changes vachina, enni years gadichina, nee happiness ni ilaane celebrate cheyyalani korukuntunna.

Happy Birthday, naa Ammulu. ❤️

Nuvvu naaku entha specialo words tho complete ga cheppalenu.

I love you, always. ❤️"""

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


@app.context_processor
def inject_memory_photos() -> dict[str, list[str]]:
    return {"memory_photos": gallery_images()}


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


@app.get("/one-last-thing")
def one_last_thing_page():
    if not access_allowed("finale"):
        return redirect("/")
    session["progress"] = "one_last_thing"
    return render_template("one_last_thing.html")


@app.get("/hug")
def hug_page():
    if not access_allowed("one_last_thing"):
        return redirect("/")
    session["progress"] = "hug"
    return render_template("hug.html")


@app.get("/midnight")
def midnight_page():
    if not access_allowed("hug"):
        return redirect("/")
    session["progress"] = "midnight"
    return render_template("midnight.html")


@app.get("/final-photo")
def final_photo_page():
    if not access_allowed("midnight"):
        return redirect("/")
    session["progress"] = "final_photo"
    return render_template("final_photo.html")


@app.get("/health")
def health_check():
    return jsonify({"status": "ok", "progress": current_progress()})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
