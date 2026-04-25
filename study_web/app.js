(() => {
  const packs = window.PK_PACKS || {};
  const answerKeyMap = window.PK_ANSWER_KEY || {};
  const packEntries = Object.entries(packs)
    .map(([day, pack]) => ({ day: Number(day), pack }))
    .filter(({ day, pack }) => Number.isFinite(day) && pack && Array.isArray(pack.questions))
    .filter(({ pack }) => String(pack.title || '').toUpperCase().includes('PM'))
    .sort((a, b) => a.day - b.day);

  if (!packEntries.length) {
    throw new Error('Data paket soal tidak ditemukan.');
  }

  const HISTORY_KEY = 'pm-session-history-v1';
  const ACTIVE_KEY = 'pm-active-session-v1';
  const ACTIVE_VERSION = 'pm-day1-v1';
  const FEEDBACK_DELAY_MS = 2000;
  const CIRCLE = 2 * Math.PI * 52;
  const packMap = new Map(packEntries.map(({ day, pack }) => [day, pack]));
  const queryDay = Number(new URLSearchParams(location.search).get('day'));
  const storedDay = Number(localStorage.getItem('pm-active-day'));
  const initialDay = packMap.has(queryDay) ? queryDay : (packMap.has(storedDay) ? storedDay : packEntries[0].day);

  const ui = {
    dayFilter: document.getElementById('day-filter'),
    orderFilter: document.getElementById('order-filter'),
    timeLimit: document.getElementById('time-limit'),
    setupCard: document.getElementById('setup-card'),
    homePanel: document.getElementById('home-panel'),
    packSummary: document.getElementById('pack-summary'),
    historyNote: document.getElementById('history-note'),
    startBtn: document.getElementById('start-btn'),
    restartBtn: document.getElementById('restart-btn'),
    sessionPanel: document.getElementById('session-panel'),
    summaryPanel: document.getElementById('summary-panel'),
    summaryText: document.getElementById('summary-text'),
    summaryMetrics: document.getElementById('summary-metrics'),
    reviewPanel: document.getElementById('review-panel'),
    reviewList: document.getElementById('review-list'),
    retryWrongBtn: document.getElementById('retry-wrong-btn'),
    answerPanel: document.getElementById('answer-panel'),
    answerSummary: document.getElementById('answer-summary'),
    answerList: document.getElementById('answer-list'),
    timerLabel: document.getElementById('timer-label'),
    timerProgress: document.getElementById('timer-progress'),
    statProgress: document.getElementById('stat-progress'),
    hudProgressBar: document.getElementById('hud-progress-bar'),
    statOnTime: document.getElementById('stat-ontime'),
    statTimeout: document.getElementById('stat-timeout'),
    statAccuracy: document.getElementById('stat-accuracy'),
    statAvg: document.getElementById('stat-avg'),
    doneBtn: document.getElementById('done-btn'),
    nextBtn: document.getElementById('next-btn'),
    skipBtn: document.getElementById('skip-btn'),
    qTitle: document.getElementById('question-title'),
    qSubtitle: document.getElementById('question-subtitle'),
    qText: document.getElementById('question-text'),
    qOptions: document.getElementById('question-options'),
    qBadge: document.getElementById('question-badge'),
    qMedia: document.getElementById('question-media'),
    mediaToggle: document.getElementById('media-toggle'),
    qProgressBar: document.getElementById('question-progress-bar'),
    qProgressText: document.getElementById('question-progress-text'),
    qHint: document.getElementById('question-hint'),
  };

  ui.timerProgress.style.strokeDasharray = `${CIRCLE}`;

  const state = {
    activeDay: initialDay,
    queue: [],
    records: [],
    idx: -1,
    limitSec: Number((packMap.get(initialDay) || {}).timeLimitSec || 60),
    remainingSec: Number((packMap.get(initialDay) || {}).timeLimitSec || 60),
    timerRef: null,
    advanceRef: null,
    questionStartAt: 0,
    running: false,
    feedbackLocked: false,
    selectedOption: null,
    lastWrongIds: [],
  };

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMathHtml(text) {
    return escapeHtml(text)
      .replace(/\^(-?\d+)/g, '<sup>$1</sup>')
      .replace(/sqrt\(([^)]+)\)/gi, '<span class="math-root">sqrt($1)</span>')
      .replace(/([A-Za-z0-9)])\/([A-Za-z0-9(])/g, '$1<span class="math-slash">/</span>$2');
  }

  function normalizeAssetPath(path) {
    return String(path || '').replace(/^[./\\]+/, '').replace(/\\/g, '/');
  }

  function buildImageCandidates(imagePath, questionId, partIndex) {
    const clean = normalizeAssetPath(imagePath);
    const file = clean.split('/').pop();
    const stamp = encodeURIComponent(`${questionId || 'q'}-${partIndex}`);
    const base = [clean, `./${clean}`, `/study_web/${clean}`, `study_web/${clean}`, `/assets/questions/${file}`];
    return [...new Set(base.filter(Boolean))].map((candidate) => {
      const joiner = candidate.includes('?') ? '&' : '?';
      return `${candidate}${joiner}v=${stamp}`;
    });
  }

  function loadHistory() {
    try {
      const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveHistory(result) {
    const history = loadHistory();
    history.unshift(result);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)));
  }

  function getActiveSnapshot() {
    try {
      const snapshot = JSON.parse(localStorage.getItem(ACTIVE_KEY) || 'null');
      if (!snapshot || !Array.isArray(snapshot.queueIds) || snapshot.version !== ACTIVE_VERSION) {
        localStorage.removeItem(ACTIVE_KEY);
        return null;
      }
      return snapshot;
    } catch {
      return null;
    }
  }

  function clearActiveSnapshot() {
    localStorage.removeItem(ACTIVE_KEY);
    syncHistoryNote();
  }

  function saveActiveSnapshot() {
    if (!state.running) {
      return;
    }
    localStorage.setItem(ACTIVE_KEY, JSON.stringify({
      version: ACTIVE_VERSION,
      day: state.activeDay,
      limitSec: state.limitSec,
      order: ui.orderFilter.value,
      idx: state.idx,
      records: state.records,
      queueIds: state.queue.map((q) => q.id),
      updatedAt: new Date().toISOString(),
    }));
    syncHistoryNote();
  }

  function syncHistoryNote() {
    const latest = loadHistory()[0];
    const active = getActiveSnapshot();
    if (active) {
      ui.historyNote.textContent = `Ada sesi Day ${active.day} belum selesai. Tombol Lanjutkan aktif.`;
      ui.restartBtn.textContent = 'Lanjutkan';
      ui.restartBtn.disabled = false;
      return;
    }
    ui.restartBtn.textContent = 'Ulangi Sprint';
    ui.restartBtn.disabled = !latest;
    ui.historyNote.textContent = latest
      ? `Sesi terakhir: Day ${latest.day}, benar ${latest.correct}/${latest.total}, akurasi ${latest.accuracy}%.`
      : 'Riwayat lokal akan muncul setelah sprint pertama selesai.';
  }

  function normalizeImages(question) {
    if (Array.isArray(question.images) && question.images.length) {
      return question.images.map((item, index) => {
        if (typeof item === 'string') {
          return { src: item, alt: `Gambar soal Day ${question.day} nomor ${question.number} bagian ${index + 1}` };
        }
        return {
          src: item.src || item.path || '',
          alt: item.alt || `Gambar soal Day ${question.day} nomor ${question.number} bagian ${index + 1}`,
        };
      });
    }
    if (question.image) {
      return [{ src: question.image, alt: `Gambar soal Day ${question.day} nomor ${question.number}` }];
    }
    return [];
  }

  function splitPromptOptions(prompt) {
    const text = String(prompt || '').trim();
    const optionRegex = /\(([a-eA-E])\)\s*/g;
    const matches = [...text.matchAll(optionRegex)];
    if (matches.length < 2) {
      return { stem: text, options: [] };
    }
    const stem = text.slice(0, matches[0].index).trim();
    const options = matches
      .map((match, index) => {
        const next = matches[index + 1];
        return {
          label: match[1].toUpperCase(),
          text: text.slice(match.index + match[0].length, next ? next.index : text.length).trim(),
        };
      })
      .filter((option) => option.text);
    return { stem, options };
  }

  function normalizeAnswerText(answer) {
    return String(answer || '').replace(/^\([a-eA-E]\)\s*/, '').trim();
  }

  function getAnswerChoice(entry) {
    const match = String(entry?.answer || '').match(/^\(([a-eA-E])\)\s*(.*)$/);
    return match
      ? { label: match[1].toUpperCase(), text: match[2].trim() }
      : { label: '', text: normalizeAnswerText(entry?.answer) };
  }

  function simplifyForCompare(text) {
    return String(text || '').replace(/\s+/g, ' ').replace(/[.,]$/g, '').trim().toLowerCase();
  }

  function getActivePack() {
    return packMap.get(state.activeDay) || packEntries[0].pack;
  }

  function getAnswerEntry(question) {
    return answerKeyMap[question.id] || null;
  }

  function isCorrectOption(question, option) {
    const choice = getAnswerChoice(getAnswerEntry(question));
    if (!choice.text) {
      return false;
    }
    if (choice.label && choice.label === option.label) {
      return true;
    }
    return simplifyForCompare(choice.text) === simplifyForCompare(option.text);
  }

  function seededIndex(question, length) {
    const raw = String(question?.id || question?.number || '0');
    const sum = [...raw].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return length ? sum % length : 0;
  }

  function buildGeneratedOptions(question) {
    const entry = getAnswerEntry(question);
    const correct = normalizeAnswerText(entry?.answer);
    if (!correct) {
      return [];
    }

    let candidates = [];
    const numeric = Number(correct.replace(',', '.'));
    if (Number.isFinite(numeric) && /^-?\d+(\.\d+)?$/.test(correct)) {
      const seed = Math.max(1, Math.abs(numeric));
      candidates = [correct, String(numeric + 1), String(numeric - 1), String(numeric + 2), String(seed * 2)];
    } else if (/^y\s*=|^x\s*=|=/.test(correct)) {
      candidates = [
        correct,
        correct.replace(/\+\s*(\d+)/, '- $1'),
        correct.replace(/-\s*(\d+)/, '+ $1'),
        correct.replace(/(\d+)x/, (_, n) => `${Number(n) + 2}x`),
      ];
    } else if (/Kuantitas P/.test(correct) || /Pernyataan/.test(correct) || /SAJA|SEMUA|Tidak/.test(correct)) {
      candidates = [
        correct,
        'Kuantitas P lebih dari Q',
        'Kuantitas P kurang dari Q',
        'Kuantitas P sama dengan Q',
        'Tidak dapat ditentukan',
        'Pernyataan (1) SAJA cukup',
        'Pernyataan (2) SAJA cukup',
      ];
    } else {
      candidates = [correct, 'Pilihan pembanding 1', 'Pilihan pembanding 2', 'Pilihan pembanding 3'];
    }

    const unique = [];
    for (const item of candidates) {
      const value = String(item).replace(/\s+/g, ' ').trim();
      if (value && !unique.includes(value)) {
        unique.push(value);
      }
      if (unique.length >= 4) {
        break;
      }
    }
    while (unique.length < 4) {
      unique.push(`Pilihan ${unique.length + 1}`);
    }

    const correctIndex = unique.indexOf(correct);
    const targetIndex = seededIndex(question, 4);
    if (correctIndex >= 0 && correctIndex !== targetIndex) {
      [unique[correctIndex], unique[targetIndex]] = [unique[targetIndex], unique[correctIndex]];
    }

    return unique.slice(0, 4).map((text, index) => ({
      label: String.fromCharCode(65 + index),
      text,
      generated: true,
      correct: text === correct,
    }));
  }

  function formatPageRange(sourcePages, sourcePage) {
    const raw = Array.isArray(sourcePages) && sourcePages.length
      ? sourcePages
      : (sourcePage !== undefined && sourcePage !== null ? [sourcePage] : []);
    const pages = [...new Set(raw.map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
    if (!pages.length) {
      return '?';
    }
    return pages.length === 1 ? `${pages[0]}` : `${pages[0]}-${pages[pages.length - 1]}`;
  }

  function renderAnswerKey(pack) {
    const questions = Array.isArray(pack.questions) ? pack.questions.slice().sort((a, b) => a.number - b.number) : [];
    const total = questions.length;
    const answered = questions.filter((question) => getAnswerEntry(question)?.answer).length;
    ui.answerSummary.textContent = `${answered}/${total} soal pada ${pack.title || `Day ${state.activeDay}`} sudah punya kunci.`;
    ui.answerList.innerHTML = '';

    questions.forEach((question) => {
      const entry = getAnswerEntry(question);
      const status = entry?.status || 'verified';
      const card = document.createElement('article');
      card.className = `answer-card ${status === 'verified' ? '' : `is-${status}`}`.trim();
      card.innerHTML = `
        <div class="answer-card-head">
          <h4>Soal ${question.number}</h4>
          <span class="answer-badge">${status === 'source-issue' ? 'Cek Sumber' : (status === 'derived' ? 'Turunan' : 'Siap')}</span>
        </div>
        <p class="answer-value">${formatMathHtml(entry?.answer || 'Belum diisi')}</p>
        ${entry?.note ? `<p class="answer-note">${formatMathHtml(entry.note)}</p>` : ''}
      `;
      ui.answerList.appendChild(card);
    });
    ui.answerPanel.classList.remove('hidden');
  }

  function setControlsDisabled(disabled) {
    ui.dayFilter.disabled = disabled;
    ui.orderFilter.disabled = disabled;
    ui.timeLimit.disabled = disabled;
  }

  function syncPackSummary() {
    const pack = getActivePack();
    const total = Array.isArray(pack.questions) ? pack.questions.length : 0;
    const title = pack.title || `PK Day ${state.activeDay}`;
    ui.packSummary.textContent = `Aktif: ${title} - ${total} soal - target ${pack.timeLimitSec || 60} detik.`;
    ui.qBadge.textContent = `Day ${state.activeDay}`;
    syncHistoryNote();
  }

  function populateDaySelect() {
    ui.dayFilter.innerHTML = '';
    for (const { day, pack } of packEntries) {
      const option = document.createElement('option');
      option.value = String(day);
      option.textContent = `${pack.title || `Day ${day}`} - ${pack.questions.length} soal`;
      ui.dayFilter.appendChild(option);
    }
    ui.dayFilter.value = String(state.activeDay);
  }

  function applyActiveDay(day) {
    const nextDay = Number(day);
    if (!packMap.has(nextDay)) {
      return;
    }
    state.activeDay = nextDay;
    localStorage.setItem('pm-active-day', String(nextDay));
    ui.dayFilter.value = String(nextDay);
    ui.timeLimit.value = String(getActivePack().timeLimitSec || 60);
    syncPackSummary();
  }

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getPool(pack) {
    const pool = Array.isArray(pack.questions) ? pack.questions.slice() : [];
    return ui.orderFilter.value === 'random' ? shuffle(pool) : pool.sort((a, b) => a.number - b.number);
  }

  function setRing(sec) {
    const safeLimit = Math.max(1, state.limitSec);
    const p = Math.max(0, Math.min(1, sec / safeLimit));
    ui.timerProgress.style.strokeDashoffset = `${(1 - p) * CIRCLE}`;
    ui.timerLabel.textContent = `${Math.ceil(Math.max(0, sec))}`;
    ui.sessionPanel.classList.remove('is-warning', 'is-danger');
    if (sec <= 10) {
      ui.sessionPanel.classList.add('is-danger');
    } else if (sec <= 20) {
      ui.sessionPanel.classList.add('is-warning');
    }
  }

  function updateStats() {
    const done = state.records.length;
    const total = state.queue.length;
    const onTime = state.records.filter((r) => r.status === 'done' && r.elapsed <= state.limitSec).length;
    const timeout = state.records.filter((r) => r.status === 'timeout').length;
    const checked = state.records.filter((r) => r.status === 'done');
    const correct = checked.filter((r) => r.isCorrect).length;
    const avg = state.records.length
      ? (state.records.reduce((sum, r) => sum + r.elapsed, 0) / state.records.length).toFixed(1)
      : '0.0';
    ui.statProgress.textContent = `${Math.min(done + 1, total)}/${total}`;
    ui.hudProgressBar.style.width = `${total ? Math.min(100, ((done + 1) / total) * 100) : 0}%`;
    ui.statOnTime.textContent = `${onTime}`;
    ui.statTimeout.textContent = `${timeout}`;
    ui.statAccuracy.textContent = checked.length ? `${Math.round((correct / checked.length) * 100)}%` : '-';
    ui.statAvg.textContent = `${avg}s`;
  }

  function clearTimer() {
    if (state.timerRef) {
      clearInterval(state.timerRef);
      state.timerRef = null;
    }
    if (state.advanceRef) {
      clearTimeout(state.advanceRef);
      state.advanceRef = null;
    }
  }

  function clearCountdownOnly() {
    if (state.timerRef) {
      clearInterval(state.timerRef);
      state.timerRef = null;
    }
  }

  function startTimer() {
    clearTimer();
    state.questionStartAt = performance.now();
    state.remainingSec = state.limitSec;
    setRing(state.remainingSec);
    state.timerRef = setInterval(() => {
      const elapsed = (performance.now() - state.questionStartAt) / 1000;
      state.remainingSec = state.limitSec - elapsed;
      setRing(state.remainingSec);
      if (state.remainingSec <= 0) {
        registerAndAdvance('timeout');
      }
    }, 120);
  }

  function renderQuestionMedia(question) {
    const images = normalizeImages(question);
    ui.qMedia.innerHTML = '';
    ui.mediaToggle.classList.toggle('hidden', !images.length);
    if (!images.length) {
      ui.qMedia.hidden = true;
      ui.qMedia.classList.remove('is-collapsed');
      return;
    }

    ui.qMedia.hidden = false;
    const shouldCollapse = window.matchMedia('(max-width: 720px)').matches;
    ui.qMedia.classList.toggle('is-collapsed', shouldCollapse);
    ui.mediaToggle.textContent = shouldCollapse ? 'Lihat gambar soal' : 'Sembunyikan gambar soal';
    images.forEach((image, index) => {
      const figure = document.createElement('figure');
      figure.className = 'question-media-item';
      const img = document.createElement('img');
      img.alt = image.alt || `Gambar soal Day ${question.day} nomor ${question.number} bagian ${index + 1}`;
      const candidates = buildImageCandidates(image.src, question.id, index);
      let cursor = 0;
      img.onerror = () => {
        cursor += 1;
        if (cursor < candidates.length) {
          img.src = candidates[cursor];
          return;
        }
        figure.innerHTML = `<figcaption>Gambar tidak terbaca: ${escapeHtml(image.src || '')}</figcaption>`;
      };
      img.src = candidates[0];
      figure.appendChild(img);
      ui.qMedia.appendChild(figure);
    });
  }

  function renderQuestionOptions(question, options) {
    ui.qOptions.innerHTML = '';
    const visibleOptions = options.length ? options : buildGeneratedOptions(question);
    if (!visibleOptions.length) {
      ui.qOptions.hidden = true;
      return;
    }
    ui.qOptions.hidden = false;
    ui.qOptions.classList.toggle('is-generated', !options.length);
    visibleOptions.forEach((option) => {
      const correct = option.correct || isCorrectOption(question, option);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `option-card${option.generated ? ' is-generated' : ''}`;
      button.dataset.label = option.label;
      button.dataset.value = option.text;
      if (correct) {
        button.dataset.correct = 'true';
      }
      button.innerHTML = `<span>${escapeHtml(option.label)}</span><b>${formatMathHtml(option.text)}</b>`;
      button.addEventListener('click', () => {
        if (state.feedbackLocked) {
          return;
        }
        ui.qOptions.querySelectorAll('.option-card').forEach((item) => item.classList.remove('is-selected'));
        button.classList.add('is-selected');
        state.selectedOption = { label: option.label, text: option.text, isCorrect: correct };
      });
      ui.qOptions.appendChild(button);
    });
  }

  function showAnswerFeedback() {
    const selected = ui.qOptions.querySelector('.option-card.is-selected');
    const correct = ui.qOptions.querySelector('.option-card[data-correct="true"]');
    ui.qOptions.querySelectorAll('.option-card').forEach((item) => {
      item.disabled = true;
      item.classList.remove('is-wrong', 'is-correct');
    });
    if (correct) {
      correct.classList.add('is-correct');
    }
    if (selected && selected !== correct) {
      selected.classList.add('is-wrong');
    }
    const isCorrect = selected && selected === correct;
    ui.qHint.textContent = isCorrect
      ? 'Benar. Tekan Lanjut sekarang atau tunggu 2 detik.'
      : 'Salah. Jawaban benar ditandai hijau. Tekan Lanjut sekarang atau tunggu 2 detik.';
    ui.qHint.classList.toggle('is-success', Boolean(isCorrect));
    ui.qHint.classList.toggle('is-error', Boolean(!isCorrect));
  }

  function mountQuestion() {
    const q = state.queue[state.idx];
    const parsed = splitPromptOptions(q.prompt);
    const total = state.queue.length;
    const current = state.idx + 1;
    const progressPct = total ? (current / total) * 100 : 0;
    ui.qTitle.textContent = `Soal ${q.number}`;
    ui.qSubtitle.textContent = `Sumber halaman ${formatPageRange(q.source_pages, q.source_page)} PDF - target ${state.limitSec} detik`;
    ui.qText.innerHTML = formatMathHtml(parsed.stem || q.prompt || '');
    ui.qBadge.textContent = `Day ${q.day}`;
    ui.qProgressBar.style.width = `${progressPct}%`;
    ui.qProgressText.textContent = `${current} dari ${total}`;
    ui.qHint.textContent = parsed.options.length
      ? 'Pilih opsi yang paling masuk akal, lalu tekan Sudah Jawab.'
      : 'Opsi latihan otomatis, bukan opsi PDF. Pilih opsi lalu tekan Sudah Jawab.';
    ui.qHint.classList.remove('is-alert', 'is-success', 'is-error');
    ui.doneBtn.disabled = false;
    ui.skipBtn.disabled = false;
    ui.nextBtn.classList.add('hidden');
    renderQuestionOptions(q, parsed.options);
    renderQuestionMedia(q);
    state.selectedOption = null;
    state.feedbackLocked = false;
    updateStats();
    saveActiveSnapshot();
    startTimer();
  }

  function buildMetrics() {
    const total = state.queue.length;
    const correct = state.records.filter((r) => r.status === 'done' && r.isCorrect).length;
    const wrong = state.records.filter((r) => r.status === 'done' && !r.isCorrect).length;
    const skip = state.records.filter((r) => r.status === 'skip').length;
    const timeout = state.records.filter((r) => r.status === 'timeout').length;
    const avg = state.records.length
      ? Number((state.records.reduce((sum, r) => sum + r.elapsed, 0) / state.records.length).toFixed(1))
      : 0;
    const accuracy = correct + wrong ? Math.round((correct / (correct + wrong)) * 100) : 0;
    return { total, correct, wrong, skip, timeout, avg, accuracy };
  }

  function renderReview() {
    const wrongRecords = state.records.filter((record) => record.status === 'done' && !record.isCorrect);
    state.lastWrongIds = wrongRecords.map((record) => record.id);
    ui.reviewPanel.classList.toggle('hidden', !wrongRecords.length);
    ui.reviewList.innerHTML = '';
    wrongRecords.forEach((record) => {
      const question = state.queue.find((q) => q.id === record.id);
      const entry = question ? getAnswerEntry(question) : null;
      const card = document.createElement('article');
      card.className = 'review-card';
      card.innerHTML = `
        <strong>Soal ${record.number}</strong>
        <p>Jawaban kamu: ${escapeHtml(record.selected || 'Tidak ada')}</p>
        <p>Kunci benar: ${formatMathHtml(entry?.answer || 'Belum ada')}</p>
        ${entry?.note ? `<small>${formatMathHtml(entry.note)}</small>` : ''}
      `;
      ui.reviewList.appendChild(card);
    });
  }

  function finishSession() {
    clearTimer();
    state.running = false;
    document.body.classList.remove('is-running');
    ui.startBtn.disabled = false;
    ui.setupCard.classList.remove('hidden');
    ui.homePanel.classList.remove('hidden');
    ui.doneBtn.disabled = true;
    ui.skipBtn.disabled = true;
    ui.nextBtn.classList.add('hidden');
    setControlsDisabled(false);

    const pack = getActivePack();
    const metrics = buildMetrics();
    ui.summaryText.textContent = `Selesai ${metrics.total} soal untuk ${pack.title || `Day ${state.activeDay}`}.`;
    ui.summaryMetrics.innerHTML = `
      <p><strong>${metrics.correct}</strong><span>Benar</span></p>
      <p><strong>${metrics.wrong}</strong><span>Salah</span></p>
      <p><strong>${metrics.skip}</strong><span>Skip</span></p>
      <p><strong>${metrics.timeout}</strong><span>Timeout</span></p>
      <p><strong>${metrics.accuracy}%</strong><span>Akurasi</span></p>
      <p><strong>${metrics.avg}s</strong><span>Rata-rata</span></p>
    `;
    renderReview();
    ui.summaryPanel.classList.remove('hidden');
    renderAnswerKey(pack);

    saveHistory({
      date: new Date().toISOString(),
      day: state.activeDay,
      total: metrics.total,
      correct: metrics.correct,
      wrong: metrics.wrong,
      skip: metrics.skip,
      timeout: metrics.timeout,
      accuracy: metrics.accuracy,
      average: metrics.avg,
      wrongQuestions: state.records
        .filter((r) => r.status === 'done' && !r.isCorrect)
        .map((r) => ({ id: r.id, number: r.number, selected: r.selected })),
    });
    clearActiveSnapshot();
    ui.restartBtn.disabled = false;
  }

  function advanceAfterRecord(status) {
    if (!state.running) {
      return;
    }
    const q = state.queue[state.idx];
    const elapsed = Math.max(0, Math.min(state.limitSec, (performance.now() - state.questionStartAt) / 1000));
    state.records.push({
      id: q.id,
      day: q.day,
      number: q.number,
      status,
      isCorrect: status === 'done' ? Boolean(state.selectedOption?.isCorrect) : false,
      selected: state.selectedOption ? `${state.selectedOption.label}. ${state.selectedOption.text}` : '',
      elapsed: Number(elapsed.toFixed(2)),
    });
    state.idx += 1;
    saveActiveSnapshot();
    if (state.idx >= state.queue.length) {
      finishSession();
      return;
    }
    mountQuestion();
  }

  function advanceNow() {
    if (!state.feedbackLocked) {
      return;
    }
    clearTimer();
    ui.nextBtn.classList.add('hidden');
    advanceAfterRecord('done');
  }

  function registerAndAdvance(status) {
    if (!state.running || (state.feedbackLocked && status !== 'done')) {
      return;
    }
    if (status === 'done') {
      if (state.feedbackLocked) {
        advanceNow();
        return;
      }
      if (!state.selectedOption && !ui.qOptions.hidden) {
        ui.qHint.textContent = 'Pilih salah satu opsi dulu, lalu tekan Sudah Jawab.';
        ui.qHint.classList.add('is-alert');
        setTimeout(() => ui.qHint.classList.remove('is-alert'), 450);
        return;
      }
      state.feedbackLocked = true;
      clearCountdownOnly();
      ui.doneBtn.disabled = true;
      ui.skipBtn.disabled = true;
      ui.nextBtn.classList.remove('hidden');
      showAnswerFeedback();
      state.advanceRef = setTimeout(() => {
        state.advanceRef = null;
        advanceAfterRecord('done');
      }, FEEDBACK_DELAY_MS);
      return;
    }
    clearTimer();
    advanceAfterRecord(status);
  }

  function startSessionFromQueue(queue, label) {
    const limit = Number(ui.timeLimit.value);
    if (!Number.isFinite(limit) || limit < 30 || limit > 120) {
      alert('Durasi harus antara 30 sampai 120 detik.');
      return;
    }
    state.limitSec = limit;
    state.queue = queue;
    state.records = [];
    state.idx = 0;
    state.running = true;
    document.body.classList.add('is-running');
    if (!state.queue.length) {
      alert(label || 'Tidak ada soal untuk sprint ini.');
      return;
    }
    setControlsDisabled(true);
    ui.startBtn.disabled = true;
    ui.setupCard.classList.add('hidden');
    ui.homePanel.classList.add('hidden');
    ui.sessionPanel.classList.remove('hidden');
    ui.summaryPanel.classList.add('hidden');
    ui.answerPanel.classList.add('hidden');
    ui.answerList.innerHTML = '';
    ui.doneBtn.disabled = false;
    ui.skipBtn.disabled = false;
    ui.nextBtn.classList.add('hidden');
    mountQuestion();
  }

  function startSession() {
    const pack = getActivePack();
    startSessionFromQueue(getPool(pack), `Tidak ada soal untuk ${pack.title || `Day ${state.activeDay}`}.`);
  }

  function resumeOrRestart() {
    const snapshot = getActiveSnapshot();
    if (snapshot) {
      applyActiveDay(snapshot.day);
      const pack = getActivePack();
      const byId = new Map(pack.questions.map((q) => [q.id, q]));
      const queue = snapshot.queueIds.map((id) => byId.get(id)).filter(Boolean);
      state.limitSec = Number(snapshot.limitSec || pack.timeLimitSec || 60);
      ui.timeLimit.value = String(state.limitSec);
      state.queue = queue;
      state.records = Array.isArray(snapshot.records) ? snapshot.records : [];
      state.idx = Math.max(0, Math.min(Number(snapshot.idx || 0), queue.length - 1));
      state.running = true;
      document.body.classList.add('is-running');
      setControlsDisabled(true);
      ui.startBtn.disabled = true;
      ui.setupCard.classList.add('hidden');
      ui.homePanel.classList.add('hidden');
      ui.sessionPanel.classList.remove('hidden');
      ui.summaryPanel.classList.add('hidden');
      ui.answerPanel.classList.add('hidden');
      ui.doneBtn.disabled = false;
      ui.skipBtn.disabled = false;
      mountQuestion();
      return;
    }
    startSession();
  }

  function retryWrongQuestions() {
    const pack = getActivePack();
    const byId = new Map(pack.questions.map((q) => [q.id, q]));
    const queue = state.lastWrongIds.map((id) => byId.get(id)).filter(Boolean);
    startSessionFromQueue(queue, 'Belum ada soal salah untuk diulang.');
  }

  populateDaySelect();
  applyActiveDay(initialDay);
  ui.dayFilter.addEventListener('change', (ev) => {
    if (state.running) {
      ui.dayFilter.value = String(state.activeDay);
      return;
    }
    applyActiveDay(ev.target.value);
  });
  ui.mediaToggle.addEventListener('click', () => {
    const collapsed = ui.qMedia.classList.toggle('is-collapsed');
    ui.mediaToggle.textContent = collapsed ? 'Lihat gambar soal' : 'Sembunyikan gambar soal';
  });
  ui.startBtn.addEventListener('click', startSession);
  ui.restartBtn.addEventListener('click', resumeOrRestart);
  ui.doneBtn.addEventListener('click', () => registerAndAdvance('done'));
  ui.nextBtn.addEventListener('click', advanceNow);
  ui.skipBtn.addEventListener('click', () => registerAndAdvance('skip'));
  ui.retryWrongBtn.addEventListener('click', retryWrongQuestions);

  document.addEventListener('keydown', (ev) => {
    if (!state.running) {
      return;
    }
    if (ev.key === 'Enter') {
      ev.preventDefault();
      registerAndAdvance('done');
    } else if (ev.key.toLowerCase() === 's') {
      ev.preventDefault();
      registerAndAdvance('skip');
    }
  });
})();

