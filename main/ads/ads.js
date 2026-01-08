// Hamburger meni, side menu i notifikacije 
document.addEventListener('DOMContentLoaded', function() {
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');
    const notifBtn = document.getElementById('notifications-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    const logoutBtn = document.getElementById('logout-btn');

    // --- Firebase inicijalizacija i prikaz korisničkog imena u side-menu ---
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
    document.body.style.display = 'none';
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
                    var sideMenuGreeting = document.querySelector('.side-menu-greeting');
                    if (sideMenuGreeting) sideMenuGreeting.textContent = "Dobrodošli, " + username + "!";
                    document.body.style.display = '';
                })
                .catch(() => {
                    var sideMenuGreeting = document.querySelector('.side-menu-greeting');
                    if (sideMenuGreeting) sideMenuGreeting.textContent = "Dobrodošli, " + (user.email || "Korisnik") + "!";
                    document.body.style.display = '';
                });
        } else {
            window.location.href = "../index.html";
        }
    });
    // Side menu funkcionalnost
    if (menuBtn && sideMenu) {
        let menuOpen = false;
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!sideMenu.classList.contains('open')) {
                sideMenu.classList.add('open');
                menuOpen = true;
                console.log('Side menu opened');
            } else {
                console.log('Side menu already open');
            }
        });
        closeMenu && closeMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            sideMenu.classList.remove('open');
            menuOpen = false;
            console.log('Side menu closed (close button)');
        });
        document.addEventListener('click', function(e) {
            if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && e.target !== menuBtn) {
                sideMenu.classList.remove('open');
                menuOpen = false;
                console.log('Side menu closed (outside click)');
            }
        });
    } else {
        console.warn('menuBtn ili sideMenu nije pronađen u DOM-u!');
    }
    // Notifikacije funkcionalnost
    notifBtn.onclick = function(e) {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
    };
    notifDropdown.onclick = function(e) {
        e.stopPropagation();
    };
    document.addEventListener('click', function(e) {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
            notifDropdown.classList.remove('show');
        }
    });
    // Odjava
    logoutBtn.onclick = function() {
        firebase.auth().signOut().then(function() {
            window.location.href = '/index.html';
        });
    };

    // Modal i animacija naslova
    const title = document.querySelector('.ads-title-fun');
    function triggerPopWave() {
        title.classList.remove('pop-animate');
        // Force reflow to restart animation
        void title.offsetWidth;
        title.classList.add('pop-animate');
    }
    triggerPopWave();
    setInterval(triggerPopWave, 5000);

    setTimeout(function() {
        document.querySelectorAll('.delete-icon').forEach(function(icon) {
            icon.onclick = function(e) {
                e.stopPropagation();
                document.getElementById('delete-modal').style.display = 'flex';
            };
        });
    }, 0);
    document.getElementById('delete-modal').onclick = function(e) {
        if (e.target === this) this.style.display = 'none';
    };
    document.querySelectorAll('.delete-btn-yes, .delete-btn-no').forEach(function(btn) {
        btn.onclick = function() {
            document.getElementById('delete-modal').style.display = 'none';
        };
    });
    // --- DODANO: Modal za uređivanje oglasa DEMO ---
    kreirajEditModal();
    document.addEventListener('click', function(e) {
        const card = e.target.closest('.product-card');
        if (card && !e.target.closest('.delete-icon')) {
            // DEMO vrijednosti
            document.getElementById('edit-desc').value = 'Demo opis oglasa';
            document.getElementById('edit-price').value = 'Demo cijena';
            document.getElementById('edit-img').value = 'Demo slika';
            document.getElementById('edit-status').value = 'aktivno';
            document.getElementById('edit-modal').style.display = 'flex';
        }
    });
});

// DEMO: Modal za uređivanje oglasa
function kreirajEditModal() {
    if (document.getElementById('edit-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'edit-modal';
    modal.className = 'edit-modal';
    modal.innerHTML = `
      <div class="edit-modal-content">
        <h2>Uredi oglas</h2>
        <label>Opis:<br><textarea id="edit-desc" rows="3"></textarea></label>
        <label>Cijena:<br><input id="edit-price" type="text"></label>
        <label>Slika:<br><input id="edit-img" type="text"></label>
        <label>Status:<br>
          <select id="edit-status">
            <option value="aktivno">Aktivan</option>
            <option value="neaktivno">Neaktivan</option>
          </select>
        </label>
        <div class="edit-modal-buttons">
          <button id="edit-save">Spremi</button>
          <button id="edit-cancel">Odustani</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };
    document.getElementById('edit-cancel').onclick = function() { modal.style.display = 'none'; };
    document.getElementById('edit-save').onclick = function() { modal.style.display = 'none'; alert('Demo: promjene spremljene!'); };
}

function prikaziOglase(lista) {
    let html = '';
    lista.forEach((o, idx) => {
        html += `
        <div class="product-card" data-idx="${idx}">
            <img src="${o.slika}" alt="${o.naslov}" onerror="this.style.display='none'">
            <div class="product-info">
                <h3>${o.naslov}</h3>
                <span class="tag">${o.fakultet}</span>
                <p>${o.opis}</p>
            </div>
            <div class="bottom-row-demo">
                <span class="price">${o.cijena}</span>
                <span class="views-count">
                  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' style='width:1.1em;height:1.1em;vertical-align:middle;'><path d='M10 4c-5 0-9 6-9 6s4 6 9 6 9-6 9-6-4-6-9-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm0-6.5A2.5 2.5 0 1 0 10 13a2.5 2.5 0 0 0 0-5z' fill='currentColor'/></svg>
                  123
                </span>
                <span class="delete-icon" title="Obriši oglas">
                    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g>
                            <rect x="12" y="15" width="16" height="14" rx="2.5" fill="#e0e7ff" stroke="#4063c7" stroke-width="2"/>
                            <rect class="lid" x="10" y="10" width="20" height="6" rx="2.5" fill="#e0e7ff" stroke="#4063c7" stroke-width="2"/>
                            <rect x="16" y="19" width="2" height="7" rx="1" fill="#4063c7"/>
                            <rect x="20" y="19" width="2" height="7" rx="1" fill="#4063c7"/>
                            <rect x="24" y="19" width="2" height="7" rx="1" fill="#4063c7"/>
                        </g>
                    </svg>
                </span>
            </div>
        </div>`;
    });
    document.getElementById('product-list').innerHTML = html;
}

// --- DODANO: Modal za uređivanje oglasa DEMO ---
kreirajEditModal();
document.addEventListener('click', function(e) {
    const card = e.target.closest('.product-card');
    if (card && !e.target.closest('.delete-icon')) {
        // DEMO vrijednosti
        document.getElementById('edit-desc').value = 'Demo opis oglasa';
        document.getElementById('edit-price').value = 'Demo cijena';
        document.getElementById('edit-img').value = 'Demo slika';
        document.getElementById('edit-status').value = 'aktivno';
        document.getElementById('edit-modal').style.display = 'flex';
    }
});

console.log('ads.js loaded');
