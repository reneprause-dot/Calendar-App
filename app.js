// Konstanten
const GERMAN_MONTHS = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const NRW_HOLIDAYS = {
    '1-1': 'Neujahrstag',
    '1-6': 'Heilige Drei Könige',
    '5-1': 'Tag der Arbeit',
    '12-25': 'Weihnachtstag',
    '12-26': '2. Weihnachtstag',
};

const DEFAULT_PROFILES = [
    { id: 1, name: 'Anna', color: '#FF6B6B' },
    { id: 2, name: 'Max', color: '#4ECDC4' },
    { id: 3, name: 'Emma', color: '#FFD93D' }
];

const COLOR_NAMES = {
    '#FF6B6B': 'Rot',
    '#FF9F5A': 'Orange',
    '#FFD93D': 'Gelb',
    '#6BCF7F': 'Grün',
    '#4ECDC4': 'Türkis',
    '#00D4FF': 'Cyan',
    '#A78BFA': 'Lila',
    '#FF6B9D': 'Rosa'
};

let state = {
    currentDate: new Date(),
    profiles: [],
    wishlists: {},
    selectedProfile: null,
    editingProfile: null
};

document.addEventListener('DOMContentLoaded', () => {
    registerServiceWorker();
    loadState();
    initializeApp();
    setupEventListeners();
});

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

function initializeApp() {
    renderCalendar();
    renderProfiles();
    updateProfileFilter();
}

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchView(e.target.closest('.nav-btn').dataset.view));
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
    const closeButtons = document.querySelectorAll('.modal-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.classList.remove('active');
        });
    });

    // Modal Overlay Click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            modal.classList.remove('active');
        });
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

    // Color picker label update
    document.getElementById('profile-color').addEventListener('change', (e) => {
        updateColorLabel(e.target.value);
    });

    // Wishlist Filter
    document.getElementById('profile-filter').addEventListener('change', renderWishlists);
}

function switchView(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    if (view === 'calendar') {
        document.getElementById('calendar-view').classList.add('active');
    } else if (view === 'wishlist') {
        document.getElementById('wishlist-view').classList.add('active');
        renderWishlists();
    } else if (view === 'profiles') {
        document.getElementById('profiles-view').classList.add('active');
    }

    document.querySelector(`[data-view="${view}"]`).classList.add('active');
}

// Easter Calculation
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
    
    const goodFriday = new Date(easter);
    goodFriday.setDate(goodFriday.getDate() - 2);
    holidays[`${goodFriday.getMonth() + 1}-${goodFriday.getDate()}`] = 'Karfreitag';
    
    const easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);
    holidays[`${easterMonday.getMonth() + 1}-${easterMonday.getDate()}`] = 'Ostermontag';
    
    const ascension = new Date(easter);
    ascension.setDate(ascension.getDate() + 39);
    holidays[`${ascension.getMonth() + 1}-${ascension.getDate()}`] = 'Christi Himmelfahrt';
    
    const whitMonday = new Date(easter);
    whitMonday.setDate(whitMonday.getDate() + 50);
    holidays[`${whitMonday.getMonth() + 1}-${whitMonday.getDate()}`] = 'Pfingstmontag';
    
    const corpusChrist = new Date(easter);
    corpusChrist.setDate(corpusChrist.getDate() + 60);
    holidays[`${corpusChrist.getMonth() + 1}-${corpusChrist.getDate()}`] = 'Fronleichnam';
    
    return holidays;
}

function getHolidayName(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const key = `${month}-${day}`;
    
    if (NRW_HOLIDAYS[key]) {
        return NRW_HOLIDAYS[key];
    }
    
    const variableHolidays = getVariableHolidays(date.getFullYear());
    return variableHolidays[key] || null;
}

