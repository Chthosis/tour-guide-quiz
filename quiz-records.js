(() => {
  const allowed = key => /^(beikao|leidada)-2026-paper\d+(?:-subject(?:12|34))?-quiz-v1(?:-elapsed-ms)?$/.test(key);
  document.addEventListener('DOMContentLoaded', () => {
    const panel = document.createElement('div');
    panel.className = 'record-controls';
    panel.innerHTML = '<button type="button" id="export-records">导出答题记录</button><button type="button" id="import-records">导入答题记录</button><input type="file" id="records-file" accept=".json,application/json" hidden><p id="records-status" role="status"></p>';
    document.querySelector('main').append(panel);
    const status = panel.querySelector('#records-status');
    panel.querySelector('#export-records').onclick = () => {
      try {
        const records = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (allowed(key)) records[key] = localStorage.getItem(key);
        }
        const blob = new Blob([JSON.stringify({format:'tour-guide-records',version:1,records})], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = '导游答题记录-' + new Date().toISOString().slice(0,10) + '.json';
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        status.textContent = '记录已导出，可通过 AirDrop 传到 iPhone 后导入。';
      } catch {
        status.textContent = '导出失败，请检查浏览器是否允许保存记录。';
      }
    };
    const input = panel.querySelector('#records-file');
    panel.querySelector('#import-records').onclick = () => input.click();
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        if (data.format !== 'tour-guide-records' || data.version !== 1 || !data.records || typeof data.records !== 'object' || Array.isArray(data.records)) throw Error();
        const entries = Object.entries(data.records);
        if (!entries.length) throw Error();
        for (const [key,value] of entries) {
          if (!allowed(key) || typeof value !== 'string') throw Error();
          if (key.endsWith('-elapsed-ms')) {
            if (!Number.isFinite(Number(value)) || Number(value) < 0) throw Error();
          } else {
            const state = JSON.parse(value);
            if (!state || typeof state !== 'object' || !state.results || typeof state.results !== 'object' || Array.isArray(state.results)) throw Error();
            for (const [number,answers] of Object.entries(state.results)) {
              if (!/^\d+$/.test(number) || !Array.isArray(answers) || !answers.length || !answers.every(a => /^[A-E对错]$/.test(a))) throw Error();
            }
          }
        }
        if (!confirm('导入会覆盖文件中对应卷子的当前记录，继续吗？')) return;
        const previous = entries.map(([key]) => [key,localStorage.getItem(key)]);
        try {
          for (const [key,value] of entries) localStorage.setItem(key,value);
        } catch (error) {
          for (const [key,value] of previous) {
            if (value === null) localStorage.removeItem(key);
            else localStorage.setItem(key,value);
          }
          throw error;
        }
        location.reload();
      } catch {
        status.textContent = '导入失败，请选择从刷题页面导出的答题记录文件。';
      } finally { input.value = ''; }
    };
  });
})();
