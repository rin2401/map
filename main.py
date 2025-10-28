from pathlib import Path
from flask import Flask, render_template

# Use the current directory as the template folder so we don't need to move index.html
BASE_DIR = Path(__file__).resolve().parent
app = Flask(__name__, template_folder=str(BASE_DIR))


@app.get("/")
def index():
    return render_template("index.html")


if __name__ == "__main__":
    # Debug mode with auto-reload
    app.run(host="0.0.0.0", port=9000, debug=True)
