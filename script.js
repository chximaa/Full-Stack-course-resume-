/* ════════════════════════════════════════════════
   JPA / Hibernate Learning Guide — script.js
   Features:
     - Dark / Light mode toggle
     - Accordion cards
     - Full interactive quiz engine
   ════════════════════════════════════════════════ */

'use strict';

/* ══════════════════════════════════
   1. THEME TOGGLE
══════════════════════════════════ */
const themeToggle = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
const body        = document.body;

// Load saved preference
if (localStorage.getItem('jpaTheme') === 'light') {
  body.classList.replace('dark', 'light');
  themeIcon.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  const isLight = body.classList.toggle('light');
  body.classList.toggle('dark', !isLight);
  themeIcon.textContent = isLight ? '🌙' : '☀️';
  localStorage.setItem('jpaTheme', isLight ? 'light' : 'dark');
});


/* ══════════════════════════════════
   2. ACCORDION CARDS
══════════════════════════════════ */
/**
 * Toggle accordion card open/close.
 * @param {HTMLElement} header - The clicked card-header element
 */
function toggleCard(header) {
  const body   = header.nextElementSibling;
  const isOpen = body.classList.contains('open');

  // Toggle current
  body.classList.toggle('open', !isOpen);
  header.classList.toggle('open', !isOpen);
}

// Open the first card in each section by default
document.addEventListener('DOMContentLoaded', () => {
  const firstHeaders = document.querySelectorAll('.content-section .card:first-child .card-header');
  firstHeaders.forEach(h => {
    const b = h.nextElementSibling;
    b.classList.add('open');
    h.classList.add('open');
  });

  buildQuiz();
});


/* ══════════════════════════════════
   3. QUIZ DATA
══════════════════════════════════ */
/**
 * Quiz questions data.
 * Types: 'mcq' | 'tf' | 'short'
 */
