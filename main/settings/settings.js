console.log('settings.js je uspješno učitan');

document.getElementById('back-to-main').onclick = function() {
    console.log('Kliknuto na gumb Natrag na početnu');
    window.location.href = '../main.html';
};

// Firebase Authentication funkcionalnost za promjenu lozinke
import { getAuth, updatePassword, updateEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// Firebase konfiguracija
const firebaseConfig = {
  apiKey: "AIzaSyDYwAIQ3nHI4CV0BxVXwHD0SaB6ySxWEj8",
  authDomain: "studentshareandcare.firebaseapp.com",
  projectId: "studentshareandcare",
  storageBucket: "studentshareandcare.firebasestorage.app",
  messagingSenderId: "5133800080",
  appId: "1:5133800080:web:87d97e229027264873be15",
  measurementId: "G-1MDDHHDWHE"
};

// Inicijalizacija Firebase aplikacije
initializeApp(firebaseConfig);

// Prikaži email prijavljenog korisnika u polju i omogući gumb tek kad je korisnik učitan
const emailInput = document.getElementById('email');
const saveBtn = document.getElementById('save-account');
saveBtn.disabled = true;

onAuthStateChanged(getAuth(), (user) => {
    if (user) {
        emailInput.value = user.email || '';
        saveBtn.disabled = false;
    } else {
        emailInput.value = '';
        saveBtn.disabled = true;
    }
});

document.getElementById('save-account').onclick = async function () {
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const newPassword = document.getElementById('change-password').value;
    const accountMessage = document.getElementById('account-message');

    // Resetiraj poruku
    accountMessage.textContent = '';

    // Validacija unosa
    if (!username || !email || !newPassword) {
        accountMessage.textContent = 'Sva polja su obavezna.';
        accountMessage.style.color = 'red';
        return;
    }

    if (newPassword.length < 6) {
        accountMessage.textContent = 'Lozinka mora imati najmanje 6 znakova.';
        accountMessage.style.color = 'red';
        return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        accountMessage.textContent = 'Korisnik nije prijavljen.';
        accountMessage.style.color = 'red';
        return;
    }
    // Provjeri email samo jednom, bez ponovnog klikanja
    if (user.email !== email) {
        accountMessage.textContent = 'Email adresa ne odgovara prijavljenom korisniku.';
        accountMessage.style.color = 'red';
        return;
    }

    // Provjera korisničkog imena iz Firestore baze
    try {
        const db = getFirestore();
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            accountMessage.textContent = 'Korisnički podaci nisu pronađeni.';
            accountMessage.style.color = 'red';
            return;
        }
        const data = userDocSnap.data();
        if (data.username !== username) {
            accountMessage.textContent = 'Korisničko ime ne odgovara prijavljenom korisniku.';
            accountMessage.style.color = 'red';
            return;
        }
        // Ako je sve OK, promijeni lozinku
        await updatePassword(user, newPassword);
        accountMessage.textContent = 'Lozinka uspješno promijenjena!';
        accountMessage.style.color = 'green';
    } catch (error) {
        console.error('Greška prilikom promjene lozinke ili provjere korisničkog imena:', error);
        if (error.code === 'auth/requires-recent-login') {
            accountMessage.textContent = 'Sesija je istekla. Prijavite se ponovno i pokušajte ponovno.';
        } else {
            accountMessage.textContent = 'Došlo je do greške. Pokušajte ponovno.';
        }
        accountMessage.style.color = 'red';
    }
};

document.getElementById('go-to-geolocation').onclick = function() {
    window.location.href = '../main/geolocation.html';
};