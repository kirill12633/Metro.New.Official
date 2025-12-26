<script>
(function () {
  const STORAGE_KEY = 'metro_new_privacy_notice';

  if (localStorage.getItem(STORAGE_KEY)) return;

  const banner = document.createElement('div');
  banner.style.position = 'fixed';
  banner.style.bottom = '0';
  banner.style.left = '0';
  banner.style.right = '0';
  banner.style.background = '#1e1e1e';
  banner.style.color = '#ffffff';
  banner.style.padding = '12px 16px';
  banner.style.fontSize = '14px';
  banner.style.display = 'flex';
  banner.style.justifyContent = 'space-between';
  banner.style.alignItems = 'center';
  banner.style.zIndex = '9999';

  banner.innerHTML = `
    <span>
      Используя данный сайт, вы соглашаетесь с
      <a href="https://docs.google.com/document/d/1Y_3cs7qEcSehVIirIPSSqJQjxOco5ixipMF6zXSSO_I/edit"
         target="_blank"
         style="color:#4ea1ff;text-decoration:underline;">
        Политикой конфиденциальности
      </a>.
    </span>
    <button id="privacy-close"
      style="margin-left:12px;background:none;border:1px solid #555;color:#fff;padding:4px 10px;cursor:pointer;">
      Закрыть
    </button>
  `;

  document.body.appendChild(banner);

  document.getElementById('privacy-close').addEventListener('click', function () {
    localStorage.setItem(STORAGE_KEY, 'true');
    banner.remove();
  });
})();
</script>
