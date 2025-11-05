/**
 * @file: meta-pixel-inline.ts
 * @responsibility: Script inline para PageView imediato ANTES da hidratação React
 * 🚀 CRÍTICO: Garante que PageView dispara mesmo se usuário fechar antes do React carregar
 */

export function getMetaPixelInlineScript(pixelId: string): string {
  return `
(function() {
  var pixelId = '${pixelId}';
  if (!pixelId) return;

  // 🚀 CRÍTICO: Capturar fbclid da URL IMEDIATAMENTE (antes de qualquer coisa)
  var url = new URL(window.location.href);
  var fbclid = url.searchParams.get('fbclid');
  
  // Criar _fbc se tiver fbclid
  if (fbclid && !document.cookie.includes('_fbc=')) {
    var ts = Math.floor(Date.now() / 1000);
    var fbcValue = 'fb.1.' + ts + '.' + fbclid;
    document.cookie = '_fbc=' + fbcValue + '; Path=/; Max-Age=' + (60 * 60 * 24 * 90) + '; SameSite=Lax';
    
    // Salvar também no localStorage (fallback iOS/ITP)
    try {
      localStorage.setItem('visitavel_fbc', fbcValue);
    } catch(e) {}
  }

  // Criar _fbp se não existir
  if (!document.cookie.includes('_fbp=')) {
    var ts = Math.floor(Date.now() / 1000);
    var rand = Math.random().toString(36).slice(2, 15);
    var fbpValue = 'fb.1.' + ts + '.' + rand;
    document.cookie = '_fbp=' + fbpValue + '; Path=/; Max-Age=' + (60 * 60 * 24 * 365 * 2) + '; SameSite=Lax';
    
    // Salvar também no localStorage (fallback iOS/ITP)
    try {
      localStorage.setItem('visitavel_fbp', fbpValue);
    } catch(e) {}
  }

  // 🚀 CRÍTICO: Gerar event_id único baseado em timestamp + path (compartilhado entre Pixel e CAPI)
  var path = window.location.pathname + window.location.search;
  var timestamp = Date.now();
  var eventId = 'pv_' + timestamp + '_' + btoa(path).slice(0, 8).replace(/[^a-zA-Z0-9]/g, '');
  
  // Armazenar event_id para uso posterior pelo CAPI
  try {
    sessionStorage.setItem('meta_pv_event_id', eventId);
    sessionStorage.setItem('meta_pv_timestamp', timestamp.toString());
  } catch(e) {}

  // Inicializar Pixel se ainda não foi inicializado
  if (!window.fbq) {
    !function(f,b,e,v,n,t,s){
      if(f.fbq)return;
      n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;
      n.push=n;
      n.loaded=!0;
      n.version="2.0";
      n.queue=[];
      t=b.createElement(e);
      t.async=!0;
      t.src=v;
      s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)
    }(window,document,"script","https://connect.facebook.net/en_US/fbevents.js");
  }

  // 🚀 CRÍTICO: Disparar PageView IMEDIATAMENTE (antes da hidratação React)
  if (window.fbq) {
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  } else {
    // Se fbq ainda não carregou, adicionar à fila
    window.fbq = window.fbq || function(){(window.fbq.q=window.fbq.q||[]).push(arguments)};
    window.fbq('init', pixelId);
    window.fbq('track', 'PageView', {}, { eventID: eventId });
  }

  // 🚀 CRÍTICO: Enviar PageView para CAPI também (com mesmo event_id)
  setTimeout(function() {
    try {
      var fbp = document.cookie.match(/[; ]?_fbp=([^;]*)/);
      var fbc = document.cookie.match(/[; ]?_fbc=([^;]*)/);
      var fbpValue = fbp ? fbp[1] : (localStorage.getItem('visitavel_fbp') || '');
      var fbcValue = fbc ? fbc[1] : (localStorage.getItem('visitavel_fbc') || '');
      
      var payload = {
        eventName: 'PageView',
        eventId: eventId,
        eventSourceUrl: window.location.href,
        userAgent: navigator.userAgent,
        fbp: fbpValue || undefined,
        fbc: fbcValue || undefined
      };

      // Usar sendBeacon se disponível (mais confiável)
      if (navigator.sendBeacon) {
        var blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/meta/track', blob);
      } else {
        // Fallback para fetch
        fetch('/api/meta/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(function() {}); // Ignorar erros silenciosamente
      }
    } catch(e) {
      // Ignorar erros
    }
  }, 500); // Delay de 500ms para Pixel chegar primeiro
})();
`.trim();
}
