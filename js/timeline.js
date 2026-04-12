/* TIMELINE MODULE */

const Timeline = {
    data: null,
    epochMap: {},
    currentFilter: 'all',
    currentEvents: [],
    _sliderDragging: false,
    _sliderTimeout: null,

    init(data) {
        if (!data) return;
        this.data = data;
        this.epochMap = {};
        data.epochs.forEach(e => { this.epochMap[e.id] = e; });
        this.renderFilter();
        this.renderTimeline();
        this.initSlider();
        this.setupVisibilityToggle();
    },

    renderFilter() {
        const container = document.getElementById('epochFilter');
        if (!container) return;
        const epochs = this.data.epochs;
        let html = '<button class="epoch-chip active" data-epoch="all" style="--epoch-color: #6B1F1F;"><span class="epoch-chip-icon">\u{1F310}</span><span>Alle</span></button>';
        epochs.forEach(epoch => {
            html += '<button class="epoch-chip" data-epoch="' + epoch.id + '" style="--epoch-color: ' + epoch.color + ';"><span class="epoch-chip-icon">' + (epoch.emoji || '\u2022') + '</span><span>' + epoch.name + '</span></button>';
        });
        container.innerHTML = html;
        this.updateChipColors();
        container.querySelectorAll('.epoch-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                container.querySelectorAll('.epoch-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.dataset.epoch;
                this.updateChipColors();
                this.renderTimeline();
                this.renderEpochMarkers();
                this.setSliderValue(0);
                this.updateSliderCurrentLabel(0);
            });
        });
    },

    updateChipColors() {
        document.querySelectorAll('.epoch-chip').forEach(chip => {
            const color = chip.style.getPropertyValue('--epoch-color');
            if (chip.classList.contains('active')) {
                chip.style.background = color;
                chip.style.color = 'white';
                chip.style.borderColor = color;
            } else {
                chip.style.background = '';
                chip.style.color = '';
                chip.style.borderColor = '';
            }
        });
    },

    renderTimeline() {
        const container = document.getElementById('timelineList');
        if (!container) return;
        let events = [...this.data.events];
        if (this.currentFilter !== 'all') {
            events = events.filter(e => e.epoch === this.currentFilter);
        }
        events.sort((a, b) => (a.dateNumeric || 0) - (b.dateNumeric || 0));
        this.currentEvents = events;
        if (events.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 3rem; color: var(--ink-muted); font-family: var(--font-display); font-style: italic;">Keine Ereignisse in dieser Epoche.</p>';
            return;
        }
        container.innerHTML = events.map((event, idx) => {
            const epoch = this.epochMap[event.epoch] || {};
            const delay = Math.min(idx * 0.03, 0.8);
            return '<article class="timeline-event" data-event-id="' + event.id + '" data-index="' + idx + '" style="animation-delay: ' + delay + 's; --epoch-color: ' + (epoch.color || '#6B1F1F') + ';">'
                + '<div class="timeline-dot" style="background: ' + (epoch.color || '#6B1F1F') + ';">' + (epoch.emoji || '\u2022') + '</div>'
                + '<div class="timeline-card">'
                + '<div class="timeline-card-date">' + event.date + '</div>'
                + '<h3 class="timeline-card-title">' + event.title + '</h3>'
                + '<p class="timeline-card-short">' + (event.short || '') + '</p>'
                + '<div class="timeline-card-more">Mehr erfahren</div>'
                + '</div></article>';
        }).join('');
        container.querySelectorAll('.timeline-event').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.eventId;
                const event = this.data.events.find(e => e.id === id);
                if (event) {
                    const epoch = this.epochMap[event.epoch];
                    App.openModal(event, epoch);
                }
            });
        });
    },

    initSlider() {
        const slider = document.getElementById('timelineSlider');
        if (!slider) return;
        this.renderEpochMarkers();
        this.updateSliderCurrentLabel(0);
        slider.addEventListener('input', (e) => {
            this._sliderDragging = true;
            const pct = parseFloat(e.target.value);
            this.updateThumbPosition(pct);
            this.updateSliderCurrentLabel(pct);
            this.scrollToPercent(pct);
            clearTimeout(this._sliderTimeout);
            this._sliderTimeout = setTimeout(() => { this._sliderDragging = false; }, 400);
        });
        window.addEventListener('scroll', () => {
            if (this._sliderDragging) return;
            const view = document.getElementById('view-timeline');
            if (!view || view.hidden) return;
            this.syncSliderFromScroll();
        }, { passive: true });
    },

    setupVisibilityToggle() {
        const bar = document.getElementById('timelineSliderBar');
        if (!bar) return;
        const update = () => {
            const active = document.getElementById('view-timeline');
            if (active && !active.hidden) bar.classList.add('visible');
            else bar.classList.remove('visible');
        };
        update();
        const view = document.getElementById('view-timeline');
        if (view) {
            const observer = new MutationObserver(update);
            observer.observe(view, { attributes: true, attributeFilter: ['hidden'] });
        }
        document.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => setTimeout(update, 60));
        });
    },

    renderEpochMarkers() {
        const container = document.getElementById('sliderEpochs');
        if (!container || !this.data) return;
        const events = this.currentEvents.length ? this.currentEvents : this.data.events;
        if (events.length === 0) { container.innerHTML = ''; return; }
        const seen = new Set();
        const markers = [];
        events.forEach((e, idx) => {
            if (!seen.has(e.epoch)) {
                seen.add(e.epoch);
                const epoch = this.epochMap[e.epoch];
                if (epoch) {
                    const pct = (idx / Math.max(events.length - 1, 1)) * 100;
                    markers.push({ epoch: epoch, pct: pct });
                }
            }
        });
        container.innerHTML = markers.map(m =>
            '<div class="slider-epoch-marker" style="left: ' + m.pct + '%;" data-pct="' + m.pct + '" data-epoch-id="' + m.epoch.id + '">'
            + '<span class="tooltip">' + (m.epoch.emoji || '') + ' ' + m.epoch.name + '</span></div>'
        ).join('');
        container.querySelectorAll('.slider-epoch-marker').forEach(marker => {
            marker.addEventListener('click', (e) => {
                e.preventDefault();
                const pct = parseFloat(marker.dataset.pct);
                this.setSliderValue(pct);
                this.updateThumbPosition(pct);
                this.updateSliderCurrentLabel(pct);
                this.scrollToPercent(pct);
            });
        });
    },

    updateThumbPosition(pct) {
        const thumb = document.getElementById('sliderThumb');
        if (thumb) thumb.style.left = pct + '%';
    },

    setSliderValue(pct) {
        const slider = document.getElementById('timelineSlider');
        if (slider) slider.value = pct;
        this.updateThumbPosition(pct);
    },

    scrollToPercent(pct) {
        const events = this.currentEvents;
        if (!events.length) return;
        const idx = Math.min(events.length - 1, Math.max(0, Math.round((pct / 100) * (events.length - 1))));
        const el = document.querySelector('.timeline-event[data-index="' + idx + '"]');
        if (!el) return;
        const header = document.querySelector('.app-header');
        const slider = document.getElementById('timelineSliderBar');
        const headerH = header ? header.offsetHeight : 64;
        const sliderH = slider ? slider.offsetHeight : 100;
        const offset = headerH + sliderH + 20;
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset - offset;
        window.scrollTo({ top: Math.max(0, absoluteTop), behavior: 'smooth' });
    },

    syncSliderFromScroll() {
        const events = this.currentEvents;
        if (!events.length) return;
        const header = document.querySelector('.app-header');
        const slider = document.getElementById('timelineSliderBar');
        const headerH = header ? header.offsetHeight : 64;
        const sliderH = slider ? slider.offsetHeight : 100;
        const offset = headerH + sliderH + 40;
        let currentIdx = 0;
        for (let i = 0; i < events.length; i++) {
            const el = document.querySelector('.timeline-event[data-index="' + i + '"]');
            if (!el) continue;
            const top = el.getBoundingClientRect().top - offset;
            if (top <= 0) currentIdx = i;
            else break;
        }
        const pct = (currentIdx / Math.max(events.length - 1, 1)) * 100;
        this.setSliderValue(pct);
        this.updateSliderCurrentLabel(pct);
    },

    updateSliderCurrentLabel(pct) {
        const label = document.getElementById('sliderCurrent');
        if (!label) return;
        const events = this.currentEvents;
        if (!events.length) {
            label.textContent = 'Keine Ereignisse';
            return;
        }
        const idx = Math.min(events.length - 1, Math.max(0, Math.round((pct / 100) * (events.length - 1))));
        const ev = events[idx];
        if (ev) {
            label.textContent = ev.date + ' \u00b7 ' + ev.title;
        }
    }
};
