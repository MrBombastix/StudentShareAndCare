document.addEventListener('DOMContentLoaded', function() {
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
const db = firebase.firestore();

// --- MODALI ---
// Otvori login modal
document.getElementById('login').onclick = function() {
  document.getElementById('login-modal').style.display = 'flex';
  document.getElementById('login-message').textContent = '';
  document.getElementById('login-form').reset();
  document.getElementById('login-password').type = "password";
  document.getElementById('eye-icon-login').src = "svg/show-svgrepo-com.svg";
  document.getElementById('eye-icon-login').alt = "Prikaži lozinku";
};
// Zatvori login modal
document.getElementById('close-login').onclick = function() {
  document.getElementById('login-modal').style.display = 'none';
};
// Otvori register modal
document.getElementById('register').onclick = function() {
  document.getElementById('register-modal').style.display = 'flex';
  document.getElementById('register-message').textContent = '';
  document.getElementById('register-form').reset();
  document.getElementById('register-password').type = "password";
  document.getElementById('eye-icon-register').src = "svg/show-svgrepo-com.svg";
  document.getElementById('eye-icon-register').alt = "Prikaži lozinku";
};
// Zatvori register modal
document.getElementById('close-register').onclick = function() {
  document.getElementById('register-modal').style.display = 'none';
};

// --- PRIKAZ/SKRIVANJE LOZINKE ---
// Login
document.getElementById('toggle-password-login').onclick = function() {
  const passInput = document.getElementById('login-password');
  const eyeIcon = document.getElementById('eye-icon-login');
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.src = "svg/hide-svgrepo-com.svg";
    eyeIcon.alt = "Sakrij lozinku";
  } else {
    passInput.type = "password";
    eyeIcon.src = "svg/show-svgrepo-com.svg";
    eyeIcon.alt = "Prikaži lozinku";
  }
};
// Registracija
document.getElementById('toggle-password-register').onclick = function() {
  const passInput = document.getElementById('register-password');
  const eyeIcon = document.getElementById('eye-icon-register');
  if (passInput.type === "password") {
    passInput.type = "text";
    eyeIcon.src = "svg/hide-svgrepo-com.svg";
    eyeIcon.alt = "Sakrij lozinku";
  } else {
    passInput.type = "password";
    eyeIcon.src = "svg/show-svgrepo-com.svg";
    eyeIcon.alt = "Prikaži lozinku";
  }
};

// --- REGISTRACIJA ---
document.getElementById('register-form').onsubmit = function(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const username = document.getElementById('register-username').value.trim();

    // Prvo provjeri je li username zauzet
    db.collection('users')
        .where('username', '==', username)
        .limit(1)
        .get()
        .then(snapshot => {
            if (!snapshot.empty) {
                document.getElementById('register-message').style.color = "#d7263d";
                document.getElementById('register-message').textContent = "Korisničko ime je zauzeto! Odaberite drugo korisničko ime.";
                throw new Error('Korisničko ime je zauzeto!');
            }
            // Ako je username slobodan, tek tada registriraj korisnika
            return auth.createUserWithEmailAndPassword(email, password);
        })
        .then((userCredential) => {
            // Upisi username i email u bazu podataka
            return db.collection('users').doc(userCredential.user.uid).set({
                username: username,
                email: email
            }).then(() => {
                document.getElementById('register-message').style.color = "#2ecc71";
                document.getElementById('register-message').textContent = "Registracija uspješna! Automatski ste prijavljeni.";
                setTimeout(() => {
                    document.getElementById('register-modal').style.display = 'none';
                    window.location.href = "main/main.html";
                }, 1200);
            });
        })
        .catch(err => {
            if (err.message === 'Korisničko ime je zauzeto!') return;
            let msg = err.message;
            if (err.code === "auth/email-already-in-use") {
                msg = "Ova email adresa je već registrirana!";
            } else if (err.message && err.message.includes('PERMISSION_DENIED')) {
                msg = "Nemate dopuštenje za upis korisnika. Provjerite Firestore pravila.";
            } else if (err.message && err.message.includes('Missing or insufficient permissions')) {
                msg = "Nemate dopuštenje za upis korisnika. Provjerite Firestore pravila.";
            }
            document.getElementById('register-message').style.color = "#d7263d";
            document.getElementById('register-message').textContent = msg;
        });
};

// --- PRIJAVA ---
document.getElementById('login-form').onsubmit = function(e) {
  e.preventDefault();
  const userInput = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  let emailPromise;
  if (userInput.includes('@')) {
    // Uneseno je email
    emailPromise = Promise.resolve(userInput);
  } else {
    // Uneseno je korisničko ime, traži email u Firestore
    emailPromise = firebase.firestore().collection("users")
      .where("username", "==", userInput)
      .limit(1)
      .get()
      .then(snapshot => {
        if (!snapshot.empty) {
          return snapshot.docs[0].data().email;
        } else {
          throw new Error("Korisničko ime ne postoji!");
        }
      });
  }

  emailPromise.then(email => {
    if (!email) {
      throw new Error("Korisnik s ovom email adresom ne postoji!");
    }
    return firebase.auth().signInWithEmailAndPassword(email, password);
  })
  .then(() => {
    document.getElementById('login-message').style.color = "#2ecc71";
    document.getElementById('login-message').textContent = "Uspješna prijava!";
    setTimeout(() => {
      window.location.href = "main/main.html";
    }, 1200);
  })
  .catch(err => {
    document.getElementById('login-message').style.color = "#d7263d";
    let msg = err.message;
    if (msg.includes('Korisničko ime ne postoji!')) {
      msg = "Korisničko ime ne postoji!";
    } else if (msg.includes('auth/user-not-found') || msg.includes('Korisnik s ovom email adresom ne postoji!')) {
      msg = "Korisnik s ovom email adresom ne postoji!";
    } else if (msg.includes('auth/wrong-password')) {
      msg = "Pogrešna lozinka!";
    } else if (msg.includes('auth/invalid-credential')) {
      msg = "Neispravni podaci za prijavu!";
    }
    document.getElementById('login-message').textContent = msg;
    document.getElementById('login-password').value = '';
  });
};

firebase.auth().onAuthStateChanged(function(currentUser) {
  if (currentUser) {
    db.collection("users").doc(currentUser.uid).get()
      .then(doc => {
        if (doc.exists) {
          // Podaci korisnika su u doc.data()
        } else {
          // Korisnik ne postoji u bazi
        }
      })
      .catch(error => {
        // Obrada greške
      });
  }
});
});
