// "Baza" korisnika u localStorage (demo)
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

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

// Registracija
document.getElementById('register-form').onsubmit = function(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  let users = getUsers();
  if (users.find(u => u.username === username)) {
    document.getElementById('register-message').style.color = "#d7263d";
    document.getElementById('register-message').textContent = "Korisničko ime već postoji!";
    return;
  }
  users.push({ username, email, password });
  saveUsers(users);
  document.getElementById('register-message').style.color = "#2ecc71";
  document.getElementById('register-message').textContent = "Registracija uspješna! Možete se prijaviti.";
  setTimeout(() => {
    document.getElementById('register-modal').style.display = 'none';
  }, 1200);
};

// Prijava
document.getElementById('login-form').onsubmit = function(e) {
  e.preventDefault();
  const user = document.getElementById('login-username').value.trim();
  const pass = document.getElementById('login-password').value;
  let users = getUsers();
  const found = users.find(u => u.username === user && u.password === pass);
  if (found) {
    document.getElementById('login-message').style.color = "#2ecc71";
    document.getElementById('login-message').textContent = "Uspješna prijava!";
    setTimeout(() => {
      window.location.href = "main/main.html";
    }, 1200);
  } else {
    document.getElementById('login-message').style.color = "#d7263d";
    document.getElementById('login-message').textContent = "Neispravno korisničko ime ili lozinka!";
  }
};
