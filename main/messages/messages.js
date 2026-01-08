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
    const notifBtn = document.getElementById('notifications-btn');
    const notifDropdown = document.getElementById('notif-dropdown');
    notifBtn.onclick = function(e) {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
    };
    document.addEventListener('click', function(e) {
        if (!notifDropdown.contains(e.target) && e.target !== notifBtn) {
            notifDropdown.classList.remove('show');
        }
    });
    // Odjava
    document.getElementById('logout-btn').onclick = function() {
        firebase.auth().signOut().then(function() {
            window.location.href = '/index.html';
        });
    };
});
