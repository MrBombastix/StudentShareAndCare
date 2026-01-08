// --- Firebase inicijalizacija (prva stvar u datoteci!) ---
const firebaseConfig = {
    apiKey: "AIzaSyDYwAIQ3nHI4CV0BxVXwHD0SaB6ySxWEj8",
    authDomain: "studentshareandcare.firebaseapp.com",
    projectId: "studentshareandcare",
    storageBucket: "studentshareandcare.appspot.com",
    messagingSenderId: "5133800080",
    appId: "1:5133800080:web:87d97e229027264873be15",
    measurementId: "G-1MDDHHDWHE"
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// --- Hamburger meni ---
const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');

if (menuBtn && sideMenu && closeMenu) {
    menuBtn.onclick = () => sideMenu.classList.add('open');
    closeMenu.onclick = () => sideMenu.classList.remove('open');
}

// --- Odjava ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        firebase.auth().signOut().then(() => {
            window.location.href = "../index.html";
        });
    };
}

// --- Obavijesti dropdown ---
const notifBtn = document.getElementById('notifications-btn');
const notifDropdown = document.getElementById('notif-dropdown');

if (notifBtn && notifDropdown) {
    notifBtn.onclick = (e) => {
        e.stopPropagation();
        notifDropdown.style.display = notifDropdown.style.display === 'block' ? 'none' : 'block';
    };
    document.body.onclick = () => {
        if (notifDropdown.style.display === 'block') {
            notifDropdown.style.display = 'none';
        }
    };
    notifBtn.onclick = (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
    };
    document.body.onclick = () => {
        notifDropdown.classList.remove('show');
    };
}

// --- Učitavanje i prikaz oglasa iz Firestore-a ---
let oglasiSvi = [];

function ucitajOglaseFirestore() {
    firebase.firestore().collection('oglasi').orderBy('createdAt', 'desc').get()
        .then(snapshot => {
            oglasiSvi = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            prikaziOglase(oglasiSvi);
        })
        .catch(err => {
            document.getElementById('product-list').innerHTML = '<div style="color:red">Greška pri dohvaćanju oglasa.</div>';
        });
}

// Pozovi odmah kod učitavanja stranice
ucitajOglaseFirestore();

// --- Funkcija za prikaz oglasa ---
function prikaziOglase(lista) {
    let html = '';
    lista.forEach(o => {
        let slikaUrl = o.slika && o.slika.trim() !== '' ? o.slika : '../svg/user_question.svg';
        let cijenaPrikaz = '';
        if (o.cijena === 0 || o.cijena === '0' || (typeof o.cijena === 'string' && o.cijena.toLowerCase() === 'besplatno')) {
            cijenaPrikaz = 'Besplatno';
        } else if (typeof o.cijena === 'string' && (o.cijena.toLowerCase().includes('kn') || o.cijena.toLowerCase().includes('besplatno'))) {
            cijenaPrikaz = o.cijena;
        } else if (o.cijena) {
            cijenaPrikaz = `${o.cijena} kn`;
        } else {
            cijenaPrikaz = '-';
        }
        html += `
        <div class="product-card">
            <img src="${slikaUrl}" alt="${o.naslov}" onerror="this.src='../svg/user_question.svg'">
            <div class="product-info">
                <h3>${o.naslov}</h3>
                <span class="tag">${o.fakultet}</span>
                <p>${o.opis}</p>
                <div class="price">${cijenaPrikaz}</div>
            </div>
        </div>`;
    });
    document.getElementById('product-list').innerHTML = html;
}

// --- Filter funkcionalnost ---
document.getElementById('search-filters').onclick = function(e) {
    e.preventDefault();
    const fakultet = document.getElementById('filter-fakultet').value.trim().toLowerCase();
    const kolegij = document.getElementById('filter-kolegij').value.trim().toLowerCase();
    const pretraga = document.getElementById('filter-pretraga').value.trim().toLowerCase();
    const filtrirani = oglasiSvi.filter(oglas => {
        const oglasFakultet = (oglas.fakultet || '').toLowerCase();
        const oglasNaslov = (oglas.naslov || '').toLowerCase();
        const oglasOpis = (oglas.opis || '').toLowerCase();
        const matchFakultet = fakultet ? oglasFakultet.includes(fakultet) : true;
        const matchKolegij = kolegij ? oglasNaslov.includes(kolegij) : true;
        const matchPretraga = pretraga ? (
            oglasNaslov.includes(pretraga) ||
            oglasOpis.includes(pretraga)
        ) : true;
        return matchFakultet && matchKolegij && matchPretraga;
    });
    prikaziOglase(filtrirani);
};

// --- Reset filtera ---
document.getElementById('clear-filters').onclick = function() {
    document.getElementById('filter-fakultet').value = '';
    document.getElementById('filter-kolegij').value = '';
    document.getElementById('filter-pretraga').value = '';
    prikaziOglase(oglasiSvi);
};

// --- Novi oglas ---
const newAdBtn = document.getElementById('new-ad-btn');
if (newAdBtn) {
    newAdBtn.onclick = () => {
        alert("Otvorit će se forma za novi oglas!");
        // Ovdje otvori modal ili preusmjeri na stranicu za unos novog oglasa
    };
}

// --- Provjera autentikacije i prikaz username-a ---
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        firebase.firestore().collection("users").doc(user.uid).get()
            .then(doc => {
                let username = "Korisnik";
                if (doc.exists && doc.data().username) {
                    username = doc.data().username;
                } else if (user.email) {
                    username = user.email;
                }
                document.querySelector('.side-menu-greeting').textContent = "Dobrodošli, " + username + "!";
                document.getElementById('main-body').style.display = '';
            })
            .catch(() => {
                document.querySelector('.side-menu-greeting').textContent = "Dobrodošli, " + (user.email || "Korisnik") + "!";
                document.getElementById('main-body').style.display = '';
            });
    } else {
        window.location.href = "../index.html";
    }
});
