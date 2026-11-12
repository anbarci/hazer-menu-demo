(function () {
  var dilimler = [{"kisa":"Çay","ad":"Çay bizden","agirlik":10,"bos":false},{"kisa":"Olmadı","ad":"","agirlik":30,"bos":true},{"kisa":"%10 indirim","ad":"Hesabında %10 indirim","agirlik":6,"bos":false},{"kisa":"Yarın gel","ad":"","agirlik":30,"bos":true},{"kisa":"Türk kahvesi","ad":"Türk kahvesi bizden","agirlik":3,"bos":false},{"kisa":"Az kaldı","ad":"","agirlik":21,"bos":true}], asil = window.fetch.bind(window);
  var yanit = function (j) { return Promise.resolve(new Response(JSON.stringify(j), { status: 200, headers: { 'content-type': 'application/json' } })); };
  var goster = function (d) { d = String(d).replace(/\D/g, '').slice(-10); return '0' + d.slice(0, 3) + ' ' + d.slice(3, 6) + ' ' + d.slice(6, 8) + ' ' + d.slice(8); };
  window.fetch = function (yol, ayar) {
    if (typeof yol !== 'string' || yol.indexOf('/api/cark/') !== 0) return asil(yol, ayar);
    if (yol === '/api/cark/durum') return yanit({ izin: true, kalan: null });
    var g = JSON.parse(ayar.body), top = dilimler.reduce(function (t, d) { return t + d.agirlik; }, 0), x = Math.random() * top, i = 0;
    for (; i < dilimler.length - 1; i++) { x -= dilimler[i].agirlik; if (x < 0) break; }
    var d = dilimler[i], simdi = Date.now(), harf = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', kod = 'PK-';
    for (var k = 0; k < 5; k++) kod += harf[Math.floor(Math.random() * harf.length)];
    return yanit({ dilim: i, kazandi: !d.bos, odul: d.bos ? null : d.ad || d.kisa, kod: d.bos ? null : kod, gecerli: d.bos ? null : new Date(simdi + 48 * 36e5).toISOString(), numara: goster(g.numara), sonraki: new Date(simdi + 24 * 36e5).toISOString(), kalan: null });
  };
})();
