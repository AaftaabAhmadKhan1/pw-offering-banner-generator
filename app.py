"""
OFFERING BANNER GENERATOR
Run: python app.py
Open: http://localhost:5000
"""

from pathlib import Path

from flask import Flask, render_template, send_from_directory


ROOT = Path(__file__).parent
app = Flask(
    __name__,
    template_folder=str(ROOT / "templates"),
    static_folder=str(ROOT / "static"),
)
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/icon.jpg")
def icon_file():
    return send_from_directory(ROOT, "icon.jpg")


if __name__ == "__main__":
    print("\n" + "=" * 54)
    print("  OFFERING BANNER GENERATOR")
    print("  URL: http://localhost:5000")
    print("=" * 54 + "\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
