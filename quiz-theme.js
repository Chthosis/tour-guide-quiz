(() => {
  const storageKey = 'tour-guide-quiz-theme';
  const root = document.documentElement;

  function savedTheme() {
    try {
      const theme = localStorage.getItem(storageKey);
      if (theme === 'dark' || theme === 'light') return theme;
    } catch {}
    return root.dataset.theme || 'light';
  }

  root.dataset.theme = savedTheme();

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.theme-toggle');

    function update(theme) {
      root.dataset.theme = theme;
      button.textContent = theme === 'dark' ? '切换到日间' : '切换到夜间';
    }

    update(savedTheme());
    button.hidden = false;
    button.addEventListener('click', () => {
      const theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      update(theme);
      try {
        localStorage.setItem(storageKey, theme);
      } catch {}
    });
    window.addEventListener('pageshow', () => update(savedTheme()));
    window.addEventListener('storage', event => {
      if (event.key === storageKey) update(savedTheme());
    });
  });
})();
