// Konstanten
const GERMAN_MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const NRW_HOLIDAYS = {
    // Fixe Feiertage
    '1-1': 'Neujahrstag',
    '1-6': 'Heilige Drei Könige',
    '5-1': 'Tag der Arbeit',
    '12-25': 'Weihnachtstag',
    '12-26': '2. Weihnachtstag',
    // Variable Feiertage werden berechnet
};

const DEFAULT_PROFILES = [
    { id: 1, name: 'Anna', color: '#FF6B6B' },
    { id: 2, name: 'Max', color: '#4ECDC4' },
    { id: 3, name: 'Emma', color: '#FFD93D' }
];

// State Management
let state = {
    currentDate: new Date(),
    profiles: [],
    wishlists: {},
    selectedProfile: null,
    editingProfile: null
};

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    loadState();
    initializeApp();
    setupEventListeners();
});

// Service Worker Registrierung
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('sw.js');
            console.log('Service Worker registered');
        } catch (err) {
            console.log('Service Worker registration failed:', err);
        }
    }
}

// State Verwaltung
function loadState() {
    const saved = localStorage.getItem('appState');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.profiles = parsed.profiles || DEFAULT_PROFILES;
        state.wishlists = parsed.wishlists || {};
    } else {
        state.profiles = [...DEFAULT_PROFILES];
        saveState();
    }
}

function saveState() {
    localStorage.setItem('appState', JSON.stringify({
        profiles: state.profiles,
        wishlists: state.wishlists
    }));
}

// App Initialisierung
function initializeApp() {
    renderCalendar();
    renderProfiles();
    updateProfileFilter();
}

// Event Listener Setup
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchView(e.target.dataset.view));
    });

    // Kalender Navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() - 1);
        renderCalendar();
    });

    document.getElementById('next-month').addEventListener('click', () => {
        state.currentDate.setMonth(state.currentDate.getMonth() + 1);
        renderCalendar();
    });

    // Modal Controls
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('day-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('day-modal')) closeModal();
    });

    // Quick Wish
    document.getElementById('quick-wish-btn').addEventListener('click', addQuickWish);
    document.getElementById('quick-wish-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addQuickWish();
    });

    // Profile Management
    document.getElementById('add-profile-btn').addEventListener('click', openProfileModal);
    document.getElementById('save-profile-btn').addEventListener('click', saveProfile);
    document.getElementById('cancel-profile-btn').addEventListener('click', closeProfileModal);
    document.getElementById('profile-modal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('profile-modal')) closeProfileModal();
    });

    // Wishlist Filter
    document.getElementById('profile-filter').addEventListener('change', renderWishlists);
}

// View Management
function switchView(view) {
    document.querySelectorAll('main').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    if (view === 'calendar') {
        document.getElementById('calendar-view').classList.add('active');
    } else if (view === 'wishlist') {
        document.getElementById('wishlist-view').classList.add('active');
        renderWishlists();
    } else if (view === 'profiles') {
        document.getElementById('profiles-view').classList.add('active');
    }

    event.target.classList.add('active');
}

// Kalender Funktionen
function getEasterDate(year) {
    let a = year % 19;
    let b = Math.floor(year / 100);
    let c = year % 100;
    let d = Math.floor(b / 4);
    let e = b % 4;
    let f = Math.floor((b + 8) / 25);
    let g = Math.floor((b - f + 1) / 3);
    let h = (19 * a + b - d - g + 15) % 30;
    let i = Math.floor(c / 4);
    let k = c % 4;
    let l = (32 + 2 * e + 2 * i - h - k) % 7;
    let m = Math.floor((a + 11 * h + 22 * l) / 451);
    let month = Math.floor((h + l - 7 * m + 114) / 31);
    let day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

function getVariableHolidays(year) {
    const holidays = {};
    const easter = getEasterDate(year);
    
    // Karfreitag (2 Tage vor Ostern)
    const goodFriday = new Date(easter);
    goodFriday.setDate(goodFriday.getDate() - 2);
    holidays[`${goodFriday.getMonth() + 1}-${goodFriday.getDate()}`] = 'Karfreitag';
    
    // Ostermontag (1 Tag nach Ostern)
    const easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);
    holidays[`${easterMonday.getMonth() + 1}-${easterMonday.getDate()}`] = 'Ostermontag';
    
    // Christi Himmelfahrt (39 Tage nach Ostern)
    const ascension = new Date(easter);
    ascension.setDate(ascension.getDate() + 39);
    holidays[`${ascension.getMonth() + 1}-${ascension.getDate()}`] = 'Christi Himmelfahrt';
    
    // Pfingstmontag (50 Tage nach Ostern)
    const whitMonday = new Date(easter);
    whitMonday.setDate(whitMonday.getDate() + 50);
    holidays[`${whitMonday.getMonth() + 1}-${whitMonday.getDate()}`] = 'Pfingstmontag';
    
    // Fronleichnam (60 Tage nach Ostern)
    const corpusChrist = new Date(easter);
    corpusChrist.setDate(corpusChrist.getDate() + 60);
    holidays[`${corpusChrist.getMonth() + 1}-${corpusChrist.getDate()}`] = 'Fronleichnam';
    
    return holidays;
}

