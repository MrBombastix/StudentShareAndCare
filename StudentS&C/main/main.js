// Hamburger meni
const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const closeMenu = document.getElementById('close-menu');

if (menuBtn && sideMenu && closeMenu) {
    menuBtn.onclick = () => sideMenu.classList.add('open');
    closeMenu.onclick = () => sideMenu.classList.remove('open');
}

// Odjava
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = () => {
        window.location.href = "../index.html";
    };
}

// Obavijesti dropdown
const notifBtn = document.getElementById('notifications-btn');
const notifDropdown = document.getElementById('notif-dropdown');

if (notifBtn && notifDropdown) {
    notifBtn.onclick = (e) => {
        e.stopPropagation();
        notifDropdown.style.display = notifDropdown.style.display === 'block' ? 'none' : 'block';
    };

    document.body.onclick = (e) => {
        if (notifDropdown.style.display === 'block') {
            notifDropdown.style.display = 'none';
        }
    };
}

notifBtn.onclick = (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('show');
};
document.body.onclick = () => {
    notifDropdown.classList.remove('show');
};

document.getElementById('input-excel').addEventListener('change', function(e) {
    readXlsxFile(e.target.files[0]).then(function(rows) {
        // Pretpostavljamo da je prvi red zaglavlje
        let html = '';
        for(let i=1; i<rows.length; i++) {
            let [naslov, fakultet, opis, cijena, slika] = rows[i];
            html += `
            <div class="product-card">
                <img src="${slika}" alt="${naslov}">
                <div class="product-info">
                    <h3>${naslov}</h3>
                    <span class="tag">${fakultet}</span>
                    <p>${opis}</p>
                    <div class="price">${cijena}</div>
                </div>
            </div>`;
        }
        document.getElementById('product-list').innerHTML = html;
    });
});

let oglasiSvi = []; // Globalna varijabla za sve oglase

// Učitavanje Excel datoteke
document.getElementById('input-excel').addEventListener('change', function(e) {
    readXlsxFile(e.target.files[0]).then(function(rows) {
        oglasiSvi = [];
        for(let i = 1; i < rows.length; i++) {
            let [naslov, fakultet, opis, cijena, slika] = rows[i];
            oglasiSvi.push({ 
                naslov: naslov?.toString() || '', 
                fakultet: fakultet?.toString() || '', 
                opis: opis?.toString() || '', 
                cijena: cijena?.toString() || '', 
                slika: slika?.toString() || ''
            });
        }
        prikaziOglase(oglasiSvi);
    });
});

// Funkcija za prikaz oglasa
function prikaziOglase(lista) {
    let html = '';
    lista.forEach(o => {
        html += `
        <div class="product-card">
            <img src="${o.slika}" alt="${o.naslov}">
            <div class="product-info">
                <h3>${o.naslov}</h3>
                <span class="tag">${o.fakultet}</span>
                <p>${o.opis}</p>
                <div class="price">${o.cijena}</div>
            </div>
        </div>`;
    });
    document.getElementById('product-list').innerHTML = html;
}

// Filter funkcionalnost
document.getElementById('search-filters').onclick = function(e) {
    e.preventDefault();
    
    const fakultet = document.getElementById('filter-fakultet').value.trim().toLowerCase();
    const kolegij = document.getElementById('filter-kolegij').value.trim().toLowerCase();
    const pretraga = document.getElementById('filter-pretraga').value.trim().toLowerCase();

    const filtrirani = oglasiSvi.filter(oglas => {
        const matchFakultet = fakultet ? oglas.fakultet.toLowerCase().includes(fakultet) : true;
        const matchKolegij = kolegij ? oglas.naslov.toLowerCase().includes(kolegij) : true;
        const matchPretraga = pretraga ? (
            oglas.naslov.toLowerCase().includes(pretraga) || 
            oglas.opis.toLowerCase().includes(pretraga)
        ) : true;

        return matchFakultet && matchKolegij && matchPretraga;
    });

    prikaziOglase(filtrirani);
};

// Reset filtera
document.getElementById('clear-filters').onclick = function() {
    document.getElementById('filter-fakultet').value = '';
    document.getElementById('filter-kolegij').value = '';
    document.getElementById('filter-pretraga').value = '';
    prikaziOglase(oglasiSvi);
};
const newAdBtn = document.getElementById('new-ad-btn');
if (newAdBtn) {
    newAdBtn.onclick = () => {
        alert("Otvorit će se forma za novi oglas!");
        // Ovdje otvori modal ili preusmjeri na stranicu za unos novog oglasa
    };
}
