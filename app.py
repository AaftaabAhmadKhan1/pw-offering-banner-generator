"""
OFFERING BANNER GENERATOR
Run: python app.py
Open: http://localhost:5000
"""

from pathlib import Path
import os
import pandas as pd
from io import BytesIO

from flask import Flask, render_template, send_from_directory, request, jsonify, send_file


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

@app.route("/download-sample")
def download_sample():
    df = pd.DataFrame({
        "theme": ["basic", "infinity", "pro"],
        "platforms": ["app", "app,web", "web"],
        "modes": ["light", "dark", "light,dark"],
        "features": ["100+ Live Classes, Free Notes", "Unlimited Mock Tests, 24/7 Doubt Solving", "1-on-1 Mentorship, Personal Guide"]
    })
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Sheet1')
    output.seek(0)
    return send_file(output, download_name="bulk_offering_sample.xlsx", as_attachment=True)

@app.route("/upload-bulk", methods=["POST"])
def upload_bulk():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)
        
        # Parse data
        banners = []
        for index, row in df.iterrows():
            item = {
                "theme": str(row.get("theme", "basic")).strip().lower(),
                "platforms": [p.strip().lower() for p in str(row.get("platforms", "app")).split(",")],
                "modes": [m.strip().lower() for m in str(row.get("modes", "light")).split(",")],
                "features": [f.strip() for f in str(row.get("features", "")).split(",") if f.strip()]
            }
            banners.append(item)
            
        return jsonify({"success": True, "banners": banners})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n" + "=" * 54)
    print("  OFFERING BANNER GENERATOR")
    print("  URL: http://localhost:5000")
    print("=" * 54 + "\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
