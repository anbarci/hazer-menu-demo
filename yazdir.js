// ?yazdir=1 ile açılınca yazı tipleri yüklendikten sonra yazdırma penceresini açar (oradan "PDF olarak kaydet" de seçilebilir)
if (new URLSearchParams(location.search).has('yazdir')) (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () { setTimeout(print, 300); });
