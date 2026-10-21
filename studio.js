(() => {
  "use strict";
  const STORE="xreyve-public-studio-local-review-v1";
  const byId=(id)=>document.getElementById(id);
  const title=byId("clip-name"),hook=byId("clip-hook"),notes=byId("clip-notes");
  const video=byId("preview"),file=byId("source-video"),caption=byId("video-caption"),status=byId("save-status");
  let objectUrl=null;
  let decision="UNREVIEWED";
  let savedAt=null;
  const permitted=new Set(["UNREVIEWED","APPROVED_LOCALLY","NEEDS_CHANGES","REJECTED"]);
  function load(){
    try {
      const current=JSON.parse(localStorage.getItem(STORE)||"null");
      if(!current||typeof current!=="object")return;
      title.value=String(current.title||"").slice(0,100);
      hook.value=String(current.hook||"").slice(0,350);
      notes.value=String(current.notes||"").slice(0,2000);
      decision=permitted.has(current.decision)?current.decision:"UNREVIEWED";
      savedAt=current.savedAt||null;
      status.textContent="Saved locally: "+decision.replaceAll("_"," ")+". Video is not stored.";
    } catch(e){status.textContent="Could not load local notes. No data has been uploaded.";}
  }
  function record(){
    return {schema:"xreyve-public-review-v1",title:title.value.slice(0,100),hook:hook.value.slice(0,350),
      notes:notes.value.slice(0,2000),decision, savedAt,videoName:file.files&&file.files.length?file.files[0].name:null,
      mediaUploaded:false,productionSubmitted:false,tiktokPublished:false};
  }
  function save(next){
    if(next)decision=next;
    savedAt=new Date().toISOString();
    try{localStorage.setItem(STORE,JSON.stringify({...record(),videoName:null}));status.textContent="Saved on this device: "+decision.replaceAll("_"," ")+". No upload or posting.";}
    catch(e){status.textContent="Local storage is unavailable. You can export the review instead.";}
  }
  function forgetVideo(){
    if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
    video.pause();video.removeAttribute("src");video.load();video.hidden=true;file.value="";
    caption.textContent="No video selected.";
  }
  file.addEventListener("change",()=>{
    forgetVideoIfNeeded();
    if(!file.files||!file.files.length)return;
    const selected=file.files[0];
    if(!selected.type.startsWith("video/")){file.value="";caption.textContent="Choose a video file.";return;}
    objectUrl=URL.createObjectURL(selected);video.src=objectUrl;video.hidden=false;
    caption.textContent="Previewing locally: "+selected.name+" ("+(selected.size/1048576).toFixed(1)+" MB). No upload.";
  });
  function forgetVideoIfNeeded(){
    if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null;}
    video.pause();video.removeAttribute("src");video.hidden=true;
  }
  byId("clear-video").addEventListener("click",forgetVideo);
  byId("approve").addEventListener("click",()=>save("APPROVED_LOCALLY"));
  byId("needs-changes").addEventListener("click",()=>save("NEEDS_CHANGES"));
  byId("reject").addEventListener("click",()=>save("REJECTED"));
  byId("clear").addEventListener("click",()=>{
    try{localStorage.removeItem(STORE);}catch(e){}
    title.value="";hook.value="";notes.value="";decision="UNREVIEWED";savedAt=null;forgetVideo();
    status.textContent="Review cleared from this browser.";
  });
  byId("export").addEventListener("click",()=>{
    const blob=new Blob([JSON.stringify(record(),null,2)+"\n"],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download="xreyve-local-review.json";document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent="JSON export prepared. No server submission.";
  });
  window.addEventListener("beforeunload",()=>{if(objectUrl)URL.revokeObjectURL(objectUrl);});
  load();
})();