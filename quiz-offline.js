document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('download-offline');
  const status = document.getElementById('offline-status');
  if (!button) return;
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    button.disabled = true;
    status.textContent = '请通过 HTTPS 地址打开以使用离线下载。';
    return;
  }
  button.onclick = async () => {
    button.disabled = true;
    try {
      await navigator.serviceWorker.register('quiz-sw.js');
      await navigator.serviceWorker.ready;
      const response = await fetch('quiz-offline-files.json', {cache:'no-store'});
      if (!response.ok) throw Error();
      const files = await response.json();
      const cache = await caches.open('guide-quiz-offline-v1');
      let next = 0;
      let completed = 0;
      await Promise.all(Array.from({length:4}, async () => {
        while (next < files.length) {
          const file = files[next++];
          const request = new Request(file, {cache:'reload'});
          if (!(await cache.match(request))) await cache.add(request);
          completed++;
          status.textContent = '下载中 ' + completed + ' / ' + files.length + '，请保持页面打开';
        }
      }));
      if (navigator.storage?.persist) await navigator.storage.persist();
      status.textContent = '全部卷子和解析已下载。请开启飞行模式重新打开本页，检查能否刷题。';
    } catch {
      status.textContent = '下载未完成，已下载的文件会保留。请保持联网后重试。';
    } finally { button.disabled = false; }
  };
});