function renderCalendar() {
    const year = state.currentDate.getFullYear();
    const month = state.currentDate.getMonth();
    
    document.getElementById('month-year').textContent = 
        `${GERMAN_MONTHS[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const totalCells = 42;
    
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevLastDay.getDate() - i;
        const cell = createDayCell(day, 'other-month');
        grid.appendChild(cell);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const isToday = isDateToday(date);
        const holiday = getHolidayName(date);
        const cell = createDayCell(day, '', date, isToday, holiday);
        grid.appendChild(cell);
    }
    
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
    
    let html = `<div class="day-number">${day}</div>`;
    if (holiday) {
        html += `<div class="day-holiday-name">${holiday.split(' ').slice(0, 1).join(' ')}</div>`;
    }
    
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

function openDayModal(date) {
    const dateKey = getDateKey(date);
    const holiday = getHolidayName(date);
    
    document.getElementById('modal-day-title').textContent = 
        `${date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' })}`;
    
    const holidayEl = document.getElementById('modal-holiday');
    if (holiday) {
        holidayEl.textContent = `🎉 ${holiday}`;
        holidayEl.style.display = 'block';
    } else {
        holidayEl.style.display = 'none';
    }
    
    renderModalWishlist(dateKey);
    
    const modal = document.getElementById('day-modal');
    modal.classList.add('active');
    document.getElementById('quick-wish-input').focus();
    document.getElementById('quick-wish-input').dataset.dateKey = dateKey;
}

function renderModalWishlist(dateKey) {
    const wishlist = state.wishlists[dateKey] || [];
    const container = document.getElementById('modal-wishlist');
    container.innerHTML = '';
    
    if (wishlist.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 1rem;">Noch keine Wünsche 🎁</p>';
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

function renderWishlists() {
    const profileFilter = document.getElementById('profile-filter').value;
    const list = document.getElementById('wishlist-list');
    const empty = document.getElementById('empty-wishlist');
    
    list.innerHTML = '';
    let hasWishlists = false;
    
    const sortedEntries = Object.entries(state.wishlists)
        .map(([key, wishes]) => {
            const [year, month, day] = key.split('-');
            const date = new Date(year, month - 1, day);
            return { key, date, wishes };
        })
        .sort((a, b) => a.date - b.date);
    
    sortedEntries.forEach(({ key, date, wishes }) => {
        const filteredWishes = profileFilter 
            ? wishes.filter(w => w.profile === profileFilter)
            : wishes;
        
        if (filteredWishes.length === 0) return;
        
        hasWishlists = true;
        const card = document.createElement('div');
        card.className = 'wishlist-card';
        
        const dateStr = date.toLocaleDateString('de-DE', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const holiday = getHolidayName(date);
        
        let html = `
            <div class="wishlist-card-header">
                <div>
                    <div class="wishlist-card-title">${dateStr}</div>
                    ${holiday ? `<p style="color: #FF9F5A; font-weight: 600; margin-top: 4px;">🎉 ${holiday}</p>` : ''}
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
                        <small style="color: #999; font-size: 0.85rem;">👤 ${profileName}</small>
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
    
    empty.style.display = hasWishlists ? 'none' : 'flex';
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

function renderProfiles() {
    const container = document.getElementById('profiles-list');
    container.innerHTML = '';
    
    state.profiles.forEach((profile, index) => {
        const card = document.createElement('div');
        card.className = `profile-card ${state.selectedProfile === profile.id ? 'selected' : ''}`;
        card.style.background = `linear-gradient(135deg, ${profile.color}, ${adjustColor(profile.color, 30)})`;
        
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
    updateColorLabel('#FF6B6B');
    const modal = document.getElementById('profile-modal');
    modal.classList.add('active');
    setTimeout(() => document.getElementById('profile-name').focus(), 100);
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
    updateColorLabel(profile.color);
    const modal = document.getElementById('profile-modal');
    modal.classList.add('active');
    setTimeout(() => document.getElementById('profile-name').focus(), 100);
}

function updateColorLabel(color) {
    const label = document.getElementById('color-label');
    label.textContent = COLOR_NAMES[color] || 'Farbe';
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

function adjustColor(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, (num >> 8 & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return (usePound ? '#' : '') + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
}