(function () {
  var $ = function (s, k) { return (k || document).querySelector(s); }, $$ = function (s, k) { return [].slice.call((k || document).querySelectorAll(s)); };
  var sakla = function (a, v) { try { localStorage.setItem(a, JSON.stringify(v)); } catch (e) { } };
  var oku = function (a, v) { try { return JSON.parse(localStorage.getItem(a)) || v; } catch (e) { return v; } };
  var zaman = function (t) { return new Date(t).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).replace(/(\d{2}):(\d{2})/, '$1.$2'); };
  var titre = function (d) { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(d); };
  var azHareket = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toastGizle = function () { var t = $('.c-toast'); if (t) t.hidden = true; };

  // happy hour: kendiliğinden kayar; dokunulunca ya da azaltılmış harekette durur
  var k = $('.c-kayan');
  if (k && k.children.length) {
    var nk = $$('.c-nokta i'), dur = false;
    var sira = function () { return Math.round(k.scrollLeft / (k.children[0].offsetWidth + 12)); };
    k.addEventListener('scroll', function () { var i = sira(); nk.forEach(function (n, j) { n.classList.toggle('on', i === j); }); }, { passive: true });
    ['pointerdown', 'touchstart', 'focusin', 'wheel'].forEach(function (o) { k.addEventListener(o, function () { dur = true; }, { passive: true }); });
    if (!azHareket && k.children.length > 1) setInterval(function () { if (dur || document.hidden) return; k.scrollTo({ left: ((sira() + 1) % k.children.length) * (k.children[0].offsetWidth + 12), behavior: 'smooth' }); }, 4000);
  }

  // kapalı duran alerjen bölümü, çubuktan ya da bağlantıdan gelinince açılır
  var katla = $('#c-alerjen .c-katla');
  if (katla) {
    var katlaAc = function () { if (location.hash === '#c-alerjen') katla.open = true; };
    document.addEventListener('click', function (e) { if (e.target.closest('a[href="#c-alerjen"]')) katla.open = true; });
    addEventListener('hashchange', katlaAc); katlaAc();
  }

  // kategori çubuğunda bulunulan bölüm
  var sekme = $$('.c-sekme a'), cizim = 0;
  function bulun() { cizim = 0; var s = sekme[0]; sekme.forEach(function (a) { var b = document.getElementById(a.hash.slice(1)); if (b && b.getBoundingClientRect().top <= 80) s = a; }); sekme.forEach(function (a) { if (a === s) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current'); }); }
  addEventListener('scroll', function () { if (!cizim) cizim = requestAnimationFrame(bulun); }, { passive: true });

  // arama
  var araD = $('.c-ara'), arama = $('#c-arama'), araG = $('#c-ara-g'), araS = $('.c-ara-sonuc');
  if (araD && arama) {
    var ara = function () {
      var q = araG.value.trim().toLocaleLowerCase('tr'), n = 0;
      document.body.classList.toggle('c-ariyor', !!q);
      $$('.c-bolum:not(.c-alerjen)').forEach(function (b) {
        var var_ = 0;
        $$('.c-urun', b).forEach(function (u) { var g = !q || u.dataset.ara.indexOf(q) > -1; if (g) { var_++; n++; } if (g) u.removeAttribute('data-gizle'); else u.setAttribute('data-gizle', ''); });
        if (var_) b.removeAttribute('data-gizle'); else b.setAttribute('data-gizle', '');
      });
      araS.textContent = q ? (n ? n + ' ürün bulundu.' : 'Bu adla ürün yok. Başka bir sözcük deneyin.') : '';
    };
    araD.addEventListener('click', function () {
      var ac = arama.hidden;
      arama.hidden = !ac; araD.setAttribute('aria-expanded', String(ac));
      if (ac) { arama.scrollIntoView({ block: 'nearest' }); araG.focus(); } else { araG.value = ''; ara(); araD.focus(); }
    });
    araG.addEventListener('input', ara);
    araG.addEventListener('keydown', function (e) { if (e.key === 'Escape') araD.click(); });
  }

  // alerjen ayrıntısı
  var aDlg = $('.c-alj-dlg');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.c-alj');
    if (!b || !aDlg.showModal) return;
    $('#c-alj-b', aDlg).textContent = b.dataset.baslik;
    $('ul', aDlg).replaceChildren.apply($('ul', aDlg), JSON.parse(b.dataset.ayrinti).map(function (m) { var li = document.createElement('li'); li.textContent = m; return li; }));
    toastGizle(); aDlg.showModal();
  });

  // duyuru zili
  var zil = $('.c-zil'), panel = $('#c-duyurular'), toast = $('.c-toast');
  if (zil && panel) (function () {
    var rozet = $('.c-rozet', zil), ogeler = $$('[data-duyuru]', panel), A = 'hm-duyuru', gorulen = oku(A, []), ayar = panel.dataset;
    var yeni = ogeler.filter(function (o) { return gorulen.indexOf(o.dataset.duyuru) < 0; });
    function say() { rozet.textContent = yeni.length || ''; zil.setAttribute('aria-label', yeni.length ? 'Duyurular, ' + yeni.length + ' yeni' : 'Duyurular'); }
    function goruldu() { sakla(A, ogeler.map(function (o) { return o.dataset.duyuru; })); yeni = []; say(); }
    function toastKapa() { toast.hidden = true; }
    function ac() { ogeler.forEach(function (o) { o.classList.toggle('yeni', yeni.indexOf(o) > -1); }); panel.hidden = false; zil.setAttribute('aria-expanded', 'true'); toastKapa(); goruldu(); }
    function kapa() { panel.hidden = true; zil.setAttribute('aria-expanded', 'false'); }
    zil.hidden = false; say();
    // başlık ekrandan çıkınca zil kategori çubuğunun sağ ucuna yapışır
    if ('IntersectionObserver' in window) new IntersectionObserver(function (g) { document.documentElement.classList.toggle('zil-yapisik', !g[0].isIntersecting); }).observe($('.c-bas'));
    zil.addEventListener('click', function () { if (ayar.titresim === '1') titre(15); if (panel.hidden) ac(); else kapa(); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) kapa(); });
    document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target) && !zil.contains(e.target)) kapa(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { kapa(); zil.focus(); } });
    $('.c-toast-ac', toast).addEventListener('click', function () { ac(); $('a', panel).focus(); });
    $('.c-toast-kapat', toast).addEventListener('click', toastKapa);
    if (!yeni.length || ayar.acilis !== '1') return;
    var m = $('.c-toast-metin', toast);
    m.replaceChildren.apply(m, [].slice.call($('a', yeni[0]).cloneNode(true).childNodes).filter(function (n) { return n.nodeName !== 'SMALL'; }));
    $('.c-toast-ek', toast).textContent = yeni.length > 1 ? (yeni.length - 1) + ' yeni duyuru daha' : '';
    toast.hidden = false; toast.classList.add('giris'); requestAnimationFrame(function () { requestAnimationFrame(function () { toast.classList.remove('giris'); }); });
    var sure = setTimeout(toastKapa, (+ayar.sure || 8) * 1000);
    toast.addEventListener('pointerenter', function () { clearTimeout(sure); }); toast.addEventListener('focusin', function () { clearTimeout(sure); });
    // tarayıcılar dokunuş olmadan ses ve titreşime izin vermez: çalamazsa ilk dokunuşta çalar
    var C = window.AudioContext || window.webkitAudioContext;
    if (!C || (ayar.ses !== '1' && ayar.titresim !== '1')) return;
    var a = new C();
    function cal() {
      if (ayar.titresim === '1') titre([60, 40, 60]);
      if (ayar.ses !== '1') return;
      [880, 1318.5].forEach(function (f, i) { var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i * 0.15; o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.45); });
    }
    if (a.state === 'running') { cal(); return; }
    var OLAY = ['pointerup', 'touchend', 'mousedown', 'keydown'];
    function ilk() { OLAY.forEach(function (o) { removeEventListener(o, ilk, true); }); if (yeni.length) a.resume().then(cal); }
    OLAY.forEach(function (o) { addEventListener(o, ilk, true); });
  })();

  // hediye çarkı: ödülü sunucu seçer, çark yalnız o dilimde durur
  var dlg = $('#cark'), fab = $('.c-hediye');
  if (dlg && dlg.showModal) (function () {
    fab.hidden = false;
    var adim = { numara: $('[data-adim=numara]', dlg), cark: $('[data-adim=cark]', dlg), sonuc: $('[data-adim=sonuc]', dlg) };
    var n = +dlg.dataset.dilimSay, girdi = $('#c-tel', dlg), hataP = $('.c-hata', dlg), teker = $('.c-teker-svg', dlg), cevir = $('.c-cevir', dlg);
    var A = 'hm-cark-numara', numara = oku(A, ''), aci = 0, ses = null, saat = 0;
    function goster(x) { Object.keys(adim).forEach(function (y) { adim[y].hidden = y !== x; }); }
    function istek(yol, govde) {
      return fetch('/api/cark/' + yol, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(govde) })
        .then(function (r) { return r.json().then(function (j) { j._durum = r.status; return j; }); });
    }
    function uyar(m) { hataP.textContent = m; hataP.hidden = false; girdi.setAttribute('aria-invalid', 'true'); girdi.focus(); }
    // bildirim izni çarkta numarayla birlikte istenir; tarayıcı desteklemiyorsa (iPhone'da ana ekrana eklenmemişse) kutu gizli kalır
    var izinKutu = $('.c-bildirim-izin', dlg), izinG = $('#c-bildirim', dlg), vapid = null;
    if (izinKutu && 'serviceWorker' in navigator && 'PushManager' in window && window.Notification && Notification.permission !== 'denied')
      fetch('/api/bildirim/anahtar').then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.anahtar) { vapid = j.anahtar; izinKutu.hidden = false; } }).catch(function () { });
    var b64 = function (s) { s = s.replace(/-/g, '+').replace(/_/g, '/'); s += '='.repeat((4 - s.length % 4) % 4); return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
    // abonelik kaydedilirse true döner
    function aboneOl(no) {
      var izin = Notification.requestPermission();
      return Promise.all([izin, navigator.serviceWorker.register('/sw.js').then(function () { return navigator.serviceWorker.ready; })]).then(function (x) {
        if (x[0] !== 'granted') return false;
        return x[1].pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(vapid) }).then(function (a) {
          return fetch('/api/bildirim/abone', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ numara: no, abonelik: a.toJSON() }) }).then(function (r) { return r.ok; });
        });
      }).catch(function () { return false; });
    }
    function yaz(sinif, metin) { $(sinif, adim.sonuc).textContent = metin || ''; }
    function canliSaat(acik) {
      clearInterval(saat); yaz('.c-sonuc-saat', '');
      if (!acik) return;
      var t = function () { yaz('.c-sonuc-saat', 'Şu an ' + new Date().toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' }).replace(/:/g, '.')); };
      t(); saat = setInterval(t, 1000);
    }
    function sonuc(r, yeniCevirme) {
      var kodVar = r.kod && !r.teslim && Date.parse(r.gecerli) > Date.now();
      if (yeniCevirme) yaz('.c-sonuc-ust', r.kazandi ? 'Hediyen:' : 'Bu sefer olmadı.');
      else yaz('.c-sonuc-ust', r.baskaNumara ? 'Bu telefondan son çevirmenin süresi dolmadı.' : kodVar ? 'Bu numara çarkı çevirdi. Hediyen:' : r.teslim ? 'Hediyeni kasadan aldın.' : 'Bu numara çarkı çevirdi.');
      yaz('.c-sonuc-odul', kodVar ? r.odul : '');
      yaz('.c-sonuc-kod', kodVar ? r.kod : '');
      canliSaat(kodVar);
      var not = kodVar ? 'Kasada bu ekranı göster. Kod ' + zaman(r.gecerli) + ' saatine kadar geçerli, ' + r.numara + ' numarasına tanımlı.' : '';
      not += (not ? ' ' : '') + 'Yeniden çevirme: ' + zaman(r.sonraki) + '.';
      yaz('.c-sonuc-not', not);
      goster('sonuc');
    }
    function ac(e) {
      if (e) e.preventDefault();
      if (dlg.open) return;
      girdi.value = numara ? '0' + numara.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4') : '';
      hataP.hidden = true; girdi.removeAttribute('aria-invalid');
      goster('numara'); toastGizle(); dlg.showModal(); girdi.focus();
    }
    document.addEventListener('click', function (e) { if (e.target.closest('[data-cark-ac]')) ac(e); });
    if (location.hash === '#cark') ac();
    dlg.addEventListener('close', function () { canliSaat(false); });
    $('.c-numara', dlg).addEventListener('submit', function (e) {
      e.preventDefault();
      var d = girdi.value.replace(/\D/g, '').replace(/^90(?=5\d{9}$)/, '').replace(/^0(?=5\d{9}$)/, '');
      if (!/^5\d{9}$/.test(d)) return uyar('Numara 05 ile başlayan 11 haneli olmalı, ör. 0532 123 45 67.');
      // işletme bildirim onayını zorunlu yaptıysa onaysız çevrilmez
      var zorunlu = izinKutu && izinKutu.dataset.zorunlu === '1';
      if (zorunlu && !izinG.checked) return uyar('Çarkı çevirmek için bildirim kutusunu işaretle.');
      if (zorunlu && !vapid) return uyar(window.Notification && Notification.permission === 'denied' ? 'Bu sitenin bildirimleri tarayıcında kapalı. Tarayıcı ayarlarından izin verip yeniden dene.' : 'Bu tarayıcı bildirim desteklemiyor. iPhone’da menüyü Paylaş › Ana Ekrana Ekle ile ekleyip oradan aç.');
      var abone = vapid && izinG.checked ? aboneOl(d) : null;
      hataP.hidden = true; girdi.removeAttribute('aria-invalid');
      var dugme = $('.c-dugme', adim.numara); dugme.disabled = true;
      (zorunlu ? abone : Promise.resolve(true)).then(function (ok) {
        if (!ok) { dugme.disabled = false; return uyar('Bildirim izni verilmedi. Çarkı çevirmek için izin gerekiyor.'); }
        return istek('durum', { numara: d }).then(function (r) {
          dugme.disabled = false;
          if (r.hata) return uyar(r.hata);
          numara = d; sakla(A, d);
          if (!r.izin) return sonuc(Object.assign({ kalan: r.kalan, baskaNumara: r.baskaNumara }, r.son), false);
          goster('cark'); cevir.disabled = false; cevir.focus();
        });
      }).catch(function () { dugme.disabled = false; uyar('Bağlantı kurulamadı. İnternetini kontrol edip yeniden dene.'); });
    });
    function tik() { if (!ses) return; var o = ses.createOscillator(), g = ses.createGain(), t = ses.currentTime; o.type = 'square'; o.frequency.value = 1400; g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.03); o.connect(g); g.connect(ses.destination); o.start(t); o.stop(t + 0.035); titre(6); }
    function kazandi() { if (dlg.dataset.ses === '0') return; titre([80, 50, 160]); if (!ses) return; [880, 1108.7, 1318.5].forEach(function (f, i) { var o = ses.createOscillator(), g = ses.createGain(), t = ses.currentTime + i * 0.12; o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5); o.connect(g); g.connect(ses.destination); o.start(t); o.stop(t + 0.55); }); }
    cevir.addEventListener('click', function () {
      cevir.disabled = true;
      var C = window.AudioContext || window.webkitAudioContext; if (C && !ses && dlg.dataset.ses !== '0') ses = new C(); if (ses && ses.resume) ses.resume();
      istek('cevir', { numara: numara }).then(function (r) {
        if (r.hata) { cevir.disabled = false; goster('numara'); return uyar(r.hata); }
        if (r._durum === 429) return sonuc(Object.assign({ kalan: r.kalan }, r.son), false);
        var dil = 360 / n, oynat = (Math.random() * 0.7 - 0.35) * dil;
        var hedef = aci + 360 * 6 + ((360 - r.dilim * dil - (aci % 360)) % 360 + 360) % 360 + oynat;
        var bas = aci, sayac = Math.floor((bas + dil / 2) / dil), bitti = false;
        function izle() {
          if (bitti) return;
          var m = getComputedStyle(teker).transform, a = bas;
          if (m && m !== 'none') { var v = m.match(/-?[\d.e]+/g).map(Number), d = Math.atan2(v[1], v[0]) * 180 / Math.PI; a = d + Math.round((a - d) / 360) * 360; var kk = Math.floor((a + dil / 2) / dil); if (kk !== sayac) { sayac = kk; tik(); } bas = a; }
          requestAnimationFrame(izle);
        }
        teker.addEventListener('transitionend', function son() {
          teker.removeEventListener('transitionend', son); bitti = true;
          if (r.kazandi) kazandi();
          setTimeout(function () { sonuc(r, true); }, 500);
        });
        aci = hedef; teker.style.transform = 'rotate(' + hedef + 'deg)'; requestAnimationFrame(izle);
      }).catch(function () { cevir.disabled = false; goster('numara'); uyar('Bağlantı kurulamadı. İnternetini kontrol edip yeniden dene.'); });
    });
  })();
})();