const QUESTIONS = [
  // ── Multiple Choice ──────────────────────────────
  {
    type: 'mcq',
    text: 'In JPA/Hibernate, what does the @Entity annotation do?',
    options: [
      'It creates a REST API endpoint',
      'It tells JPA to map this class to a database table',
      'It marks a class as abstract',
      'It defines a relationship between two tables'
    ],
    correct: 1,
    explanation: '<strong>@Entity</strong> tells JPA/Hibernate: "This Java class represents a table in the database." Every field becomes a column and every instance becomes a row.'
  },
  {
    type: 'mcq',
    text: 'In a unidirectional association, which of the following is true?',
    options: [
      'Both classes hold a reference to each other',
      'Neither class knows the other exists',
      'Only one class holds a reference to the other',
      'A join table is always created'
    ],
    correct: 2,
    explanation: 'In a <strong>unidirectional</strong> association only one side holds the reference. For example, Client holds a List of Commandes, but Commande has no reference back to Client.'
  },
  {
    type: 'mcq',
    text: 'Which JPA annotation represents a "1 to N" cardinality?',
    options: ['@OneToOne', '@ManyToMany', '@OneToMany', '@ManyToOne'],
    correct: 2,
    explanation: '<strong>@OneToMany</strong> means one object is linked to many objects. Example: one Client can have many Commandes.'
  },
  {
    type: 'mcq',
    text: 'In a bidirectional @OneToMany / @ManyToOne relationship, which side is the "owner" (propriétaire)?',
    options: [
      'The @OneToMany side (e.g., Client)',
      'The @ManyToOne side (e.g., Commande)',
      'Both sides equally',
      'The side that has the @Entity annotation'
    ],
    correct: 1,
    explanation: 'The <strong>@ManyToOne side</strong> is always the owner because it physically holds the foreign key column in the database table.'
  },
  {
    type: 'mcq',
    text: 'What does the mappedBy attribute do in a JPA annotation?',
    options: [
      'It specifies the database column name',
      'It marks the inverse (non-owner) side and prevents duplicate FK columns',
      'It defines the cascade type',
      'It sets the fetch strategy to LAZY'
    ],
    correct: 1,
    explanation: '<strong>mappedBy</strong> is placed on the inverse (non-owner) side to tell Hibernate: "The other class owns this relationship." Without it, Hibernate would create an extra unwanted join table.'
  },
  {
    type: 'mcq',
    text: 'Which Java collection prevents duplicate elements?',
    options: ['ArrayList', 'LinkedList', 'HashSet', 'Vector'],
    correct: 2,
    explanation: '<strong>Set</strong> (implemented by HashSet, LinkedHashSet, TreeSet) guarantees no duplicate elements. This is why it is ideal for @ManyToMany associations where you want unique relations.'
  },
  {
    type: 'mcq',
    text: 'In a @ManyToMany relationship (e.g., Étudiant ↔ Cours), what does Hibernate create in the database?',
    options: [
      'A new column in both tables',
      'An intermediate join table',
      'A stored procedure',
      'A view'
    ],
    correct: 1,
    explanation: 'For <strong>@ManyToMany</strong>, Hibernate creates an <strong>intermediate join table</strong> (e.g., etudiant_cours) that holds two foreign key columns linking both entities.'
  },
  {
    type: 'mcq',
    text: 'What happens if you do NOT initialise your collection in JPA (e.g., leave it as null)?',
    options: [
      'Hibernate automatically initialises it',
      'A NullPointerException is thrown when you try to add elements',
      'The mapping is ignored',
      'It defaults to an empty ArrayList'
    ],
    correct: 1,
    explanation: 'If you don\'t initialise the collection (e.g., <code>= new ArrayList<>()</code>), you will get a <strong>NullPointerException</strong> when Hibernate or your code tries to add elements to it.'
  },

  // ── True / False ─────────────────────────────────
  {
    type: 'tf',
    text: 'True or False: In a bidirectional relationship, BOTH sides of the mapping contribute a foreign key column to the database.',
    correct: false,
    explanation: '<strong>False.</strong> Only the <em>owner side</em> contributes the foreign key column. The inverse side uses mappedBy and does not generate any extra column.'
  },
  {
    type: 'tf',
    text: 'True or False: A List allows duplicate elements and maintains insertion order.',
    correct: true,
    explanation: '<strong>True.</strong> A Java List is ordered and allows duplicates. Use it when you care about the order of elements (e.g., a sorted list of commands by date).'
  },
  {
    type: 'tf',
    text: 'True or False: @ManyToOne is placed on the "many" side of the relation (e.g., Commande), and this side owns the foreign key.',
    correct: true,
    explanation: '<strong>True.</strong> The @ManyToOne side is on the "many" side (e.g., Commande) and it physically holds the foreign key column (e.g., client_id) in its database table.'
  },
  {
    type: 'tf',
    text: 'True or False: A @ManyToMany relationship can be defined without a join table in the database.',
    correct: false,
    explanation: '<strong>False.</strong> A @ManyToMany relationship always requires an intermediate join table (either generated automatically by Hibernate or defined manually with @JoinTable).'
  },

  // ── Short Answer ─────────────────────────────────
  {
    type: 'short',
    text: 'What annotation would you use in JPA to map a relationship where one Person has exactly one Passport?',
    keywords: ['onetone', 'onetoone', '@onetoone'],
    display: '@OneToOne',
    explanation: '<strong>@OneToOne</strong> — signifies that one object corresponds to exactly one other object. Example: one Person ↔ one Passport.'
  },
  {
    type: 'short',
    text: 'Complete this code: @OneToMany( _______ = "client") — what attribute and value completes the inverse side declaration?',
    keywords: ['mappedby', 'mapped', 'mappedby="client"'],
    display: 'mappedBy',
    explanation: '<strong>mappedBy = "client"</strong> tells Hibernate that the "client" field in the Commande class is the owner of this relationship. The value matches the field name in the owner class.'
  },
  {
    type: 'short',
    text: 'Name the collection type you should use when you want to AVOID duplicate elements in a JPA association.',
    keywords: ['set', 'hashset'],
    display: 'Set (HashSet)',
    explanation: '<strong>Set</strong> (typically implemented as HashSet) does not allow duplicate elements, making it ideal for @ManyToMany relationships like Student ↔ Courses.'
  }
];


/* ══════════════════════════════════
   4. QUIZ BUILDER
══════════════════════════════════ */
let userAnswers = {}; // { questionIndex: answer }

/**
 * Build and inject all quiz questions into the DOM.
 */
function buildQuiz() {
  const container = document.getElementById('quiz-container');
  container.innerHTML = '';

  QUESTIONS.forEach((q, idx) => {
    const el = document.createElement('div');
    el.className = 'quiz-question';
    el.id = `q-${idx}`;

    const typeLabel = { mcq: 'Multiple Choice', tf: 'True / False', short: 'Short Answer' };

    let inputHTML = '';

    if (q.type === 'mcq') {
      inputHTML = `<div class="options-list">${
        q.options.map((opt, i) => `
          <button class="option-btn" data-q="${idx}" data-i="${i}" onclick="selectOption(this, ${idx}, ${i})">
            <span class="opt-letter">${'ABCD'[i]}</span>
            ${opt}
          </button>
        `).join('')
      }</div>`;

    } else if (q.type === 'tf') {
      inputHTML = `<div class="tf-group">
        <button class="tf-btn" data-q="${idx}" data-val="true"  onclick="selectTF(this, ${idx}, true)">✅ True</button>
        <button class="tf-btn" data-q="${idx}" data-val="false" onclick="selectTF(this, ${idx}, false)">❌ False</button>
      </div>`;

    } else if (q.type === 'short') {
      inputHTML = `<input type="text" class="short-input" id="short-${idx}" placeholder="Type your answer here…" />`;
    }

    el.innerHTML = `
      <div class="q-meta">
        <span class="q-num">Q${idx + 1}</span>
        <span class="q-type">${typeLabel[q.type]}</span>
      </div>
      <div class="q-text">${q.text}</div>
      ${inputHTML}
      <div class="q-explanation" id="exp-${idx}"></div>
    `;

    container.appendChild(el);
  });
}

