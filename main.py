from flask import Flask, render_template, request, jsonify
import PyPDF2
import os
from dotenv import load_dotenv
import google.generativeai as genai
from werkzeug.utils import secure_filename

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, "rb") as f:
        pdf = PyPDF2.PdfReader(f)
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text


def analyze_with_gemini(resume_text, skills=None):
    model = genai.GenerativeModel("gemini-2.5-flash")

    prompt = f"""
Please analyze this resume or skills input and provide constructive feedback.
Focus on content clarity, presentation of skills, experience, and suggestions for improvement. Explain in detail each and Every Point.

Resume text:
{resume_text}

Skills:
{skills if skills else "N/A"}
"""

    response = model.generate_content(prompt)
    return response.text


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        uploaded_file = request.files.get("resume")
        skills = request.form.get("skills", "")

        resume_text = ""
        if uploaded_file:
            filename = secure_filename(uploaded_file.filename)
            filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            uploaded_file.save(filepath)
            if filename.lower().endswith(".pdf"):
                resume_text = extract_text_from_pdf(filepath)
            else:
                resume_text = uploaded_file.read().decode("utf-8")

        if not resume_text and not skills:
            return jsonify({"error": "No resume or skills provided"}), 400

        analysis = analyze_with_gemini(resume_text, skills)
        return jsonify({"analysis": analysis})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
