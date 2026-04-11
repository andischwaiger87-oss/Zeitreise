/* ============================================
   UNKEN VIEW MODULE
   ============================================ */

const UnkenView = {
    data: null,

    init(data) {
        if (!data) return;
        this.data = data;
        this.render();
    },

    render() {
        const container = document.getElementById('unkenContent');
        if (!container) return;

        const d = this.data;
        let html = '';

        // Sections (intro, geo, name)
        (d.sections || []).forEach(section => {
            html += `
                <div class="unken-section" style="border-top-color: ${section.color};">
                    <div class="unken-section-header">
                        <div class="unken-section-icon">${section.icon}</div>
                        <h2 class="unken-section-title">${section.title}</h2>
                    </div>
                    <p class="unken-section-intro">${section.intro}</p>
                    ${section.facts && section.facts.length ? `
                        <div class="unken-facts">
                            <div class="unken-facts-label">✨ Spannende Fakten</div>
                            <ul>${section.facts.map(f => `<li>${f}</li>`).join('')}</ul>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        // Timeline of Unken history
        if (d.timeline && d.timeline.length) {
            html += `
                <div class="unken-section">
                    <div class="unken-section-header">
                        <div class="unken-section-icon">⏳</div>
                        <h2 class="unken-section-title">Zeitreise durch Unken</h2>
                    </div>
                    <p class="unken-section-intro">Komm mit auf eine Reise durch die Geschichte unseres Dorfes!</p>
                    <div class="unken-timeline">
                        ${d.timeline.map(ev => `
                            <div class="unken-event" data-unken-id="${ev.id}">
                                <div class="unken-event-icon">${ev.icon || '📅'}</div>
                                <div class="unken-event-content">
                                    <div class="unken-event-date">${ev.date}</div>
                                    <h3 class="unken-event-title">${ev.title}</h3>
                                    <p class="unken-event-short">${ev.short || ''}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Schule
        if (d.schule) {
            html += `
                <div class="unken-section" style="border-top-color: #1976D2;">
                    <div class="unken-section-header">
                        <div class="unken-section-icon">🏫</div>
                        <h2 class="unken-section-title">${d.schule.title}</h2>
                    </div>
                    <p class="unken-section-intro">${d.schule.intro}</p>
                    <div class="unken-timeline">
                        ${d.schule.events.map(ev => `
                            <div class="unken-event" data-unken-id="${ev.id}" style="border-left-color: #1976D2;">
                                <div class="unken-event-icon">${ev.icon || '📅'}</div>
                                <div class="unken-event-content">
                                    <div class="unken-event-date" style="color: #1976D2;">${ev.date}</div>
                                    <h3 class="unken-event-title">${ev.title}</h3>
                                    <p class="unken-event-short">${ev.description.split('.')[0]}.</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Wappen
        if (d.wappen) {
            html += `
                <div class="unken-section" style="border-top-color: #D32F2F;">
                    <div class="unken-section-header">
                        <div class="unken-section-icon">🛡️</div>
                        <h2 class="unken-section-title">${d.wappen.title}</h2>
                    </div>
                    <p class="unken-section-intro">${d.wappen.description}</p>
                    <div class="unken-facts">
                        <div class="unken-facts-label">📖 Gut zu wissen</div>
                        <ul>${d.wappen.elements.map(e => `<li>${e}</li>`).join('')}</ul>
                    </div>
                </div>
            `;
        }

        // Sources
        if (d.sources && d.sources.length) {
            html += `
                <div class="unken-section" style="border-top-color: #888;">
                    <div class="unken-section-header">
                        <div class="unken-section-icon">📚</div>
                        <h2 class="unken-section-title">Quellen</h2>
                    </div>
                    <p class="unken-section-intro">Alle Informationen stammen aus verlässlichen Quellen:</p>
                    <ul style="list-style: none; padding: 0;">
                        ${d.sources.map(s => `
                            <li style="padding: 0.5rem 0;">
                                <a href="${s.url}" target="_blank" rel="noopener" style="color: #1976D2; font-weight: 600; text-decoration: none;">
                                    🔗 ${s.title}
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        container.innerHTML = html;

        // Attach event handlers for event detail modal
        container.querySelectorAll('.unken-event').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.unkenId;
                let event = this.data.timeline.find(e => e.id === id);
                if (!event && this.data.schule) {
                    event = this.data.schule.events.find(e => e.id === id);
                }
                if (event) {
                    App.openModal(event, { color: '#2E7D32', emoji: event.icon });
                }
            });
        });
    }
};