function getHolidayName(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const key = `${month}-${day}`;
    
    // Fixe Feiertage
    if (NRW_HOLIDAYS[key]) {
        return NRW_HOLIDAYS[key];
    }
    
    // Variable Feiertage
    const variableHolidays = getVariableHolidays(date.getFullYear());
    return variableHolidays[key] || null;
}

function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    // Header aktualisieren
    document.getElementById('month-year').textContent = 
        `${GERMAN_MONTHS[month]} ${year}`;
    
    // Kalender Grid zeichnen
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const totalCells = 42; // 6 Wochen
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    // Tage vom vorherigen Monat
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDay.getDate() - i;
        const cell = createDayCell(day, 'other-month');
        grid.appendChild(cell);
    }
    
    // Tage des aktuellen Monats
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const isToday = isDateToday(date);
        const holiday = getHolidayName(date);
        const cell = createDayCell(day, '', date, isToday, holiday);
        grid.appendChild(cell);
    }
    
    // Tage vom nächsten Monat
    const remainingCells = totalCells - (firstDayOfWeek + lastDay.getDate());
    for (let day = 1; day <= remainingCells; day++) {
        const cell = createDayCell(day, 'other-month');
        grid.appendChild(cell);
    }
}

function createDayCell(day, className = '', date = null, isToday = false, holiday = null) {
    const cell = document.createElement('div');
    cell.className = `day-cell ${className}`;
    
    if (isToday) cell.classList.add('today');
    if (holiday) cell.classList.add('holiday');
    
    const html = `
        <div class="day-number">${day}</div>
        ${holiday ? `<div class="day-holiday-name">${holiday}</div>` : ''}
    `;
    
    cell.innerHTML = html;
    
    if (date && !className.includes('other-month')) {
        const dateKey = getDateKey(date);
        const wishCount = Object.keys(state.wishlists).filter(k => k.startsWith(dateKey)).length;
        
        if (wishCount > 0) {
            const wishDiv = document.createElement('div');
            wishDiv.className = 'day-wishes-count';
            wishDiv.textContent = `💝 ${wishCount}`;
            cell.appendChild(wishDiv);
        }
        
        cell.addEventListener('click', () => openDayModal(date));
    }
    
    return cell;
}

function isDateToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Modal Funktionen
function openDayModal(date) {
    const dateKey = getDateKey(date);
    const holiday = getHolidayName(date);
    
    document.getElementById('modal-day-title').textContent = 
        `${date.toLocaleDateString('de-DE', { weekday: 'long', month: 'long', day: 'numeric' })}`;
    
    if (holiday) {
        document.getElementById('modal-holiday').textContent = `🎉 ${holiday}`;
        document.getElementById('modal-holiday').style.display = 'block';
    } else {
        document.getElementById('modal-holiday').style.display = 'none';
    }
    
    renderModalWishlist(dateKey);
    
    document.getElementById('day-modal').classList.add('active');
    document.getElementById('quick-wish-input').focus();
    
    // Store current date for wish adding
    document.getElementById('quick-wish-input').dataset.dateKey = dateKey;
}

function closeModal() {
    document.getElementById('day-modal').classList.remove('active');
}

