/************************
  API CONFIG
*************************/
const API_URL = "https://mindlift-3zmr.onrender.com/api/auth";

/************************
  REGISTER & LOGIN
*************************/
async function register() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;

  if (!name || !phone || !password) return alert("Please fill all fields");

  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, password })
  });

  const data = await res.json();
  alert(data.message);
}

// Note: Login logic should be in login.html or here, 
// but ensure it saves 'userPhone' in localStorage.

/************************
  MOOD TRACKER (FIXED & CLEAN)
*************************/
function saveMood(mood) {
    const userPhone = localStorage.getItem("userPhone"); 
    if (!userPhone) return alert("Please login again");

    const storageKey = `moods_${userPhone}`; 
    let moods = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    const moodNoteElement = document.getElementById("moodNote");
    const noteValue = moodNoteElement ? moodNoteElement.value : "";

    const moodEntry = {
        mood: mood,
        note: noteValue,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    moods.push(moodEntry);
    localStorage.setItem(storageKey, JSON.stringify(moods));
    if (moodNoteElement) moodNoteElement.value = "";
    
    displayMoodHistory(); 

    // AGAR USER SAD YA STRESSED HAI TOH SCREEN PAR MESSAGE DIKHAO
    if (mood === 'Sad' || mood === 'Stressed') {
        const mainContent = document.getElementById("main-content");
        
        // Purane content ke upar ek soft alert box add kar rahe hain
        const noticeHTML = `
            <div id="mood-notice" style="background: #fffbe6; border: 1px solid #ffe58f; padding: 15px; border-radius: 12px; margin-bottom: 20px; text-align: center; animation: slideIn 0.5s ease;">
                <p style="margin: 0; color: #856404; font-weight: 600;">
                    😔 We noticed you're feeling ${mood}. Would you like to take a quick wellness test?
                </p>
                <div style="margin-top: 10px;">
                    <button onclick="loadContent('test')" style="background: #faad14; color: white; border: none; padding: 8px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; margin-right: 10px;">Yes, Take Test</button>
                    <button onclick="document.getElementById('mood-notice').remove()" style="background: transparent; border: 1px solid #ccc; padding: 8px 20px; border-radius: 8px; cursor: pointer;">Maybe Later</button>
                </div>
            </div>
        `;
        
        // Is notice ko main content ke top par insert karo
        mainContent.insertAdjacentHTML('afterbegin', noticeHTML);
    }
}

// Ye naya function bhi script.js ke end mein add kar do
function checkSeverity() {
    let total = 0;
    // 10 questions ka loop chala kar score calculate karna
    for (let i = 0; i < 10; i++) {
        const val = parseInt(document.getElementById(`q${i}`).value);
        total += val;
    }
    
    const resultDiv = document.getElementById("quiz-result");
    document.getElementById("quiz-container").style.display = "none";
    resultDiv.style.display = "block";

    // Decision Logic based on 10 questions (Max score 30)
    if (total >= 15) {
        // High Severity
        resultDiv.innerHTML = `
            <div style="padding:25px; border-radius:15px; background:#fff1f0; border:2px solid #ff4d4f; text-align:left;">
                <h3 style="color:#cf1322;">⚠️ Action Required: Clinical Consultation</h3>
                <p>Your score is <b>${total}/30</b>, which indicates significant emotional distress.</p>
                <p><b>Recommendation:</b> Please book an appointment with a professional counselor or a doctor immediately. Taking care of your mental health is a sign of strength.</p>
                <hr style="border: 0; border-top: 1px solid #ffccc7; margin: 15px 0;">
                <p><b>Emergency:</b> Call 14416 (Kiran Mental Health Helpline)</p>
                <button class="mood-btn" onclick="loadContent('help')">Find Local Help</button>
            </div>
        `;
    } else if (total >= 7) {
        // Moderate Severity
        resultDiv.innerHTML = `
            <div style="padding:25px; border-radius:15px; background:#fffbe6; border:2px solid #faad14; text-align:left;">
                <h3 style="color:#d48806;">🟡 Moderate Stress Detected</h3>
                <p>Your score is <b>${total}/30</b>. You are going through a tough time.</p>
                <p><b>Recommendation:</b> Try talking to a trusted friend or use our <b>AI Chat</b> to vent. If this feeling persists, consider professional help.</p>
                <button class="mood-btn" onclick="loadContent('chat')">Talk to AI Now</button>
            </div>
        `;
    } else {
        // Low Severity
        resultDiv.innerHTML = `
            <div style="padding:25px; border-radius:15px; background:#f6ffed; border:2px solid #52c41a; text-align:left;">
                <h3 style="color:#389e0d;">🟢 Mild/Low Stress</h3>
                <p>Your score is <b>${total}/30</b>. You seem to be handling things well!</p>
                <p><b>Recommendation:</b> Continue your wellness journey. Daily mood tracking and meditation can help maintain this balance.</p>
                <button class="mood-btn" onclick="loadContent('mood')">Back to Dashboard</button>
            </div>
        `;
    }
}

function displayMoodHistory() {
    const moodList = document.getElementById("moodList");
    if (!moodList) return;

    // 1. Pehle current user ka phone number lo
    const phone = localStorage.getItem("userPhone");
    
    // 2. Ab common "moods" nahi, balki user-specific key use karo
    const storageKey = `moods_${phone}`;
    const moods = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    moodList.innerHTML = "";

    // 3. Sirf is user ke moods dikhao
    moods.slice(-5).reverse().forEach(m => {
    moodList.innerHTML += `
        <li class="mood-history-item">
            <div class="mood-info">
                <span>📅 ${m.date} | 🕒 ${m.time || ''}</span>
                <strong>${m.mood}</strong>
                ${m.note ? `<p style="color: #666; font-style: italic; margin-top: 5px;">📝 ${m.note}</p>` : ''}
            </div>
        </li>`;
    });
}

/************************
  DASHBOARD & HISTORY
*************************/
function showHistory() {
    const userPhone = localStorage.getItem("userPhone"); 
    const moods = JSON.parse(localStorage.getItem(`moods_${userPhone}`)) || [];
    const output = document.getElementById("main-content");
    if (!output) return;

    // Sirf last 5 entries dikhane ke liye slice aur reverse use karenge
    const lastFiveMoods = moods.slice(-5).reverse();

    let historyHTML = `
        <div class="dashboard-main-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0;">📜 Your Recent Activity</h2>
                <button onclick="clearUserHistory()" class="logout-btn" style="margin:0; padding: 8px 15px;">
                    🗑️ Clear All Data
                </button>
            </div>
            <div class="timeline" style="max-height: 60vh; overflow-y: auto;">`;

    if (lastFiveMoods.length === 0) {
        historyHTML += `<p style="text-align:center; color:#666;">No activity found yet.</p>`;
    } else {
        lastFiveMoods.forEach(m => {
            historyHTML += `
                <div class="timeline-item" style="border-left: 3px solid #007bff; margin-bottom: 15px; padding-left: 15px;">
                    <div class="timeline-content">
                        <h4 style="margin:0;">Mood: ${m.mood}</h4>
                        <p style="margin: 5px 0;">${m.note ? `"${m.note}"` : "No note added."}</p>
                        <span class="time-stamp" style="font-size: 12px; color: #888;">📅 ${m.date} | 🕒 ${m.time}</span>
                    </div>
                </div>`;
        });
    }

    historyHTML += `</div></div>`;
    output.innerHTML = historyHTML;
}

function clearUserHistory() {
    const userPhone = localStorage.getItem("userPhone");
    if (!userPhone) {
        alert("Session expired, please login again.");
        return;
    }

    if (confirm("Kya aap apna saara mood history aur progress data delete karna chahte hain? Ye wapas nahi aayega.")) {
        const storageKey = `moods_${userPhone}`;
        localStorage.removeItem(storageKey); // Moods and Graph data removed
        
        // UI refresh karne ke liye
        loadContent('history'); 
        alert("History cleared successfully!");
    }
}

function logout() {
  localStorage.removeItem("username");
  localStorage.removeItem("logintime");
  window.location.href = "login.html";
}
