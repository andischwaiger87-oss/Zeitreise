/* ============================================
   QUIZ MODULE
   ============================================ */

const Quiz = {
    data: null,
    state: {
        category: null,
        questions: [],
        currentIndex: 0,
        score: 0,
        correctCount: 0
    },

    init(data) {
        if (!data) return;
        this.data = data;
        this.renderCategories();
        this.setupHandlers();
    },

    renderCategories() {
        const container = document.getElementById('quizCategories');
        if (!container) return;

        const html = this.data.categories.map(cat => {
            const count = this.data.questions.filter(q => q.category === cat.id).length;
            return `
                <button class="quiz-category-card" data-category="${cat.id}" style="--cat-color: ${cat.color};">
                    <div class="quiz-category-icon">${cat.icon}</div>
                    <h3 class="quiz-category-title">${cat.title}</h3>
                    <p class="quiz-category-desc">${cat.description}</p>
                    <span class="quiz-category-count">${count} Fragen</span>
                </button>
            `;
        }).join('');

        container.innerHTML = html;

        container.querySelectorAll('.quiz-category-card').forEach(card => {
            card.addEventListener('click', () => {
                this.startQuiz(card.dataset.category);
            });
        });
    },

    setupHandlers() {
        const backBtn = document.getElementById('quizBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showCategories());
        }

        const nextBtn = document.getElementById('quizNextBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextQuestion());
        }
    },

    startQuiz(categoryId) {
        const category = this.data.categories.find(c => c.id === categoryId);
        if (!category) return;

        // Get questions for this category
        let questions = this.data.questions.filter(q => q.category === categoryId);

        // Shuffle
        questions = this.shuffle(questions);

        this.state = {
            category,
            questions,
            currentIndex: 0,
            score: 0,
            correctCount: 0
        };

        // Hide category view, show game view
        document.getElementById('quizCategoryView').hidden = true;
        document.getElementById('quizGameView').hidden = false;
        document.getElementById('quizResultView').hidden = true;

        this.renderQuestion();
    },

    renderQuestion() {
        const { questions, currentIndex, score } = this.state;
        const q = questions[currentIndex];
        if (!q) return this.showResult();

        // Update header
        document.getElementById('quizCurrent').textContent = currentIndex + 1;
        document.getElementById('quizTotal').textContent = questions.length;
        document.getElementById('quizScore').textContent = score;

        const progress = ((currentIndex) / questions.length) * 100;
        document.getElementById('quizProgressFill').style.width = progress + '%';

        // Render question
        const questionEl = document.getElementById('quizQuestion');
        questionEl.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 1rem;">${this.state.category.icon}</div>
            ${q.question}
        `;

        // Render answers (shuffle for fairness)
        const indices = [0, 1, 2, 3];
        const shuffled = this.shuffle([...indices]);
        const letters = ['A', 'B', 'C', 'D'];

        const answersEl = document.getElementById('quizAnswers');
        answersEl.innerHTML = shuffled.map((origIdx, displayIdx) => `
            <button class="quiz-answer-btn" data-original-index="${origIdx}" data-display-index="${displayIdx}">
                <span class="quiz-answer-letter">${letters[displayIdx]}</span>
                <span>${q.answers[origIdx]}</span>
            </button>
        `).join('');

        // Hide feedback and next button
        document.getElementById('quizFeedback').hidden = true;
        document.getElementById('quizNextBtn').hidden = true;

        // Attach answer handlers
        answersEl.querySelectorAll('.quiz-answer-btn').forEach(btn => {
            btn.addEventListener('click', () => this.handleAnswer(parseInt(btn.dataset.originalIndex), btn));
        });
    },

    handleAnswer(chosenIndex, btn) {
        const q = this.state.questions[this.state.currentIndex];
        const correct = chosenIndex === q.correct;

        // Disable all buttons
        const allBtns = document.querySelectorAll('.quiz-answer-btn');
        allBtns.forEach(b => {
            b.disabled = true;
            const origIdx = parseInt(b.dataset.originalIndex);
            if (origIdx === q.correct) {
                b.classList.add('correct');
            } else if (b === btn && !correct) {
                b.classList.add('wrong');
            }
        });

        // Show feedback
        const feedbackEl = document.getElementById('quizFeedback');
        feedbackEl.hidden = false;
        feedbackEl.className = 'quiz-feedback ' + (correct ? 'correct' : 'wrong');
        feedbackEl.innerHTML = `
            <div class="quiz-feedback-title">
                ${correct ? '🎉 Richtig!' : '💡 Leider falsch'}
            </div>
            <div class="quiz-feedback-text">${q.explanation || ''}</div>
        `;

        // Update score
        if (correct) {
            this.state.score += this.data.meta.pointsPerCorrect || 10;
            this.state.correctCount++;
            document.getElementById('quizScore').textContent = this.state.score;
        }

        // Show next button
        const nextBtn = document.getElementById('quizNextBtn');
        nextBtn.hidden = false;
        nextBtn.textContent = this.state.currentIndex + 1 < this.state.questions.length
            ? 'Weiter →'
            : 'Ergebnis anzeigen 🏆';
        nextBtn.focus();
    },

    nextQuestion() {
        this.state.currentIndex++;
        if (this.state.currentIndex >= this.state.questions.length) {
            this.showResult();
        } else {
            this.renderQuestion();
        }
    },

    showResult() {
        document.getElementById('quizGameView').hidden = true;
        const resultEl = document.getElementById('quizResultView');
        resultEl.hidden = false;

        const { correctCount, questions, score } = this.state;
        const total = questions.length;
        const percent = Math.round((correctCount / total) * 100);

        let trophy, title, message;
        if (percent === 100) {
            trophy = '🏆';
            title = 'Perfekt!';
            message = 'Alle Fragen richtig - du bist ein echter Geschichtsprofi!';
        } else if (percent >= 80) {
            trophy = '🥇';
            title = 'Super gemacht!';
            message = 'Fast alle Fragen richtig - das ist spitze!';
        } else if (percent >= 60) {
            trophy = '🥈';
            title = 'Gut gemacht!';
            message = 'Das war schon richtig gut! Mit ein bisschen Übung wirst du noch besser.';
        } else if (percent >= 40) {
            trophy = '🥉';
            title = 'Weiter so!';
            message = 'Ein guter Anfang! Schau dir ruhig nochmal die Zeitreise an und versuch es wieder.';
        } else {
            trophy = '💪';
            title = 'Nicht aufgeben!';
            message = 'Jeder fängt mal an. Entdecke die Zeitreise und versuch das Quiz nochmal!';
        }

        resultEl.innerHTML = `
            <div class="quiz-result-trophy">${trophy}</div>
            <h2 class="quiz-result-title">${title}</h2>
            <p class="quiz-result-score">
                Du hast <strong>${correctCount}</strong> von <strong>${total}</strong> Fragen richtig beantwortet!<br>
                <span style="font-size: 1rem;">Das sind <strong>${score} Punkte</strong> ⭐</span>
            </p>
            <p style="margin-bottom: 2rem; color: #666;">${message}</p>
            <div class="quiz-result-actions">
                <button class="btn-again" onclick="Quiz.startQuiz('${this.state.category.id}')">
                    🔄 Nochmal spielen
                </button>
                <button class="btn-home" onclick="Quiz.showCategories()">
                    📚 Andere Kategorie
                </button>
            </div>
        `;
    },

    showCategories() {
        document.getElementById('quizCategoryView').hidden = false;
        document.getElementById('quizGameView').hidden = true;
        document.getElementById('quizResultView').hidden = true;
    },

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
};
