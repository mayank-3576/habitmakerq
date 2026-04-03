// ================= FIREBASE IMPORT =================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ================= CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyBMUdQPUEMWv6YlCxfYeE_d2yqCk5viidc",
  authDomain: "habitmakerq.firebaseapp.com",
  projectId: "habitmakerq",
  storageBucket: "habitmakerq.appspot.com",
  messagingSenderId: "696543546725",
  appId: "1:696543546725:web:069c3cd0bf473f69e6a58c"
};


// ================= INIT =================
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase Connected");


// ================= GLOBAL STATE =================
let currentUser = null;

let tasks = [];
let topics = [];
let weeklyTasks = [];

let points = 0;
let streak = 0;


// ================= AUTH =================

// SIGNUP
window.signup = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", userCred.user.uid), {
      email,
      tasks: [],
      topics: [],
      weeklyTasks: [],
      points: 0,
      streak: 0
    });

    alert("Signup success 🚀");
  } catch (err) {
    alert(err.message);
  }
};

// LOGIN
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login success 🔥");
  } catch (err) {
    alert(err.message);
  }
};

// LOGOUT
window.logout = function () {
  signOut(auth);
};


// ================= AUTH STATE =================
onAuthStateChanged(auth, (user) => {
  const authUI = document.getElementById("auth-section");
  const appUI = document.getElementById("app-section");

  if (user) {
    currentUser = user;

    authUI.style.display = "none";
    appUI.style.display = "block";

    listenUserData();
  } else {
    currentUser = null;

    authUI.style.display = "block";
    appUI.style.display = "none";
  }
});


// ================= REALTIME DATA =================
function listenUserData() {
  if (!currentUser) return;

  const ref = doc(db, "users", currentUser.uid);

  onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();

      tasks = data.tasks || [];
      topics = data.topics || [];
      weeklyTasks = data.weeklyTasks || [];

      points = data.points || 0;
      streak = data.streak || 0;

      render();
      renderWeekly();
    }
  });
}


// ================= SAVE =================
async function saveUserData() {
  if (!currentUser) return;

  try {
    await setDoc(doc(db, "users", currentUser.uid), {
      tasks,
      topics,
      weeklyTasks,
      points,
      streak
    });
  } catch (err) {
    console.log("Save error:", err);
  }
}


// ================= WEEKLY TRACKER =================

// RENDER TABLE
function renderWeekly() {
  const body = document.getElementById("weekly-body");
  if (!body) return;

  body.innerHTML = "";

  weeklyTasks.forEach(task => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${task.title}</td>
      ${["mon","tue","wed","thu","fri","sat","sun"].map(day => `
        <td>
          <input type="checkbox"
            ${task.days[day] ? "checked" : ""}
            onchange="toggleDay('${task.id}','${day}', this.checked)">
        </td>
      `).join("")}
    `;

    body.appendChild(tr);
  });
}


// TOGGLE DAY
window.toggleDay = function (id, day, value) {
  weeklyTasks = weeklyTasks.map(t => {
    if (t.id == id) {
      t.days[day] = value;

      if (value) points += 5;
    }
    return t;
  });

  saveUserData();
  renderWeekly();
};


// ADD WEEKLY TASK
window.addWeeklyTask = function (title) {
  const newTask = {
    id: Date.now(),
    title,
    days: {
      mon:false,tue:false,wed:false,
      thu:false,fri:false,sat:false,sun:false
    }
  };

  weeklyTasks.push(newTask);

  saveUserData();
  renderWeekly();
};


// ================= BASIC RENDER =================
function render() {
  const pointsBox = document.getElementById("points-box");
  if (pointsBox) {
    pointsBox.textContent = "🏆 " + points + " pts";
  }
}


// ================= DEBUG =================
window.addEventListener("error", (e) => {
  console.log("Error:", e.message);
});