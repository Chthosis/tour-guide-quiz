function createQuizTimer(storageKey, isComplete) {
  const timerKey = storageKey + '-elapsed-ms';
  const display = document.getElementById('quiz-timer');
  let startedAt = null;
  let elapsed = readElapsed();

  function readElapsed() {
    try {
      return Math.max(0, Number(localStorage.getItem(timerKey)) || 0);
    } catch {
      return 0;
    }
  }

  function draw() {
    const running = startedAt === null ? 0 : performance.now() - startedAt;
    const seconds = Math.floor((elapsed + running) / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    const remaining = seconds % 60;
    const time = [hours, minutes, remaining].map(value => String(value).padStart(2, '0')).join(':');
    display.textContent = (isComplete() ? '完卷用时 ' : '累计用时 ') + time;
  }

  function checkpoint() {
    if (startedAt !== null) {
      const now = performance.now();
      elapsed = readElapsed() + now - startedAt;
      startedAt = now;
      try {
        localStorage.setItem(timerKey, String(elapsed));
      } catch {
        document.getElementById('storage').hidden = false;
      }
    }
  }

  function sync() {
    checkpoint();
    if (isComplete()) startedAt = null;
    else if (startedAt === null) startedAt = performance.now();
    draw();
  }

  function reset() {
    elapsed = 0;
    try {
      localStorage.setItem(timerKey, '0');
    } catch {
      document.getElementById('storage').hidden = false;
    }
    startedAt = performance.now();
    draw();
  }

  window.addEventListener('pagehide', () => {
    checkpoint();
    startedAt = null;
  });
  window.addEventListener('pageshow', sync);
  document.addEventListener('visibilitychange', checkpoint);
  setInterval(() => {
    checkpoint();
    draw();
  }, 1000);
  sync();
  return { sync, reset };
}
