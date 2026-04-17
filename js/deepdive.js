/* DEEPDIVE MODULE */

const DeepDive = {
    currentData: null,
    currentFilter: 'all',
    periodMap: {},

    open(deepdiveId) {
        var dataMap = {
            'deepdive-dinos': window.DEEPDIVE_DINOS,
            'deepdive-mittelalter': window.DEEPDIVE_MITTELALTER
        };
        var data = dataMap[deepdiveId];
        if (!data) return;

        this.currentData = data;
        this.currentFilter = 'all';
        this.periodMap = {};
        data.periods.forEach(p => { this.periodMap[p.id] = p; });

        // Hide all views, show deepdive
        document.querySelectorAll('.view').forEach(v => v.hidden = true);
        var ddView = document.getElementById('view-deepdive');
        if (ddView) ddView.hidden = false;

        this.renderHero();
        this.renderPeriodFilter();
        this.renderTimeline();

        // Scroll to top
        window.scrollTo(0, 0);
    },

    close() {
        // Go back to timeline view
        document.getElementById('view-deepdive').hidden = true;
        var timelineView = document.getElementById('view-timeline');
        if (timelineView) timelineView.hidden = false;
        if (typeof App !== 'undefined' && App.showView) {
            App.showView('timeline');
        }
    },

    renderHero() {
        var meta = this.currentData.meta;
        var hero = document.getElementById('deepdiveHero');
        if (!hero) return;
        hero.style.background = 'linear-gradient(135deg, ' + meta.color + ', ' + this.lighten(meta.color, 25) + ')';
        hero.innerHTML =
            '<div class="deepdive-hero-icon">' + meta.emoji + '</div>' +
            '<h1 class="deepdive-hero-title">' + meta.title + '</h1>' +
            '<p class="deepdive-hero-subtitle">' + meta.subtitle + '</p>' +
            '<div class="deepdive-hero-range">' + meta.timeRange + '</div>' +
            '<p class="deepdive-hero-intro">' + meta.intro + '</p>';
    },

    renderPeriodFilter() {
        var container = document.getElementById('deepdivePeriods');
        if (!container) return;
        var periods = this.currentData.periods;
        var html = '<button class="epoch-chip active" data-period="all" style="--epoch-color: ' + this.currentData.meta.color + ';">' +
            '<span class="epoch-chip-icon">' + this.currentData.meta.emoji + '</span><span>Alle</span></button>';
        periods.forEach(p => {
            html += '<button class="epoch-chip" data-period="' + p.id + '" style="--epoch-color: ' + p.color + ';">' +
                '<span class="epoch-chip-icon">' + p.emoji + '</span><span>' + p.name + '</span></button>';
        });
        container.innerHTML = html;

        // Click events
        container.querySelectorAll('.epoch-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                container.querySelectorAll('.epoch-chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                this.currentFilter = chip.dataset.period;
                this.updateChipColors(container);
                this.renderTimeline();
            });
        });
        this.updateChipColors(container);
    },

    updateChipColors(container) {
        container.querySelectorAll('.epoch-chip').forEach(chip => {
            var color = chip.style.getPropertyValue('--epoch-color');
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
        var container = document.getElementById('deepdiveTimeline');
        if (!container) return;

        var events = this.currentData.events.slice();
        if (this.currentFilter !== 'all') {
            events = events.filter(e => e.period === this.currentFilter);
        }
        events.sort((a, b) => a.dateNumeric - b.dateNumeric);

        if (events.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding: 3rem; color: var(--text-muted);">Keine Einträge in diesem Zeitraum.</p>';
            return;
        }

        container.innerHTML = events.map((event, idx) => {
            var period = this.periodMap[event.period] || {};
            var delay = Math.min(idx * 0.03, 0.8);
            var imgSrc = 'assets/images/deepdive/' + event.id + '.webp';
            return '<article class="timeline-event deepdive-event" data-event-id="' + event.id + '" data-index="' + idx + '" style="animation-delay: ' + delay + 's; --epoch-color: ' + (period.color || this.currentData.meta.color) + ';">' +
                '<div class="timeline-dot" style="background: ' + (period.color || this.currentData.meta.color) + ';">' + (period.emoji || '🦕') + '</div>' +
                '<div class="timeline-card">' +
                '<div class="timeline-card-thumb"><img src="' + imgSrc + '" alt="" loading="lazy" onerror="this.parentElement.style.display=\'none\'"></div>' +
                '<div class="timeline-card-body">' +
                '<div class="timeline-card-date">' + event.date + '</div>' +
                '<h3 class="timeline-card-title">' + event.title + '</h3>' +
                '<p class="timeline-card-short">' + (event.short || '') + '</p>' +
                '<div class="timeline-card-more">Mehr erfahren</div>' +
                '</div>' +
                '</div></article>';
        }).join('');

        // Click events — open modal
        container.querySelectorAll('.deepdive-event').forEach(el => {
            el.addEventListener('click', () => {
                var id = el.dataset.eventId;
                var event = this.currentData.events.find(e => e.id === id);
                if (event) {
                    var period = this.periodMap[event.period] || {};
                    App.openModal(event, {
                        color: period.color || this.currentData.meta.color,
                        emoji: period.emoji || this.currentData.meta.emoji,
                        name: period.name || ''
                    });
                }
            });
        });
    },

    lighten(hex, percent) {
        var num = parseInt(hex.replace('#', ''), 16);
        var r = Math.min(255, (num >> 16) + Math.round(255 * percent / 100));
        var g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100));
        var b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent / 100));
        return '#' + (0x1000000 + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
};
