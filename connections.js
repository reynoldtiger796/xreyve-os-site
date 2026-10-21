(() => {
  "use strict";
  const config=window.XREYVE_CONNECT_CONFIG||{};
  const connect=document.getElementById("connect-tiktok");
  const state=document.getElementById("connection-status");
  const description=document.getElementById("connection-description");
  const hint=document.getElementById("connection-hint");

  function disable(message){
    state.textContent="Not connected · Setup pending";
    description.textContent=message;
    hint.textContent="The login option will be available only after its official HTTPS server and app authorization are verified.";
    connect.removeAttribute("href");
    connect.setAttribute("aria-disabled","true");
    connect.setAttribute("tabindex","-1");
  }

  if (!connect||!state||!description||!hint) return;
  if (config.enabled!==true){
    disable("We're preparing read-only authorization. Our TikTok developer app, secure callback, and server-side token storage must pass approval and security checks first.");
    return;
  }
  let origin=null;
  try{
    const parsed=new URL(String(config.authOrigin||""));
    if(parsed.protocol==="https:" && !parsed.username && !parsed.password &&
      !parsed.search && !parsed.hash && parsed.pathname==="/" &&
      parsed.hostname!=="localhost" && !parsed.hostname.endsWith(".github.io")){
      origin=parsed.origin;
    }
  }catch(e){}
  if(!origin){disable("A verified HTTPS authentication server has not been configured.");return;}
  state.textContent="Secure authorization available";
  description.textContent="You will be redirected to TikTok's official Login Kit consent screen through our separate secured server.";
  hint.textContent="Account access requires eligible authorization and the exact account identity match.";
  connect.href=origin+"/auth/tiktok/start";
  connect.removeAttribute("aria-disabled");
  connect.removeAttribute("tabindex");
})();