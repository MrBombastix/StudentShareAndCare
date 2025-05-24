// --- Firebase inicijalizacija ---
const firebaseConfig = {
  apiKey: "AIzaSyDYwAIQ3nHI4CV0BxVXwHD0SaB6ySxWEj8",
  authDomain: "studentshareandcare.firebaseapp.com",
  projectId: "studentshareandcare",
  storageBucket: "studentshareandcare.appspot.com",
  messagingSenderId: "5133800080",
  appId: "1:5133800080:web:87d97e229027264873be15",
  measurementId: "G-1MDDHHDWHE"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Otvori/zatvori login modal
document.getElementById('login').onclick = function() {
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('login-message').textContent = '';
  document.getElementById('login-form').reset();
  document.getElementById('login-password').type = "password";
  document.getElementById('eye-icon').textContent = "👁️";
};
document.getElementById('close-login').onclick = function() {
  document.getElementById('login-modal').style.display = 'none';
};

// Otvori/zatvori register modal
document.getElementById('register').onclick = function() {
  document.getElementById('register-modal').style.display = 'flex';
  document.getElementById('register-message').textContent = '';
  document.getElementById('register-form').reset();
};
document.getElementById('close-register').onclick = function() {
  document.getElementById('register-modal').style.display = 'none';
};

// Prikaz/Skrivanje lozinke za login
document.getElementById('toggle-password').onclick = function() {
  const passInput = document.getElementById('login-password');
  const eyeIcon = document.getElementById('eye-icon');
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.textContent = "🙈";
  } else {
    passInput.type = "password";
    eyeIcon.textContent = "👁️";
  }
};
document.getElementById('eye-icon').textContent = "👁️";

// Registracija (samo email i lozinka)
document.getElementById('register-form').onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      // Odmah odjavi korisnika nakon registracije
      firebase.auth().signOut().then(() => {
        document.getElementById('register-message').style.color = "#2ecc71";
        document.getElementById('register-message').textContent = "Registracija uspješna! Prijavite se.";
        setTimeout(() => {
          document.getElementById('register-modal').style.display = 'none';
        }, 1200);
      });
    })
    .catch(err => {
      document.getElementById('register-message').style.color = "#d7263d";
      document.getElementById('register-message').textContent = err.message;
    });
};

// Prijava (email i lozinka)
document.getElementById('login-form').onsubmit = function(e) {
  e.preventDefault();
  const email = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('login-message').style.color = "#2ecc71";
      document.getElementById('login-message').textContent = "Uspješna prijava!";
      setTimeout(() => {
        window.location.href = "main/main.html";
      }, 1200);
    })
    .catch(err => {
      document.getElementById('login-message').style.color = "#d7263d";
      document.getElementById('login-message').textContent = "Neispravan email ili lozinka!";
    });
};


