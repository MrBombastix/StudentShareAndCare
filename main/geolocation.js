document.addEventListener('DOMContentLoaded', function() {
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
    const menuBtn = document.getElementById('menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const closeMenu = document.getElementById('close-menu');
    if (menuBtn && sideMenu) {
        let menuOpen = false;
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            if (!sideMenu.classList.contains('open')) {
                sideMenu.classList.add('open');
                menuOpen = true;
            }
        });
        closeMenu && closeMenu.addEventListener('click', function(e) {
            e.stopPropagation();
            sideMenu.classList.remove('open');
            menuOpen = false;
        });
        document.addEventListener('click', function(e) {
            if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && e.target !== menuBtn) {
                sideMenu.classList.remove('open');
                menuOpen = false;
            }
        });
    }
    // Notifikacije funkcionalnost
    const notifBtn = document.getElementById('notifications-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
        });
        notifDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        document.addEventListener('click', function(e) {
            if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
                notifDropdown.classList.remove('show');
            }
        });
    }
    // Odjava
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut().then(function() {
                window.location.href = '/index.html';
            });
        });
    }

    const btn = document.getElementById('get-location-btn');
    const status = document.getElementById('geo-status');
    const coords = document.getElementById('geo-coords');
    const mapDiv = document.getElementById('geo-map');
    const oglasi = [
        {
            naslov: 'Matematika 1 - Skripta',
            cijena: '30 kn',
            slika: '../pictures/books.png',
            lat: 45.803,
            lon: 15.970,
            opis: 'Odlična skripta za Matematiku 1, VVG.'
        },
        {
            naslov: 'Engleski udžbenik',
            cijena: 'Besplatno',
            slika: '../pictures/cura_leda_nacrtana.png',
            lat: 45.815,
            lon: 15.978,
            opis: 'Knjiga za Engleski jezik, očuvana.'
        },
        {
            naslov: 'Kemija zbirka zadataka',
            cijena: '20 kn',
            slika: '../pictures/books.png',
            lat: 45.792,
            lon: 15.955,
            opis: 'Zbirka zadataka za Kemiju, VVG.'
        },
        {
            naslov: 'Sociologija skripta',
            cijena: '15 kn',
            slika: '../pictures/books.png',
            lat: 45.810,
            lon: 15.965,
            opis: 'Skripta za sociologiju, Filozofski fakultet.'
        },
        {
            naslov: 'Engleski rječnik',
            cijena: 'Besplatno',
            slika: '../pictures/cura_leda_nacrtana.png',
            lat: 45.799,
            lon: 15.990,
            opis: 'Rječnik za engleski jezik, poklanjam.'
        }
    ];

    if (btn && status && coords && mapDiv) {
        btn.addEventListener('click', function() {
            status.textContent = '';
            coords.textContent = '';
            if (!navigator.geolocation) {
                status.textContent = 'Geolokacija nije podržana u vašem pregledniku.';
                return;
            }
            status.textContent = 'Dohvaćam lokaciju...';
            navigator.geolocation.getCurrentPosition(function(position) {
                status.textContent = '';
                const latitudeNum  = position.coords.latitude;
                const longitudeNum = position.coords.longitude;
                const latitude  = latitudeNum.toFixed(6);
                const longitude = longitudeNum.toFixed(6);
                coords.innerHTML = `<b>Širina:</b> ${latitude}<br><b>Dužina:</b> ${longitude}`;
                // Prikaz karte s Leafletom
                mapDiv.innerHTML = "<div id='leaflet-map' style='width:100%;height:320px;border-radius:12px;'></div>";
                mapDiv.style.display = 'block';
                // Inicijalizacija Leaflet karte
                const map = L.map('leaflet-map').setView([latitudeNum, longitudeNum], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap',
                    maxZoom: 19
                }).addTo(map);
                // Marker za korisnika
                const userMarker = L.marker([latitudeNum, longitudeNum]).addTo(map);
                userMarker.bindPopup('<b>Vi ste ovdje!</b>').openPopup();
                // Fake pinovi
                oglasi.forEach(o => {
                    const marker = L.marker([o.lat, o.lon]).addTo(map);
                    marker.bindPopup(`
                        <div style='min-width:160px;text-align:left;'>
                            <img src='${o.slika}' alt='${o.naslov}' style='width:48px;height:48px;object-fit:cover;border-radius:8px;box-shadow:0 1px 6px #4063c71a;margin-bottom:6px;'>
                            <div style='font-weight:600;color:#25408f;font-size:1.05rem;'>${o.naslov}</div>
                            <div style='color:#4063c7;font-size:0.98rem;'>${o.cijena}</div>
                            <div style='font-size:0.95em;color:#444;'>${o.opis}</div>
                        </div>
                    `);
                });
            }, function(err) {
                status.textContent = 'Ne mogu dohvatiti lokaciju. Provjerite dopuštenja preglednika.';
            }, {enableHighAccuracy:true});
        });
    }
});