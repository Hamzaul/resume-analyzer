const analyzeBtn = document.getElementById("analyzeBtn");
const resumeUpload = document.getElementById("resumeUpload");
const manualSkills = document.getElementById("manualSkills");

// Add a floating message box dynamically
let messageBox = document.createElement("div");
messageBox.id = "messageBox";
messageBox.style.cssText = `
  text-align: center;
  color: #fff;
  margin-top: 15px;
  font-size: 1rem;
`;
document.querySelector(".upload-card").appendChild(messageBox);

analyzeBtn.addEventListener("click", async () => {
  const resumeFile = resumeUpload.files[0];
  const skills = manualSkills.value.trim();

  if (!resumeFile && !skills) {
    messageBox.innerHTML = "⚠️ Please upload a resume or enter your skills!";
    return;
  }

  // Start loading animation
  analyzeBtn.classList.add("loading");
  messageBox.innerHTML = "⏳ Analyzing your resume... Please wait.";

  const formData = new FormData();
  if (resumeFile) formData.append("resume", resumeFile);
  if (skills) formData.append("skills", skills);

  try {
    const response = await fetch("/analyze", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      messageBox.innerHTML = "✅ Analysis complete! Scroll down for details.";
      showAnalysis(data.analysis);
    } else {
      messageBox.innerHTML = `❌ Error: ${data.error}`;
    }
  } catch (error) {
    console.error(error);
    messageBox.innerHTML = "❌ Something went wrong while analyzing.";
  }

  analyzeBtn.classList.remove("loading");
});

function showAnalysis(text) {
  let resultContainer = document.getElementById("resultContainer");
  if (!resultContainer) {
    resultContainer = document.createElement("div");
    resultContainer.id = "resultContainer";
    resultContainer.style.cssText = `
      background: #fff;
      color: #000;
      margin: 30px auto;
      padding: 20px;
      border-radius: 12px;
      width: 80%;
      max-width: 800px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      font-family: 'Poppins', sans-serif;
      line-height: 1.6;
    `;
    document.body.appendChild(resultContainer);
  }
  resultContainer.innerHTML = `<h2>AI Resume Feedback</h2><p>${text.replace(/\n/g, "<br>")}</p>`;
}
