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
                    // Prikaz u side-menu
                    var sideMenuGreeting = document.querySelector('.side-menu-greeting');
                    if (sideMenuGreeting) sideMenuGreeting.textContent = "Dobrodošli, " + username + "!";
                    // Prikaz u profile-card
                    var profileUsername = document.getElementById('profile-username');
                    if (profileUsername) profileUsername.textContent = username;
                    var profileEmail = document.getElementById('profile-email');
                    if (profileEmail) profileEmail.textContent = user.email || '';
                    document.body.style.display = '';
                })
                .catch(() => {
                    var sideMenuGreeting = document.querySelector('.side-menu-greeting');
                    if (sideMenuGreeting) sideMenuGreeting.textContent = "Dobrodošli, " + (user.email || "Korisnik") + "!";
                    var profileUsername = document.getElementById('profile-username');
                    if (profileUsername) profileUsername.textContent = user.email || "Korisnik";
                    var profileEmail = document.getElementById('profile-email');
                    if (profileEmail) profileEmail.textContent = user.email || '';
                    document.body.style.display = '';
                });
        } else {
            window.location.href = "../index.html";
        }
    });
    // Side menu funkcionalnost
    menuBtn.onclick = function() {
        sideMenu.classList.add('open');
    };
    closeMenu.onclick = function() {
        sideMenu.classList.remove('open');
    };
    document.addEventListener('click', function(e) {
        if (sideMenu.classList.contains('open') && !sideMenu.contains(e.target) && e.target !== menuBtn) {
            sideMenu.classList.remove('open');
        }
    });
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
    // --- Dodavanje prijatelja (zahtjev) ---
    const addFriendBtn = document.querySelector('.add-friend-btn');
    const addFriendModal = document.getElementById('add-friend-modal');
    const addFriendForm = document.getElementById('add-friend-form');
    const addFriendEmail = document.getElementById('add-friend-email');
    const addFriendError = document.getElementById('add-friend-error');
    const addFriendCancel = document.querySelector('.add-friend-cancel');
    if (addFriendBtn && addFriendModal && addFriendForm && addFriendEmail && addFriendCancel) {
        // Otvori modal na klik
        addFriendBtn.onclick = function() {
            addFriendModal.style.display = 'flex';
            addFriendForm.reset();
            addFriendError.textContent = '';
            setTimeout(() => { addFriendEmail.focus(); }, 100);
        };
        // Zatvori modal na klik Odustani
        addFriendCancel.onclick = function() {
            addFriendModal.style.display = 'none';
        };
        // Zatvori modal klikom izvan forme
        addFriendModal.onclick = function(e) {
            if (e.target === addFriendModal) addFriendModal.style.display = 'none';
        };
        // Slanje zahtjeva
        addFriendForm.onsubmit = async function(event) {
            event.preventDefault();
            const email = addFriendEmail.value.trim().toLowerCase();
            addFriendError.textContent = '';
            if (!email) {
                addFriendError.textContent = 'Unesi email.';
                return;
            }
            if (!window.firebase || !firebase.auth) {
                addFriendError.textContent = 'Greška s Firebaseom!';
                return;
            }
            const user = firebase.auth().currentUser;
            if (!user) {
                addFriendError.textContent = 'Nisi prijavljen!';
                console.error('Nisi prijavljen!');
                return;
            }
            if (user.email === email) {
                addFriendError.textContent = 'Ne možeš poslati zahtjev sam sebi!';
                return;
            }
            try {
                console.log('Tražim korisnika po emailu:', email);
                const usersRef = firebase.firestore().collection('users');
                const q = await usersRef.where('email', '==', email).get();
                if (q.empty) {
                    addFriendError.textContent = 'Korisnik nije pronađen!';
                    console.log('Korisnik nije pronađen!');
                    return;
                }
                const friendDoc = q.docs[0];
                const friendId = friendDoc.id;
                const friendEmail = friendDoc.data().email;
                console.log('Pronađen korisnik, id:', friendId, 'email:', friendEmail);
                console.log('Trenutni korisnik UID:', user.uid, 'email:', user.email);
                if (!user.uid || !friendId || !user.email || !friendEmail) {
                    addFriendError.textContent = 'Greška: Nedostaju podaci za upis.';
                    console.error('Nedostaju podaci:', { userUid: user.uid, friendId, userEmail: user.email, friendEmail });
                    return;
                }
                const reqRef = firebase.firestore().collection('users').doc(friendId).collection('friendRequests').doc(user.uid);
                const reqSnap = await reqRef.get();
                if (reqSnap.exists) {
                    addFriendError.textContent = 'Zahtjev već postoji!';
                    console.log('Zahtjev već postoji!');
                    return;
                }
                console.log('Upisujem zahtjev u bazu za korisnika:', friendId, 'od:', user.uid);
                console.log('Podaci:', {
                    from: user.uid,
                    fromEmail: user.email,
                    fromUsername: (firebase.auth().currentUser.displayName || null),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'pending'
                });
                await reqRef.set({
                    from: user.uid,
                    fromEmail: user.email,
                    fromUsername: (firebase.auth().currentUser.displayName || null),
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'pending'
                });
                console.log('Zahtjev uspješno poslan!');
                addFriendError.style.color = '#22a745'; 
                addFriendError.textContent = 'Zahtjev za prijateljstvo je poslan!';
                setTimeout(() => {
                    addFriendError.textContent = '';
                    addFriendError.style.color = '';
                    addFriendModal.style.display = 'none';
                }, 1800);
            } catch (err) {
                addFriendError.textContent = 'Greška pri slanju zahtjeva.';
                console.error('Greška pri slanju zahtjeva:', err && err.message, err);
            }
        };
    }
    // --- Prikaz dolaznih zahtjeva za prijateljstvo ---
    const friendRequestsList = document.getElementById('friend-requests-list');
    let unsubscribeFriendRequests = null;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && friendRequestsList) {
            // Real-time listener za zahtjeve
            if (unsubscribeFriendRequests) unsubscribeFriendRequests();
            unsubscribeFriendRequests = firebase.firestore()
                .collection('users').doc(user.uid)
                .collection('friendRequests')
                .where('status', '==', 'pending')
                .onSnapshot(async (snapshot) => {
                    if (snapshot.empty) {
                        friendRequestsList.innerHTML = '<li>Nema novih zahtjeva.</li>';
                        return;
                    }
                    friendRequestsList.innerHTML = '';
                    for (const doc of snapshot.docs) {
                        const data = doc.data();
                        // Dohvati username ako nije spremljen
                        let username = data.fromUsername;
                        if (!username && data.from) {
                            try {
                                const userDoc = await firebase.firestore().collection('users').doc(data.from).get();
                                username = userDoc.exists ? (userDoc.data().username || userDoc.data().email || 'Nepoznat korisnik') : 'Nepoznat korisnik';
                            } catch { username = 'Nepoznat korisnik'; }
                        }
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <div class="friend-request-info">
                                <span class="friend-request-email">${data.fromEmail || 'Nepoznat email'}</span>
                                <span class="friend-request-username">${username ? username : ''}</span>
                            </div>
                            <div class="friend-request-actions">
                                <button class="accept-friend-btn">Prihvati</button>
                                <button class="decline-friend-btn">Odbij</button>
                            </div>
                        `;
                        // Prihvati zahtjev
                        li.querySelector('.accept-friend-btn').onclick = async function() {
                            try {
                                // Dodaj prijatelja u obje kolekcije
                                await firebase.firestore().collection('users').doc(user.uid).collection('friends').doc(data.from).set({
                                    uid: data.from,
                                    email: data.fromEmail,
                                    username: username || null,
                                    since: firebase.firestore.FieldValue.serverTimestamp()
                                });
                                // Dohvati podatke o trenutnom korisniku
                                let myUsername = null;
                                try {
                                    const myDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                                    myUsername = myDoc.exists ? (myDoc.data().username || myDoc.data().email || null) : null;
                                } catch {}
                                await firebase.firestore().collection('users').doc(data.from).collection('friends').doc(user.uid).set({
                                    uid: user.uid,
                                    email: user.email,
                                    username: myUsername,
                                    since: firebase.firestore.FieldValue.serverTimestamp()
                                });
                                // Ažuriraj status zahtjeva
                                await firebase.firestore().collection('users').doc(user.uid).collection('friendRequests').doc(data.from).update({ status: 'accepted' });
                                li.remove();
                                alert('Prijatelj dodan!');
                                // Osvježi listu prijatelja za trenutnog korisnika
                                prikaziPrijatelje(user.uid);
                            } catch (err) {
                                alert('Greška pri prihvaćanju zahtjeva.');
                            }
                        };
                        // Odbij zahtjev
                        li.querySelector('.decline-friend-btn').onclick = async function() {
                            try {
                                await firebase.firestore().collection('users').doc(user.uid).collection('friendRequests').doc(data.from).update({ status: 'declined' });
                                li.remove();
                                alert('Zahtjev odbijen.');
                            } catch (err) {
                                alert('Greška pri odbijanju zahtjeva.');
                            }
                        };
                        friendRequestsList.appendChild(li);
                    }
                });
        }
    });
    // --- Prikaz prijatelja ---
    const friendsList = document.getElementById('profile-friends-list');
    function prikaziPrijatelje(uid) {
        if (!friendsList) return;
        friendsList.innerHTML = '<li>Učitavanje...</li>';
        try {
            firebase.firestore().collection('users').doc(uid).collection('friends')
                .orderBy('since', 'desc')
                .onSnapshot(snapshot => {
                    if (!snapshot || snapshot.empty) {
                        friendsList.innerHTML = '<li>Nema prijatelja.</li>';
                        return;
                    }
                    friendsList.innerHTML = '';
                    snapshot.forEach(async doc => {
                        const data = doc.data();
                        let displayName = data.username || data.email || 'Nepoznat korisnik';
                        let email = data.email || '';
                        // Always try to fetch the latest username/email from the main users collection
                        try {
                            const userDoc = await firebase.firestore().collection('users').doc(data.uid).get();
                            if (userDoc.exists) {
                                const userData = userDoc.data();
                                displayName = userData.username || userData.email || displayName;
                                email = userData.email || email;
                            }
                        } catch (e) {}
                        const li = document.createElement('li');
                        li.innerHTML = `<span style='font-weight:600;color:#4063c7;display:block;'>${displayName}</span><span style='font-size:0.97em;color:#25408f;display:block;margin-top:2px;'>${email}</span>`;
                        friendsList.appendChild(li);
                    });
                }, err => {
                    friendsList.innerHTML = '<li>Nema prijatelja.</li>';
                });
        } catch (e) {
            friendsList.innerHTML = '<li>Nema prijatelja.</li>';
        }
    }
    firebase.auth().onAuthStateChanged(function(user) {
        if (user && friendsList) {
            prikaziPrijatelje(user.uid);
        }
    });
    // "Natrag na početnu" gumb
    const backToMainBtn = document.getElementById('back-to-main');
    if (backToMainBtn) {
        backToMainBtn.onclick = function() {
            window.location.href = '../main.html';
        };
    }
    // Lokalna izmjena profilne slike
    const editAvatarBtn = document.getElementById('edit-avatar-btn');
    const avatarUpload = document.getElementById('avatar-upload');
    const profileAvatarImg = document.getElementById('profile-avatar-img');
    if (editAvatarBtn && avatarUpload && profileAvatarImg) {
        editAvatarBtn.onclick = function() {
            avatarUpload.click();
        };
        avatarUpload.onchange = function(e) {
            const file = e.target.files && e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(ev) {
                    profileAvatarImg.src = ev.target.result;
                };
                reader.readAsDataURL(file);
            }
        };
    }
});