function renderModalWishlist(dateKey) {
    const wishlist = state.wishlists[dateKey] || [];
    const container = document.getElementById('modal-wishlist');
    container.innerHTML = '';
    
    if (wishlist.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Noch keine Wünsche</p>';
        return;
    }
    
    wishlist.forEach((wish, index) => {
        const item = document.createElement('div');
        item.className = `wish-item ${wish.completed ? 'completed' : ''}`;
        item.innerHTML = `
            <span class="wish-text">${escapeHtml(wish.text)}</span>
            <div class="wish-actions">
                <button onclick="toggleWishCompletion('${dateKey}', ${index})" title="Abhaken">
                    ${wish.completed ? '✅' : '⭕'}
                </button>
                <button onclick="deleteWishFromModal('${dateKey}', ${index})" title="Löschen">
                    🗑️
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

function addQuickWish() {
    const input = document.getElementById('quick-wish-input');
    const dateKey = input.dataset.dateKey;
    const text = input.value.trim();
    
    if (!text) return;
    
    if (!state.wishlists[dateKey]) {
        state.wishlists[dateKey] = [];
    }
    
    state.wishlists[dateKey].push({
        text: text,
        completed: false,
        profile: state.selectedProfile,
        createdAt: new Date().toISOString()
    });
    
    saveState();
    input.value = '';
    renderModalWishlist(dateKey);
    renderCalendar();
}

function toggleWishCompletion(dateKey, index) {
    if (state.wishlists[dateKey]) {
        state.wishlists[dateKey][index].completed = !state.wishlists[dateKey][index].completed;
        saveState();
        renderModalWishlist(dateKey);
    }
}

function deleteWishFromModal(dateKey, index) {
    if (confirm('Wunsch wirklich löschen?')) {
        state.wishlists[dateKey].splice(index, 1);
        if (state.wishlists[dateKey].length === 0) {
            delete state.wishlists[dateKey];
        }
        saveState();
        renderModalWishlist(dateKey);
        renderCalendar();
    }
}

// Wunschlisten View
function renderWishlists() {
    const profileFilter = document.getElementById('profile-filter').value;
    const list = document.getElementById('wishlist-list');
    const empty = document.getElementById('empty-wishlist');
    
    list.innerHTML = '';
    let hasWishlists = false;
    
    // Wunschlisten sortiert nach Datum
    const sortedEntries = Object.entries(state.wishlists)
        .map(([key, wishes]) => {
            const [year, month, day] = key.split('-');
            const date = new Date(year, month - 1, day);
            return { key, date, wishes };
        })
        .sort((a, b) => a.date - b.date);
    
    sortedEntries.forEach(({ key, date, wishes }) => {
        // Filter nach Profil
        const filteredWishes = profileFilter 
            ? wishes.filter(w => w.profile === profileFilter)
            : wishes;
        
        if (filteredWishes.length === 0) return;
        
        hasWishlists = true;
        const card = document.createElement('div');
        card.className = 'wishlist-card';
        
        const dateStr = date.toLocaleDateString('de-DE', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const holiday = getHolidayName(date);
        
        let html = `
            <div class="wishlist-card-header">
                <div>
                    <div class="wishlist-card-title">${dateStr}</div>
                    ${holiday ? `<p style="color: #F57F17;">🎉 ${holiday}</p>` : ''}
                </div>
            </div>
            <ul class="wishlist-items">
        `;
        
        filteredWishes.forEach((wish, index) => {
            const profileName = state.profiles.find(p => p.id === wish.profile)?.name || 'Unbekannt';
            html += `
                <li class="${wish.completed ? 'completed' : ''}">
                    <div style="flex: 1;">
                        <div class="wish-text">${escapeHtml(wish.text)}</div>
                        <small style="color: #999;">Profil: ${profileName}</small>
                    </div>
                    <div class="wish-item-actions">
                        <button onclick="toggleWishInList('${key}', ${index})" title="Status">
                            ${wish.completed ? '✅' : '⭕'}
                        </button>
                        <button onclick="editWishInList('${key}', ${index})" title="Bearbeiten">
                            ✏️
                        </button>
                        <button onclick="deleteWishInList('${key}', ${index})" title="Löschen">
                            🗑️
                        </button>
                    </div>
                </li>
            `;
        });
        
        html += '</ul>';
        card.innerHTML = html;
        list.appendChild(card);
    });
    
    empty.style.display = hasWishlists ? 'none' : 'block';
}

function toggleWishInList(dateKey, index) {
    if (state.wishlists[dateKey]) {
        state.wishlists[dateKey][index].completed = !state.wishlists[dateKey][index].completed;
        saveState();
        renderWishlists();
    }
}

function editWishInList(dateKey, index) {
    const wish = state.wishlists[dateKey][index];
    const newText = prompt('Wunsch bearbeiten:', wish.text);
    
    if (newText !== null && newText.trim()) {
        state.wishlists[dateKey][index].text = newText.trim();
        saveState();
        renderWishlists();
    }
}

function deleteWishInList(dateKey, index) {
    if (confirm('Wunsch wirklich löschen?')) {
        state.wishlists[dateKey].splice(index, 1);
        if (state.wishlists[dateKey].length === 0) {
            delete state.wishlists[dateKey];
        }
        saveState();
        renderWishlists();
    }
}

// Profile Funktionen
function renderProfiles() {
    const container = document.getElementById('profiles-list');
    container.innerHTML = '';
    
    state.profiles.forEach((profile, index) => {
        const card = document.createElement('div');
        card.className = `profile-card ${index < 3 ? 'default' : ''}`;
        card.style.backgroundColor = profile.color;
        
        const deleteBtn = index >= 3 ? `<button onclick="deleteProfile(${profile.id})">🗑️</button>` : '';
        
        card.innerHTML = `
            <div class="profile-card-name">${profile.name}</div>
            <div class="profile-card-actions">
                <button onclick="editProfile(${profile.id})">✏️</button>
                ${deleteBtn}
            </div>
        `;
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                selectProfile(profile.id);
            }
        });
        
        if (state.selectedProfile === profile.id) {
            card.style.borderColor = 'rgba(0,0,0,0.3)';
            card.style.borderWidth = '3px';
        }
        
        container.appendChild(card);
    });
}

function selectProfile(profileId) {
    state.selectedProfile = profileId;
    saveState();
    renderProfiles();
}

function openProfileModal() {
    state.editingProfile = null;
    document.getElementById('profile-modal-title').textContent = 'Neues Profil erstellen';
    document.getElementById('profile-name').value = '';
    document.getElementById('profile-color').value = '#FF6B6B';
    document.getElementById('profile-modal').classList.add('active');
    document.getElementById('profile-name').focus();
}

function closeProfileModal() {
    document.getElementById('profile-modal').classList.remove('active');
}

function editProfile(profileId) {
    const profile = state.profiles.find(p => p.id === profileId);
    if (!profile) return;
    
    state.editingProfile = profileId;
    document.getElementById('profile-modal-title').textContent = 'Profil bearbeiten';
    document.getElementById('profile-name').value = profile.name;
    document.getElementById('profile-color').value = profile.color;
    document.getElementById('profile-modal').classList.add('active');
    document.getElementById('profile-name').focus();
}

function saveProfile() {
    const name = document.getElementById('profile-name').value.trim();
    const color = document.getElementById('profile-color').value;
    
    if (!name) {
        alert('Bitte einen Namen eingeben');
        return;
    }
    
    if (state.editingProfile) {
        const profile = state.profiles.find(p => p.id === state.editingProfile);
        if (profile) {
            profile.name = name;
            profile.color = color;
        }
    } else {
        const newId = Math.max(...state.profiles.map(p => p.id), 0) + 1;
        state.profiles.push({ id: newId, name, color });
    }
    
    saveState();
    renderProfiles();
    updateProfileFilter();
    closeProfileModal();
}

function deleteProfile(profileId) {
    if (confirm('Profil wirklich löschen?')) {
        state.profiles = state.profiles.filter(p => p.id !== profileId);
        if (state.selectedProfile === profileId) {
            state.selectedProfile = null;
        }
        saveState();
        renderProfiles();
        updateProfileFilter();
    }
}

function updateProfileFilter() {
    const select = document.getElementById('profile-filter');
    select.innerHTML = '<option value="">Alle Profile</option>';
    
    state.profiles.forEach(profile => {
        const option = document.createElement('option');
        option.value = profile.id;
        option.textContent = profile.name;
        select.appendChild(option);
    });
}

// Utility Funktionen
function getDateKey(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}