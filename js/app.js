/* ============================================
   ZEITREISE APP - Main Application Logic
   ============================================ */

const App = {
    // State
    data: {
        timeline: null,
        unken: null,
        quiz: null
    },
    currentView: 'home',
    audioEnabled: true,

    // Initialization
    init() {
        console.log('🚀 Zeitreise App startet...');

        // Load data from global variables (injected via data-*.js files)
        try {
            this.loadData();
        } catch (err) {
            console.error('Fehler beim Laden der Daten:', err);
            this.showError('Die Daten konnten nicht geladen werden. Bitte lade die Seite neu.');
            return;
        }

        // Setup UI
        this.setupNavigation();
        this.setupAudioToggle();
        this.setupModal();
        this.updateStats();

        // Initialize modules
        if (typeof Timeline !== 'undefined') Timeline.init(this.data.timeline);
        if (typeof UnkenView !== 'undefined') UnkenView.init(this.data.unken);
        if (typeof Quiz !== 'undefined') Quiz.init(this.data.quiz);

        // Hide loading screen
        setTimeout(() => {
            const loading = document.getElementById('loadingScreen');
            if (loading) loading.classList.add('hidden');
        }, 800);

        // Read hash for deep-link
        this.handleHash();
        window.addEventListener('hashchange', () => this.handleHash());

        console.log('✅ App bereit!');
    },

    loadData() {
        if (!window.TIMELINE_DATA || !window.UNKEN_DATA || !window.QUIZ_DATA) {
            throw new Error('Data files not loaded');
        }
        this.data.timeline = window.TIMELINE_DATA;
        this.data.unken = window.UNKEN_DATA;
        this.data.quiz = window.QUIZ_DATA;
    },

    setupNavigation() {
        const buttons = document.querySelectorAll('[data-view]');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const view = btn.dataset.view;
                this.showView(view);
            });
        });
    },

    showView(viewName) {
        if (!viewName) return;

        // Hide all views
        document.querySelectorAll('.view').forEach(v => {
            v.hidden = true;
            v.classList.remove('active');
        });

        // Show target
        const target = document.getElementById('view-' + viewName);
        if (target) {
            target.hidden = false;
            target.classList.add('active');
        }

        // Update nav
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        this.currentView = viewName;
        window.location.hash = viewName === 'home' ? '' : '#' + viewName;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    handleHash() {
        const hash = window.location.hash.replace('#', '');
        if (hash && ['home', 'timeline', 'unken', 'quiz', 'info'].includes(hash)) {
            this.showView(hash);
        }
    },

    setupAudioToggle() {
        const btn = document.getElementById('audioToggle');
        if (!btn) return;

        // Load saved pref from sessionStorage fallback (just use in-memory)
        this.audioEnabled = true;

        btn.addEventListener('click', () => {
            this.audioEnabled = !this.audioEnabled;
            btn.classList.toggle('muted', !this.audioEnabled);

            // Stop any playing audio if disabled
            if (!this.audioEnabled) {
                document.querySelectorAll('audio').forEach(a => a.pause());
            }
        });
    },

    playAudio(audioId) {
        if (!this.audioEnabled) return;

        // Stop all other audios
        document.querySelectorAll('audio.app-audio').forEach(a => {
            a.pause();
            a.currentTime = 0;
        });

        const audioPath = `assets/audio/${audioId}.mp3`;
        let audio = document.getElementById('audio-' + audioId);

        if (!audio) {
            audio = new Audio(audioPath);
            audio.id = 'audio-' + audioId;
            audio.classList.add('app-audio');
            audio.preload = 'none';
            document.body.appendChild(audio);
        }

        audio.play().catch(err => {
            console.log(`Audio ${audioId} nicht verfügbar:`, err.message);
            // Silent fail - audio files may not exist yet
        });
    },

    setupModal() {
        const modal = document.getElementById('eventModal');
        if (!modal) return;

        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');

        const close = () => this.closeModal();

        if (closeBtn) closeBtn.addEventListener('click', close);
        if (overlay) overlay.addEventListener('click', close);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.hidden) close();
        });
    },

    openModal(event, epoch) {
        const modal = document.getElementById('eventModal');
        const body = document.getElementById('modalBody');
        if (!modal || !body) return;

        const epochData = epoch || { color: '#F57C00', name: '' };

        const sourcesHtml = (event.sources || []).map(s =>
            `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title} ↗</a></li>`
        ).join('');

        const keywordsHtml = (event.keywords || []).map(k =>
            `<span class="modal-keyword">${k}</span>`
        ).join('');

        // Image: use event.image if provided, otherwise try assets/images/{id}.webp
        const imageUrl = event.image || `assets/images/${event.id}.webp`;
        const imageAlt = event.imageAlt || event.title;
        const imageCaption = event.imageCaption || `${event.date} \u00b7 ${event.title}`;

        body.innerHTML = `
            <div class="modal-header" style="background: linear-gradient(135deg, ${epochData.color}, ${this.lighten(epochData.color, 20)});">
                <div class="modal-icon">${event.icon || epochData.emoji || '\u23F3'}</div>
                <div class="modal-date">${event.date}</div>
                <h2 id="modalTitle">${event.title}</h2>
            </div>
            <figure class="modal-image">
                <img src="${imageUrl}" alt="${this.escapeAttr(imageAlt)}" loading="lazy" data-event-id="${event.id}" data-epoch-id="${event.epoch}" onerror="App.handleImageError(this)">
                <figcaption class="modal-image-caption">${imageCaption}</figcaption>
            </figure>
            <div class="modal-body-content">
                <div class="modal-audio">
                    <button class="modal-audio-btn" onclick="App.playAudio('${event.id}')" aria-label="Vorlesen">
                        \u{1F50A}
                    </button>
                    <div class="modal-audio-label">Klick auf den Knopf zum Vorlesen</div>
                </div>
                <p class="modal-description">${event.description}</p>
                ${event.funFact ? `
                    <div class="modal-funfact">
                        <div class="modal-funfact-label">\u{1F4A1} Wusstest du?</div>
                        <div class="modal-funfact-text">${event.funFact}</div>
                    </div>
                ` : ''}
                ${keywordsHtml ? `<div class="modal-keywords">${keywordsHtml}</div>` : ''}
                ${sourcesHtml ? `
                    <div class="modal-sources">
                        <div class="modal-sources-label">\u{1F4D6} Quellen</div>
                        <ul class="modal-sources-list">${sourcesHtml}</ul>
                    </div>
                ` : ''}
            </div>
        `;

        modal.hidden = false;
        document.body.style.overflow = 'hidden';

        // Focus close button
        setTimeout(() => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) closeBtn.focus();
        }, 100);
    },

    closeModal() {
        const modal = document.getElementById('eventModal');
        if (modal) {
            modal.hidden = true;
            document.body.style.overflow = '';
        }
        // Stop audio when closing
        document.querySelectorAll('audio.app-audio').forEach(a => a.pause());
    },

    updateStats() {
        const statEvents = document.getElementById('statEvents');
        const statEpochs = document.getElementById('statEpochs');
        const statQuiz = document.getElementById('statQuiz');

        if (statEvents && this.data.timeline) {
            statEvents.textContent = this.data.timeline.events.length;
        }
        if (statEpochs && this.data.timeline) {
            statEpochs.textContent = this.data.timeline.epochs.length;
        }
        if (statQuiz && this.data.quiz) {
            statQuiz.textContent = this.data.quiz.questions.length;
        }
    },

    // Build a themed SVG placeholder image (data URL) for events without a photo
    buildPlaceholderImage(event, epoch) {
        const color = (epoch && epoch.color) || '#6B1F1F';
        const color2 = this.lighten(color, 30);
        const icon = event.icon || (epoch && epoch.emoji) || '\u23F3';
        const date = (event.date || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const title = (event.title || '').substring(0, 48).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const epochName = ((epoch && epoch.name) || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');

        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
            <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="${color}"/>
                    <stop offset="1" stop-color="${color2}"/>
                </linearGradient>
                <pattern id="p" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="1.5" fill="rgba(255,255,255,0.08)"/>
                </pattern>
            </defs>
            <rect width="800" height="450" fill="url(#g)"/>
            <rect width="800" height="450" fill="url(#p)"/>
            <rect x="24" y="24" width="752" height="402" fill="none" stroke="rgba(235,217,163,0.4)" stroke-width="2" stroke-dasharray="6 4"/>
            <rect x="32" y="32" width="736" height="386" fill="none" stroke="rgba(235,217,163,0.25)" stroke-width="1"/>
            <text x="400" y="200" font-size="140" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif">${icon}</text>
            <text x="400" y="310" font-size="26" fill="rgba(235,217,163,0.95)" text-anchor="middle" font-family="Georgia, serif" font-style="italic">${date}</text>
            <text x="400" y="348" font-size="20" fill="rgba(255,255,255,0.85)" text-anchor="middle" font-family="Georgia, serif">${title}</text>
            <text x="400" y="400" font-size="12" fill="rgba(235,217,163,0.7)" text-anchor="middle" font-family="Georgia, serif" letter-spacing="4">${epochName.toUpperCase()}</text>
        </svg>`;
        return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    },

    handleImageError(img) {
        if (img.dataset.fallback) {
            // Already tried fallback, hide image
            img.parentElement.classList.add('modal-image-error');
            return;
        }
        img.dataset.fallback = '1';
        const eventId = img.dataset.eventId;
        const epochId = img.dataset.epochId;
        const event = this.data.timeline.events.find(e => e.id === eventId);
        const epoch = this.data.timeline.epochs.find(e => e.id === epochId);
        img.src = this.buildPlaceholderImage(event || {}, epoch || {});
    },

    escapeAttr(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    },

    // Utility: lighten a hex color
    lighten(hex, percent) {
        try {
            const num = parseInt(hex.replace('#', ''), 16);
            const amt = Math.round(2.55 * percent);
            const R = Math.min(255, (num >> 16) + amt);
            const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
            const B = Math.min(255, (num & 0x0000FF) + amt);
            return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
        } catch (e) {
            return hex;
        }
    },

    showError(message) {
        const main = document.getElementById('app');
        if (main) {
            main.innerHTML = `
                <div style="text-align:center; padding: 4rem 1rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">😔</div>
                    <h2 style="color: #D32F2F; margin-bottom: 1rem;">Ups!</h2>
                    <p>${message}</p>
                </div>
            `;
        }
        const loading = document.getElementById('loadingScreen');
        if (loading) loading.classList.add('hidden');
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
