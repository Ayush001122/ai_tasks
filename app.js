/* =========================================================
   ACADEMIAPULSE AI STUDIO
   APPLICATION CONTROLLER
========================================================= */

/* Gemini Models Registry */
const MODEL_CONFIGS = [
    { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash" },
    { id: "gemini-3.7-flash", name: "Gemini 3.7 Flash" },
    { id: "gemini-3.6-flash", name: "Gemini 3.6 Flash" },
    { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash" },
    { id: "gemini-3.5-flash-lite", name: "Gemini 3.5 Flash-Lite" },
    { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash-Lite" },
    { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash" }
];

/* Application State */
let activeModel = localStorage.getItem("acad_model") || "gemini-3.8-flash";
let userApiKey = sessionStorage.getItem("acad_gemini_key") || "";

const API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/* Study Tasks Registry */
const studyTasks = [
    {
        id: 1,
        icon: "📄",
        title: "AI Resume Builder",
        description: "Create a professional resume using your education, skills and experience."
    },
    {
        id: 2,
        icon: "📝",
        title: "AI Notes Generator",
        description: "Convert any topic into structured and easy-to-study notes."
    },
    {
        id: 3,
        icon: "📊",
        title: "AI Presentation Generator",
        description: "Generate presentation slides automatically from a topic."
    },
    {
        id: 4,
        icon: "🧠",
        title: "AI Mind Map Generator",
        description: "Create structured mind-map content for any subject."
    },
    {
        id: 5,
        icon: "📑",
        title: "Google Sheets + AI",
        description: "Analyze Google Sheets data and generate useful insights."
    },
    {
        id: 6,
        icon: "❓",
        title: "AI Quiz / MCQ Generator",
        description: "Generate multiple-choice questions for exam preparation."
    },
    {
        id: 7,
        icon: "💬",
        title: "AI Doubt-Solving Chatbot",
        description: "Ask questions and receive AI-powered explanations."
    },
    {
        id: 8,
        icon: "🎴",
        title: "AI Flashcard Generator",
        description: "Generate question-and-answer flashcards for revision."
    },
    {
        id: 9,
        icon: "📅",
        title: "AI Study Planner",
        description: "Create a personalized study schedule."
    },
    {
        id: 10,
        icon: "📷",
        title: "AI Notes from Photos",
        description: "Upload a photo of handwritten or printed notes and summarize it."
    }
];

/* DOM Element References */
const content = document.getElementById("content");
const pageTitle = document.getElementById("pageTitle");
const taskNavigation = document.getElementById("taskNavigation");
const apiKeyInput = document.getElementById("apiKeyInput");
const saveKeyBtn = document.getElementById("saveKeyBtn");
const clearKeyBtn = document.getElementById("clearKeyBtn");
const keyStatus = document.getElementById("keyStatus");
const modelSelect = document.getElementById("modelSelect");
const modelStatus = document.getElementById("modelStatus");
const testModelBtn = document.getElementById("testModelBtn");
const fallbackToggle = document.getElementById("fallbackToggle");
const homeBtn = document.getElementById("homeBtn");

/* Life Cycle Initialization */
document.addEventListener("DOMContentLoaded", () => {
    initModelSettings();
    initKeySettings();
    renderNavigationItems();
    showHome();
});

/* Settings Initialization */
function initModelSettings() {
    modelSelect.value = activeModel;
    renderModelStatus();

    modelSelect.addEventListener("change", () => {
        activeModel = modelSelect.value;
        localStorage.setItem("acad_model", activeModel);
        renderModelStatus();
        triggerToast("Selected AI model updated.");
    });

    testModelBtn.addEventListener("click", runModelTest);
}

function renderModelStatus(customMsg) {
    if (customMsg) {
        modelStatus.textContent = customMsg;
        return;
    }
    const label = getModelLabel(activeModel);
    modelStatus.innerHTML = `Active Model: <strong>${label}</strong>`;
}

function getModelLabel(id) {
    const item = MODEL_CONFIGS.find(m => m.id === id);
    return item ? item.name : id;
}

function initKeySettings() {
    if (userApiKey) {
        apiKeyInput.value = userApiKey;
        keyStatus.textContent = "Session API key stored.";
    }

    saveKeyBtn.addEventListener("click", () => {
        const val = apiKeyInput.value.trim();
        if (!val) {
            triggerToast("Please input a valid API Key.", true);
            return;
        }
        userApiKey = val;
        sessionStorage.setItem("acad_gemini_key", val);
        keyStatus.textContent = "Session API key stored.";
        triggerToast("API key saved successfully.");
    });

    clearKeyBtn.addEventListener("click", () => {
        userApiKey = "";
        sessionStorage.removeItem("acad_gemini_key");
        apiKeyInput.value = "";
        keyStatus.textContent = "API key not configured.";
        triggerToast("API key removed.");
    });
}

/* UI Renderers */
function renderNavigationItems() {
    taskNavigation.innerHTML = "";
    studyTasks.forEach(task => {
        const btn = document.createElement("button");
        btn.className = "nav-item";
        btn.innerHTML = `
            <span class="nav-item-num">${String(task.id).padStart(2, "0")}</span>
            ${task.title}
        `;
        btn.addEventListener("click", () => openTaskWorkspace(task.id));
        taskNavigation.appendChild(btn);
    });
}

function showHome() {
    pageTitle.textContent = "AcademiaPulse AI Studio";
    content.innerHTML = `
        <div class="banner-card">
            <h2>Optimize Learning with Artificial Intelligence</h2>
            <p>AcademiaPulse consolidates 10 specialized study tools into a unified interface. Select any module to begin.</p>
        </div>
        <div class="grid-layout">
            ${studyTasks.map(task => `
                <div class="card-item" onclick="openTaskWorkspace(${task.id})">
                    <div class="card-icon">${task.icon}</div>
                    <h3>${task.title}</h3>
                    <p>${task.description}</p>
                    <div class="card-action">Launch Tool →</div>
                </div>
            `).join("")}
        </div>
    `;
}

homeBtn.addEventListener("click", showHome);

function openTaskWorkspace(taskId) {
    const task = studyTasks.find(t => t.id === taskId);
    if (!task) return;

    pageTitle.textContent = task.title;
    content.innerHTML = buildWorkspaceLayout(taskId, task);
    bindTaskActions(taskId);
}

function buildWorkspaceLayout(taskId, task) {
    return `
        <div class="workspace-header">
            <button class="back-btn" onclick="showHome()">← Return</button>
            <h2>${task.icon} ${task.title}</h2>
        </div>
        <div class="split-view">
            <div class="card-panel">
                ${buildFormFields(taskId)}
            </div>
            <div class="card-panel">
                <h3>Generated Output</h3>
                <div id="result" class="output-container">
                    <div class="placeholder-text">Your AI-generated results will render here.</div>
                </div>
            </div>
        </div>
    `;
}

function buildFormFields(id) {
    if (id === 1) {
        return `
            <h3>Resume Details</h3>
            ${createField("name", "Full Name", "Enter your full name")}
            ${createField("contact", "Contact Info", "Email, Phone, LinkedIn")}
            ${createTextarea("education", "Education History", "Degrees, certifications...")}
            ${createTextarea("skills", "Core Skills", "Technical & soft skills")}
            ${createTextarea("experience", "Work Experience", "Past job roles and highlights")}
            ${createTextarea("objective", "Career Objective", "Target job role or goals")}
            ${createSubmitBtn("Generate Resume")}
        `;
    }
    if (id === 2) {
        return `
            <h3>Notes Generator</h3>
            ${createField("topic", "Subject Matter", "Enter topic")}
            ${createTextarea("notesLevel", "Target Level", "High School / University / Professional")}
            ${createTextarea("notesExtra", "Special Focus", "Optional specific requirements")}
            ${createSubmitBtn("Generate Notes")}
        `;
    }
    if (id === 3) {
        return `
            <h3>Presentation Generator</h3>
            ${createField("presentationTopic", "Presentation Subject", "Enter topic")}
            ${createField("slideCount", "Total Slides", "e.g., 8")}
            ${createTextarea("presentationAudience", "Audience Type", "Target audience demographic")}
            ${createSubmitBtn("Generate Presentation")}
        `;
    }
    if (id === 4) {
        return `
            <h3>Mind Map Generator</h3>
            ${createField("mindTopic", "Core Concept", "e.g., Machine Learning")}
            ${createTextarea("mindDetails", "Key Subtopics", "Optional context")}
            ${createSubmitBtn("Generate Mind Map")}
        `;
    }
    if (id === 5) {
        return `
            <h3>Google Sheets + AI</h3>
            ${createField("sheetUrl", "Apps Script Web App URL", "Paste published Web App URL")}
            ${createTextarea("sheetQuestion", "Analysis Goal", "What insights do you need?")}
            ${createSubmitBtn("Analyze Sheet")}
        `;
    }
    if (id === 6) {
        return `
            <h3>Quiz Generator</h3>
            ${createField("quizTopic", "Quiz Topic", "e.g., Data Structures")}
            ${createField("quizCount", "Question Count", "e.g., 10")}
            ${createField("quizLevel", "Difficulty", "Easy / Medium / Hard")}
            ${createSubmitBtn("Generate Quiz")}
        `;
    }
    if (id === 7) {
        return `
            <h3>Ask Your Doubt</h3>
            <div id="chatBox" class="chat-display">
                <div class="chat-bubble ai-bubble">Hello! Ask me any study-related question.</div>
            </div>
            <div class="chat-controls">
                <input id="chatInput" type="text" placeholder="Type your doubt here...">
                <button id="chatSend">Send</button>
            </div>
        `;
    }
    if (id === 8) {
        return `
            <h3>Flashcard Generator</h3>
            ${createField("flashTopic", "Subject Topic", "Enter topic")}
            ${createField("flashCount", "Quantity", "e.g., 10")}
            ${createTextarea("flashLevel", "Target Level", "Beginner / Intermediate / Advanced")}
            ${createSubmitBtn("Generate Flashcards")}
        `;
    }
    if (id === 9) {
        return `
            <h3>Study Planner</h3>
            ${createField("planSubject", "Course Subject", "e.g., Organic Chemistry")}
            ${createField("planDays", "Plan Duration (Days)", "e.g., 14")}
            ${createField("planHours", "Daily Hours", "e.g., 3")}
            ${createTextarea("planTopics", "Topics to Cover", "List syllabus items")}
            ${createSubmitBtn("Create Study Plan")}
        `;
    }
    if (id === 10) {
        return `
            <h3>Notes from Photo</h3>
            <input id="photoInput" class="custom-file-input" type="file" accept="image/*">
            ${createTextarea("photoInstruction", "Processing Instruction", "Summarize and highlight main points.")}
            ${createSubmitBtn("Analyze Photo")}
        `;
    }
    return "";
}

function createField(id, label, placeholder) {
    return `
        <div class="field-group">
            <label>${label}</label>
            <input id="${id}" class="input-control" type="text" placeholder="${placeholder}">
        </div>
    `;
}

function createTextarea(id, label, placeholder) {
    return `
        <div class="field-group">
            <label>${label}</label>
            <textarea id="${id}" class="input-control" placeholder="${placeholder}"></textarea>
        </div>
    `;
}

function createSubmitBtn(label) {
    return `
        <button id="generateBtn" class="submit-action-btn">${label}</button>
    `;
}

function bindTaskActions(id) {
    if (id === 7) {
        const sendBtn = document.getElementById("chatSend");
        const inputEl = document.getElementById("chatInput");

        sendBtn.addEventListener("click", handleChatSubmission);
        inputEl.addEventListener("keydown", (evt) => {
            if (evt.key === "Enter") handleChatSubmission();
        });
        return;
    }

    const btn = document.getElementById("generateBtn");
    if (btn) {
        btn.addEventListener("click", () => executeTaskRequest(id));
    }
}

/* API Execution Engine */
async function executeTaskRequest(id) {
    if (!userApiKey) {
        triggerToast("Provide a valid Gemini API key first.", true);
        return;
    }

    const targetOutput = document.getElementById("result");
    targetOutput.innerHTML = getLoadingStateHTML();

    try {
        let responseText;

        if (id === 1) responseText = await generateResume();
        else if (id === 2) responseText = await generateNotes();
        else if (id === 3) responseText = await generatePresentation();
        else if (id === 4) responseText = await generateMindMap();
        else if (id === 5) responseText = await generateSheetAnalysis();
        else if (id === 6) responseText = await generateQuiz();
        else if (id === 8) responseText = await generateFlashcards();
        else if (id === 9) responseText = await generateStudyPlan();
        else if (id === 10) responseText = await generatePhotoNotes();

        targetOutput.innerHTML = `<div class="formatted-output">${renderText(responseText)}</div>`;
    } catch (err) {
        targetOutput.innerHTML = `
            <div class="formatted-output">
                <strong>Execution Error</strong><br><br>
                ${sanitizeHTML(err.message)}
            </div>
        `;
    }
}

async function fetchGeminiContent(prompt, extraParts = []) {
    if (!userApiKey) {
        throw new Error("Gemini API key is required.");
    }

    let queue = [activeModel];
    if (fallbackToggle.checked) {
        const fallbacks = MODEL_CONFIGS.map(m => m.id).filter(id => id !== activeModel);
        queue = queue.concat(fallbacks);
    }

    let lastFailedError = null;

    for (const modelId of queue) {
        try {
            renderModelStatus(`Connecting: ${getModelLabel(modelId)}`);
            const endpoint = `${API_BASE_URL}/${modelId}:generateContent`;

            const payload = {
                contents: [{
                    role: "user",
                    parts: [{ text: prompt }, ...extraParts]
                }]
            };

            const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": userApiKey
                },
                body: JSON.stringify(payload)
            });

            const bodyData = await res.json();

            if (!res.ok) {
                const msg = bodyData?.error?.message || `HTTP Exception ${res.status}`;
                throw new Error(msg);
            }

            const outputText = bodyData?.candidates?.[0]?.content?.parts
                ?.map(p => p.text || "")
                .join("")
                .trim();

            if (!outputText) {
                throw new Error("Gemini API returned empty text content.");
            }

            activeModel = modelId;
            modelSelect.value = modelId;
            localStorage.setItem("acad_model", modelId);
            modelStatus.innerHTML = `Active Model: <strong>${getModelLabel(modelId)}</strong>`;

            return outputText;
        } catch (error) {
            lastFailedError = error;
            console.warn(`Model ${modelId} failed:`, error.message);
            if (!fallbackToggle.checked) break;
        }
    }

    throw new Error(
        "All configured Gemini models failed.\n\n" +
        (lastFailedError?.message || "Unknown API error occurred.")
    );
}

async function runModelTest() {
    if (!userApiKey) {
        triggerToast("Enter your Gemini API key first.", true);
        return;
    }

    testModelBtn.disabled = true;
    testModelBtn.textContent = "Testing...";

    try {
        const result = await fetchGeminiContent("Reply with exactly: AcademiaPulse test success.");
        triggerToast("Selected model validated successfully.");
        modelStatus.innerHTML = `✓ Verified: <strong>${getModelLabel(activeModel)}</strong>`;
    } catch (err) {
        triggerToast("Model verification failed.", true);
        modelStatus.innerHTML = `✗ Error: ${sanitizeHTML(err.message)}`;
    } finally {
        testModelBtn.disabled = false;
        testModelBtn.textContent = "Test Selected Model";
    }
}

/* Individual Task Functions */
async function generateResume() {
    const prompt = `
Create a professional ATS-friendly resume.

Name:
${getInputValue("name")}

Contact:
${getInputValue("contact")}

Education:
${getInputValue("education")}

Skills:
${getInputValue("skills")}

Experience:
${getInputValue("experience")}

Career Objective:
${getInputValue("objective")}

Rules:
- Use professional formatting.
- Use strong bullet points.
- Do not invent information.
- Keep it suitable for an MNC job application.
`;
    return await fetchGeminiContent(prompt);
}

async function generateNotes() {
    const prompt = `
Create detailed study notes.

Topic:
${getInputValue("topic")}

Learning Level:
${getInputValue("notesLevel")}

Additional Instructions:
${getInputValue("notesExtra")}

Include:
1. Definition
2. Important concepts
3. Key points
4. Examples
5. Practical explanation
6. Quick revision section

Make the notes easy to understand.
`;
    return await fetchGeminiContent(prompt);
}

async function generatePresentation() {
    const prompt = `
Create a presentation about:
${getInputValue("presentationTopic")}

Number of slides:
${getInputValue("slideCount")}

Audience:
${getInputValue("presentationAudience")}

For every slide provide:
Slide title
3 to 5 bullet points
Speaker notes

Return clean structured content.
`;
    return await fetchGeminiContent(prompt);
}

async function generateMindMap() {
    const prompt = `
Create a detailed text-based mind map.

Main Topic:
${getInputValue("mindTopic")}

Additional information:
${getInputValue("mindDetails")}

Use this structure:
MAIN TOPIC
|
|-- Main Branch
|   |-- Sub Branch
|   |-- Sub Branch
|
|-- Main Branch
|   |-- Sub Branch

Include important concepts only.
`;
    return await fetchGeminiContent(prompt);
}

async function generateSheetAnalysis() {
    const url = getInputValue("sheetUrl");
    if (!url) throw new Error("Google Apps Script URL is required.");

    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not fetch data from Google Sheets.");

    const sheetData = await res.json();
    const prompt = `
Analyze the following Google Sheets data.

Data:
${JSON.stringify(sheetData, null, 2)}

User question:
${getInputValue("sheetQuestion")}

Provide:
- Important observations
- Trends
- Possible issues
- Useful recommendations
`;
    return await fetchGeminiContent(prompt);
}

async function generateQuiz() {
    const prompt = `
Create ${getInputValue("quizCount")} multiple choice questions.

Topic:
${getInputValue("quizTopic")}

Difficulty:
${getInputValue("quizLevel")}

For each question provide:
Question
A
B
C
D
Correct answer
Explanation

Do not use markdown tables.
`;
    return await fetchGeminiContent(prompt);
}

async function generateFlashcards() {
    const prompt = `
Create ${getInputValue("flashCount")} study flashcards.

Topic:
${getInputValue("flashTopic")}

Difficulty:
${getInputValue("flashLevel")}

Format:
CARD 1
QUESTION:
...
ANSWER:
...

CARD 2
QUESTION:
...
ANSWER:
...

Keep answers concise.
`;
    return await fetchGeminiContent(prompt);
}

async function generateStudyPlan() {
    const prompt = `
Create a study plan.

Subject:
${getInputValue("planSubject")}

Number of days:
${getInputValue("planDays")}

Hours per day:
${getInputValue("planHours")}

Topics:
${getInputValue("planTopics")}

For each day provide:
Day
Topics
Study activities
Practice
Revision

Make the schedule realistic.
`;
    return await fetchGeminiContent(prompt);
}

async function generatePhotoNotes() {
    const file = document.getElementById("photoInput").files[0];
    if (!file) throw new Error("Please select an image file first.");

    const base64Str = await convertFileToBase64(file);
    const mime = file.type;

    const parts = [
        {
            text: `
Analyze this study-notes image.

Instruction:
${getInputValue("photoInstruction")}

Provide:
1. Clean notes
2. Important concepts
3. Key points
4. Short summary
5. Exam-important points

Do not invent information that is not visible.
`
        },
        {
            inline_data: {
                mime_type: mime,
                data: base64Str.split(",")[1]
            }
        }
    ];

    return await fetchGeminiContent("Analyze the uploaded study image.", parts);
}

/* Chat Module */
let conversationLogs = [];

async function handleChatSubmission() {
    if (!userApiKey) {
        triggerToast("API Key is required to chat.", true);
        return;
    }

    const inputField = document.getElementById("chatInput");
    const query = inputField.value.trim();
    if (!query) return;

    appendChatBubble(query, "user");
    inputField.value = "";

    try {
        const prompt = `
You are AcademiaPulse, a helpful educational assistant.

Previous conversation:
${conversationLogs.join("\n")}

Student question:
${query}

Explain the answer clearly.
If useful, provide examples.
`;

        conversationLogs.push(`Student: ${query}`);
        const responseText = await fetchGeminiContent(prompt);
        conversationLogs.push(`AcademiaPulse: ${responseText}`);

        appendChatBubble(responseText, "ai");
    } catch (err) {
        appendChatBubble(`Error: ${err.message}`, "ai");
    }
}

function appendChatBubble(msg, sender) {
    const chatContainer = document.getElementById("chatBox");
    const bubble = document.createElement("div");
    bubble.className = sender === "user" ? "chat-bubble user-bubble" : "chat-bubble ai-bubble";
    bubble.textContent = msg;
    chatContainer.appendChild(bubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

/* Utilities */
function getInputValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function getLoadingStateHTML() {
    return `
        <div class="loader-wrapper">
            <div class="spinner-ring"></div>
            <span>Generating content with AI...</span>
        </div>
    `;
}

function renderText(str) {
    return sanitizeHTML(str).replace(/\n/g, "<br>");
}

function sanitizeHTML(str) {
    const temp = document.createElement("div");
    temp.textContent = str;
    return temp.innerHTML;
}

function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function triggerToast(text, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = text;
    toast.className = isError ? "toast-notification show error-toast" : "toast-notification show";
    setTimeout(() => {
        toast.className = "toast-notification";
    }, 3500);
}