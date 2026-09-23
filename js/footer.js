(function () {
  const footer = document.querySelector('[data-site-footer]');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-col footer-brand">
        <strong>immerscape</strong>
        <span>Квесты в реальности в Москве</span>
        <span>ИП Манцурова Тамара Викторовна</span>
        <span>ИНН 772915605552</span>
        <span>ОГРНИП 325774600224549</span>
        <span>© 2026 Immerscape</span>
      </div>
      <div class="footer-col">
        <strong>Контакты и режим работы</strong>
        <a class="footer-contact-link" href="tel:+79916858651">+7 (991) 685-86-51</a>
        <a class="footer-contact-link" href="mailto:Immerscape-Quest@yandex.ru">Immerscape-Quest@yandex.ru</a>
        <span>Приём звонков: ежедневно 10:00–22:00</span>
        <span>Квесты: ежедневно по записи, 09:00–03:45</span>
      </div>
      <div class="footer-col">
        <strong>Адреса</strong>
        <span>Профсоюзная: ул. Кржижановского, 8, корп. 2</span>
        <span>Таганская: Большой Факельный пер., 2/22</span>
        <span>Измайловская: ул. Первомайская, 5</span>
        <span>Юридический адрес: 2-й Сетуньский пр-д, 11, кв. 48</span>
      </div>
      <div class="footer-col">
        <strong>Документы</strong>
        <p class="footer-legal-policy"><a href="/privacy-policy.md" data-legal-document data-legal-title="Политика в отношении обработки персональных данных">Политика обработки персональных данных</a><a href="/public-offer.md" data-legal-document data-legal-title="Публичная оферта">Публичная оферта</a><a href="/cookie-policy.md" data-legal-document data-legal-title="Политика использования файлов cookie">Политика использования cookie</a></p>
        <strong class="footer-social-title">Соцсети</strong>
        <div class="social-links">
          <a href="https://t.me/immerScape" target="_blank" rel="noopener noreferrer" title="Telegram" aria-label="Telegram"><img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="" width="30" height="30"></a>
          <a href="https://www.tiktok.com/@immerscape_quest" target="_blank" rel="noopener noreferrer" title="TikTok" aria-label="TikTok"><img src="https://img.magnific.com/premium-vector/tik-tok-logo_578229-290.jpg?semt=ais_hybrid&w=740&q=80" alt="" width="30" height="30"></a>
          <a href="https://vk.ru/immerscape" target="_blank" rel="noopener noreferrer" title="VKontakte" aria-label="VKontakte"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/VK_Compact_Logo_%282021-present%29.svg/3840px-VK_Compact_Logo_%282021-present%29.svg.png" alt="" width="30" height="30"></a>
        </div>
      </div>
    </div>`;
})();