/**
 * Handle MCQ option selection.
 */
function selectOption(btn, qIdx, optIdx) {
  if (btn.disabled) return;
  // Deselect others
  document.querySelectorAll(`.option-btn[data-q="${qIdx}"]`).forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  userAnswers[qIdx] = optIdx;
}

/**
 * Handle True/False selection.
 */
function selectTF(btn, qIdx, val) {
  if (btn.disabled) return;
  document.querySelectorAll(`.tf-btn[data-q="${qIdx}"]`).forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  userAnswers[qIdx] = val;
}


/* ══════════════════════════════════
   5. QUIZ SUBMIT & SCORING
══════════════════════════════════ */
document.getElementById('submit-quiz').addEventListener('click', submitQuiz);

/**
 * Grade all answers and show results + explanations.
 */
function submitQuiz() {
  let score = 0;

  QUESTIONS.forEach((q, idx) => {
    const qEl  = document.getElementById(`q-${idx}`);
    const expEl = document.getElementById(`exp-${idx}`);
    let correct = false;

    if (q.type === 'mcq') {
      const selected = userAnswers[idx];
      const buttons  = document.querySelectorAll(`.option-btn[data-q="${idx}"]`);

      buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === q.correct) {
          btn.classList.add('correct-ans');
        } else if (selected === i && i !== q.correct) {
          btn.classList.add('wrong-ans');
        }
        btn.classList.remove('selected');
      });

      correct = selected === q.correct;

    } else if (q.type === 'tf') {
      const selected = userAnswers[idx];
      const buttons  = document.querySelectorAll(`.tf-btn[data-q="${idx}"]`);

      buttons.forEach(btn => {
        btn.disabled = true;
        const btnVal = btn.dataset.val === 'true';
        if (btnVal === q.correct) {
          btn.classList.add('correct-ans');
        } else if (selected === btnVal && btnVal !== q.correct) {
          btn.classList.add('wrong-ans');
        }
        btn.classList.remove('selected');
      });

      correct = selected === q.correct;

    } else if (q.type === 'short') {
      const input = document.getElementById(`short-${idx}`);
      const raw   = (input.value || '').trim().toLowerCase().replace(/[\s@"']/g, '');
      input.disabled = true;

      correct = q.keywords.some(kw => raw.includes(kw.replace(/[\s@"']/g, '')));

      if (correct) {
        input.classList.add('correct-ans');
      } else {
        input.classList.add('wrong-ans');
        input.placeholder = `Correct answer: ${q.display}`;
      }
    }

    if (correct) {
      score++;
      qEl.classList.add('correct');
    } else {
      qEl.classList.add('wrong');
    }

    // Show explanation
    expEl.innerHTML = `<strong>${correct ? '✅ Correct!' : '❌ Incorrect'}</strong> — ${q.explanation}`;
    expEl.classList.add('show');
  });

  // Show result panel
  const total   = QUESTIONS.length;
  const pct     = Math.round((score / total) * 100);
  const msgs    = [
    [90, '🏆 Outstanding! You have mastered JPA Associations!'],
    [70, '🎯 Great job! Review the topics you missed.'],
    [50, '📚 Good effort! Keep studying and you\'ll get there.'],
    [0,  '💪 Keep going — re-read the chapters and try again!']
  ];
  const message = msgs.find(([min]) => pct >= min)[1];

  document.getElementById('result-score').textContent   = `${score} / ${total} (${pct}%)`;
  document.getElementById('result-message').textContent = message;

  const resultEl = document.getElementById('quiz-result');
  resultEl.classList.remove('hidden');
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

  document.getElementById('submit-quiz').style.display = 'none';
}

/**
 * Reset the quiz to allow retrying.
 */
function restartQuiz() {
  userAnswers = {};
  document.getElementById('quiz-result').classList.add('hidden');
  document.getElementById('submit-quiz').style.display = 'block';
  buildQuiz();
  document.getElementById('quiz').scrollIntoView({ behavior: 'smooth' });
}


/* ══════════════════════════════════
   6. ACTIVE NAV ON SCROLL
══════════════════════════════════ */
const navLinks = document.querySelectorAll('#main-nav a');
const sections = document.querySelectorAll('section[id]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.style.color = link.getAttribute('href') === `#${entry.target.id}`
          ? 'var(--accent)'
          : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));
