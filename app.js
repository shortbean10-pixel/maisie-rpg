
(()=>{
"use strict";

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clone=o=>JSON.parse(JSON.stringify(o));

const defaults={
  minutes:1214,
  date:"31 August",
  location:"Maisie's Bedroom",
  mood:"Excited",
  energy:72,
  battery:84,
  outfit:"Casual",
  packed:[],
  inventory:[
    {id:"wand",name:"Blackthorn wand",detail:"Dragon heartstring • 11 inches • supple"},
    {id:"phone",name:"iPhone",detail:"Maisie's phone"},
    {id:"headphones",name:"Headphones",detail:"For music and travelling"},
    {id:"hoodie",name:"Blue hoodie",detail:"Currently unpacked"},
    {id:"book",name:"Spellbook",detail:"First-year school book"}
  ],
  relationships:{Harry:78,Mum:94,Dad:92,Nirvana:88},
  tasks:[
    {id:"pack",label:"Pack at least 3 things",done:false},
    {id:"mum",label:"Reply to Mum",done:false},
    {id:"outfit",label:"Choose tomorrow's outfit",done:false}
  ],
  notes:"Hogwarts packing\n• Charger\n• Headphones\n• Wand\n• Don't let Harry steal my hoodie",
  photos:[
    {id:"seed-nirvana",type:"placeholder",label:"Nirvana",emoji:"🦉"},
    {id:"seed-wand",type:"placeholder",label:"Wand",emoji:"🪄"}
  ],
  log:["Test sandbox loaded."],
  unread:{Harry:1,Mum:1,Dad:0,Family:1},
  messages:{
    Harry:[{from:"them",text:"you packed yet or are you leaving it till tomorrow 😭",time:"20:09"}],
    Mum:[{from:"them",text:"Remember to charge your phone tonight x",time:"20:11"}],
    Dad:[{from:"them",text:"Trunk downstairs when you're ready 👍",time:"20:03"}],
    Family:[
      {from:"them",sender:"Mum",text:"Everyone downstairs for 9 please ❤️",time:"20:12"},
      {from:"them",sender:"Harry",text:"why",time:"20:12"},
      {from:"them",sender:"Dad",text:"Because your mother said so 😂",time:"20:13"}
    ]
  },
  settings:{notifications:true,showRelationshipNumbers:true,sound:false},
  selectedCamera:"environment"
};

let state=loadState();
let activeStream=null;
let currentChat=null;
let replyTimer=null;

function loadState(){
  try{
    const raw=localStorage.getItem("maisieRpg07");
    return raw?Object.assign(clone(defaults),JSON.parse(raw)):clone(defaults);
  }catch{
    return clone(defaults);
  }
}
function save(){
  try{localStorage.setItem("maisieRpg07",JSON.stringify(state))}catch{}
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function timeString(){
  const h=Math.floor(state.minutes/60)%24;
  const m=state.minutes%60;
  return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0");
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}
function toast(msg){
  const t=$("#toast");
  t.textContent=msg;
  t.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer=setTimeout(()=>t.classList.add("hidden"),1800);
}
function notify(msg){
  if(!state.settings.notifications)return;
  const bar=$("#notificationBar");
  const d=document.createElement("div");
  d.className="notification";
  d.textContent=msg;
  bar.appendChild(d);
  setTimeout(()=>d.remove(),3200);
}
function addLog(text){
  state.log.unshift(timeString()+" — "+text);
  state.log=state.log.slice(0,40);
  save();
  renderLog();
}
function showScreen(id){
  document.body.classList.toggle("story-mode",id==="story");
  stopCamera();
  $$(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
  $$(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.screen===id));
  window.scrollTo({top:0,behavior:"smooth"});
}
function completeTask(id){
  const t=state.tasks.find(x=>x.id===id);
  if(t)t.done=true;
}
function changeRel(name,delta){
  if(state.relationships[name]!=null){
    state.relationships[name]=clamp(state.relationships[name]+delta,0,100);
  }
}

function renderHUD(){
  $("#hudDate").textContent=state.date;
  $("#hudTime").textContent=timeString();
  $("#hudLocation").textContent=state.location;
  $("#moodStat").textContent=state.mood;
  $("#energyStat").textContent=state.energy+"%";
  $("#batteryStat").textContent=state.battery+"%";
  $("#outfitStat").textContent=state.outfit;
  $("#phoneBatteryTop").textContent=state.battery+"%";
  $("#phoneClock").textContent=timeString();
  $("#profileMood").textContent=state.mood;
  $("#profileEnergy").textContent=state.energy+"%";
  $("#profileOutfit").textContent=state.outfit;

  const unread=Object.values(state.unread).reduce((a,b)=>a+Number(b||0),0);
  const badge=$("#msgBadge");
  badge.textContent=unread;
  badge.classList.toggle("hidden",unread===0);
  $("#navUnread").classList.toggle("hidden",unread===0);
}
function renderLog(){
  const el=$("#actionLog");
  el.innerHTML="";
  state.log.forEach(x=>{
    const d=document.createElement("div");
    d.className="logline";
    d.textContent=x;
    el.appendChild(d);
  });
}
function renderTasks(){
  const packTask=state.tasks.find(t=>t.id==="pack");
  if(packTask)packTask.done=state.packed.length>=3;

  const el=$("#taskList");
  el.innerHTML="";
  state.tasks.forEach(t=>{
    const d=document.createElement("div");
    d.className="task"+(t.done?" done":"");
    d.innerHTML=`<span>${t.done?"✓":"○"}</span><div class="small">${escapeHtml(t.label)}</div>`;
    el.appendChild(d);
  });
  $("#taskCount").textContent=state.tasks.filter(t=>t.done).length+"/"+state.tasks.length;
}
function renderInventory(){
  const el=$("#inventoryList");
  el.innerHTML="";

  state.inventory.forEach(item=>{
    const packed=state.packed.includes(item.id);
    const row=document.createElement("div");
    row.className="itemrow";

    const info=document.createElement("div");
    info.innerHTML=`<strong>${escapeHtml(item.name)}</strong><div class="small muted">${escapeHtml(item.detail)}</div>`;

    const right=document.createElement("div");
    right.className="row";

    const status=document.createElement("span");
    status.className="badge";
    status.textContent=packed?"Packed":"With Maisie";

    const btn=document.createElement("button");
    btn.className="mini";
    btn.style.minHeight="36px";
    btn.style.padding="7px 9px";

    if(item.id==="phone"){
      btn.textContent="Open";
      btn.addEventListener("click",()=>showScreen("phone"));
    }else if(item.id==="headphones"){
      btn.textContent="Use";
      btn.addEventListener("click",()=>{
        state.mood="Relaxed";
        addLog("Put her headphones on.");
        renderAll();
        toast("Maisie feels more relaxed.");
      });
    }else if(item.id==="wand"){
      btn.textContent="Inspect";
      btn.addEventListener("click",()=>toast("Blackthorn • dragon heartstring • 11 inches • supple"));
    }else{
      btn.textContent=packed?"Unpack":"Pack";
      btn.addEventListener("click",()=>togglePack(item.id));
    }

    right.append(status,btn);
    row.append(info,right);
    el.appendChild(row);
  });

  $("#inventoryCount").textContent=state.inventory.length+" items";
}
function renderRelationships(){
  const el=$("#relationshipList");
  el.innerHTML="";
  Object.entries(state.relationships).forEach(([name,val])=>{
    const d=document.createElement("div");
    d.className="relrow";
    const number=state.settings.showRelationshipNumbers?String(val):"";
    d.innerHTML=`<strong class="small">${escapeHtml(name)}</strong>
      <div class="relbar"><span style="width:${val}%"></span></div>
      <span class="tiny muted">${number}</span>`;
    el.appendChild(d);
  });
}
function renderAll(){
  renderHUD();
  renderLog();
  renderTasks();
  renderInventory();
  renderRelationships();
  save();
}

function togglePack(id){
  const item=state.inventory.find(i=>i.id===id);
  if(!item)return;

  if(state.packed.includes(id)){
    state.packed=state.packed.filter(x=>x!==id);
    addLog("Unpacked "+item.name+".");
  }else{
    state.packed.push(id);
    state.energy=clamp(state.energy-1,0,100);
    addLog("Packed "+item.name+".");
  }
  renderAll();
}
function advanceTime(mins){
  state.minutes+=mins;
  state.energy=clamp(state.energy-Math.ceil(mins/15),0,100);
  state.battery=clamp(state.battery-1,0,100);
  maybeIncomingMessages();
  addLog("Waited "+mins+" minutes.");
  renderAll();
}
function maybeIncomingMessages(){
  if(state.minutes>=1230 && !state.messages.Mum.some(m=>m.text.includes("nearly finished"))){
    incoming("Mum","Are you nearly finished packing? x");
  }
  if(state.minutes>=1245 && !state.messages.Harry.some(m=>m.text.includes("mum says"))){
    incoming("Harry","mum says come downstairs in 15");
  }
}
function incoming(name,text){
  state.messages[name].push({from:"them",text,time:timeString()});
  state.unread[name]=(state.unread[name]||0)+1;
  save();
  renderHUD();
  notify(name+": "+text);
}

function backToPhoneHome(){
  stopCamera();
  $("#phoneView").classList.add("hidden");
  $("#phoneHome").classList.remove("hidden");
  $("#phoneView").innerHTML="";
}

function renderChatList(){
  const list=$("#chatList");
  if(!list)return;
  list.innerHTML="";
  ["Harry","Mum","Dad","Family"].forEach(name=>{
    const msgs=state.messages[name]||[];
    const last=msgs[msgs.length-1]||{text:""};
    const unread=state.unread[name]||0;
    const b=document.createElement("button");
    b.className="chatrow";
    b.innerHTML=`<span class="avatar">${name==="Family"?"👨‍👩‍👧‍👦":name[0]}</span>
      <span class="chatmain">
        <strong>${escapeHtml(name)}</strong>
        <span class="small muted preview" style="display:block">${escapeHtml(last.text)}</span>
      </span>
      ${unread?`<span class="badgeDot" style="position:static">${unread}</span>`:""}`;
    b.addEventListener("click",()=>openChat(name));
    list.appendChild(b);
  });
}
function openChat(name){
  currentChat=name;
  state.unread[name]=0;
  save();
  renderHUD();

  const view=$("#phoneView");
  view.innerHTML=`<button class="back" id="backChats">‹ Messages</button>
    <div class="card2" style="margin-top:10px">
      <div class="section-head">
        <strong>${escapeHtml(name)}</strong>
        <span class="tiny muted">${name==="Family"?"Group chat":"Online"}</span>
      </div>
      <div class="bubbles" id="chatBubbles"></div>
      <div id="typingLine" class="typing hidden">${escapeHtml(name)} is typing…</div>
      <form id="chatForm" class="inputrow">
        <input id="chatInput" maxlength="180" placeholder="Message ${escapeHtml(name)}…" autocomplete="off">
        <button class="send" type="submit">Send</button>
      </form>
    </div>`;

  $("#backChats").addEventListener("click",()=>openPhoneApp("messages"));
  renderChat(name);

  $("#chatForm").addEventListener("submit",e=>{
    e.preventDefault();
    const inp=$("#chatInput");
    const v=inp.value.trim();
    if(!v)return;

    state.messages[name].push({from:"me",text:v,time:timeString()});
    inp.value="";

    if(name==="Mum"){
      completeTask("mum");
      changeRel("Mum",1);
    }else if(name==="Harry"){
      if(/shut up|idiot|annoy/i.test(v))changeRel("Harry",-1);
      else changeRel("Harry",1);
    }else if(name==="Dad"){
      changeRel("Dad",1);
    }

    addLog("Messaged "+name+".");
    renderAll();
    renderChat(name);
    queueReply(name,v);
  });
}
function renderChat(name){
  const box=$("#chatBubbles");
  if(!box)return;
  box.innerHTML="";

  state.messages[name].forEach(m=>{
    const d=document.createElement("div");
    d.className="bubble "+(m.from==="me"?"me":"them");
    const sender=m.sender?`<strong style="display:block;font-size:11px;margin-bottom:2px">${escapeHtml(m.sender)}</strong>`:"";
    d.innerHTML=sender+escapeHtml(m.text)+
      `<span class="msgmeta">${escapeHtml(m.time||"")}${m.from==="me"?" · Delivered":""}</span>`;
    box.appendChild(d);
  });
  box.scrollTop=box.scrollHeight;
}
function queueReply(name,text){
  clearTimeout(replyTimer);
  const line=$("#typingLine");
  if(line)line.classList.remove("hidden");

  replyTimer=setTimeout(()=>{
    const reply=generateReply(name,text);
    const payload={from:"them",text:reply,time:timeString()};
    if(name==="Family")payload.sender=["Harry","Mum","Dad"][Math.floor(Math.random()*3)];

    state.messages[name].push(payload);
    save();

    if(currentChat===name){
      renderChat(name);
      const t=$("#typingLine");
      if(t)t.classList.add("hidden");
    }else{
      state.unread[name]=(state.unread[name]||0)+1;
      notify(name+": "+reply);
    }
    renderAll();
  },700+Math.random()*800);
}
function generateReply(name,text){
  const t=text.toLowerCase();

  if(name==="Harry"){
    if(t.includes("packed"))return state.packed.length>=3?"wait you actually packed??":"that's not packed, that's one thing 😭";
    if(/nervous|scared|worried/.test(t))return "you'll be fine. seriously";
    if(/love you/.test(t))return "ew";
    if(/hoodie/.test(t))return "IT IS NOT YOUR HOODIE";
    return ["😭","alright calm down","fair","you are so annoying","what do you want me to say to that"][Math.floor(Math.random()*5)];
  }

  if(name==="Mum"){
    if(/love/.test(t))return "Love you too sweetheart x";
    if(/packed|ready/.test(t))return "Good. Just make sure you've got your charger and ticket x";
    if(/nervous|scared/.test(t))return "That's completely normal. Come down if you want a cuddle x";
    return ["Okay lovely x","Alright sweetheart x","Don't stay up too late x"][Math.floor(Math.random()*3)];
  }

  if(name==="Dad"){
    if(/ready|packed/.test(t))return "Nearly there then 👍";
    if(/nervous|scared/.test(t))return "Big day. You'll be absolutely fine.";
    return ["👍","Sounds good","I'll be downstairs"][Math.floor(Math.random()*3)];
  }

  return ["Harry: who started this 😭","Mum: Behave please 😂","Dad: I'm staying out of this one"][Math.floor(Math.random()*3)];
}

async function dbOpen(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open("maisieRpgPhotos",1);
    req.onupgradeneeded=()=>{
      const db=req.result;
      if(!db.objectStoreNames.contains("photos"))db.createObjectStore("photos",{keyPath:"id"});
    };
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}
async function photoPut(record){
  const db=await dbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction("photos","readwrite");
    tx.objectStore("photos").put(record);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}
async function photoGetAll(){
  const db=await dbOpen();
  return new Promise((resolve,reject)=>{
    const req=db.transaction("photos","readonly").objectStore("photos").getAll();
    req.onsuccess=()=>resolve(req.result||[]);
    req.onerror=()=>reject(req.error);
  });
}
async function photoDelete(id){
  const db=await dbOpen();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction("photos","readwrite");
    tx.objectStore("photos").delete(id);
    tx.oncomplete=()=>resolve();
    tx.onerror=()=>reject(tx.error);
  });
}

async function renderPhotos(){
  const p=$("#photoList");
  if(!p)return;
  p.innerHTML="";

  const cameraPhotos=await photoGetAll().catch(()=>[]);
  const all=[...state.photos,...cameraPhotos];
  $("#photoCount").textContent=all.length+" photos";

  all.forEach(x=>{
    const d=document.createElement("button");
    d.className="photoTile";

    if(x.type==="camera" && x.data){
      const img=document.createElement("img");
      img.src=x.data;
      img.alt=x.label||"Saved photo";
      d.appendChild(img);
    }else{
      const ph=document.createElement("div");
      ph.style.cssText="height:100%;display:flex;align-items:center;justify-content:center;font-size:34px";
      ph.textContent=x.emoji||"📷";
      d.appendChild(ph);
    }

    const lab=document.createElement("div");
    lab.className="label";
    lab.textContent=x.label||"Photo";
    d.appendChild(lab);

    if(x.type==="camera"){
      d.addEventListener("click",async()=>{
        if(confirm("Delete this photo?")){
          await photoDelete(x.id);
          renderPhotos();
        }
      });
    }

    p.appendChild(d);
  });
}

async function startCamera(){
  stopCamera();

  const status=$("#cameraStatus");
  const video=$("#cameraVideo");
  const placeholder=$("#cameraPlaceholder");
  const shutter=$("#shutter");

  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
    status.textContent="Camera isn't available here. Open the published HTTPS site in Safari.";
    return;
  }

  status.textContent="Requesting camera permission…";

  try{
    activeStream=await navigator.mediaDevices.getUserMedia({
      video:{
        facingMode:{ideal:state.selectedCamera},
        width:{ideal:1280},
        height:{ideal:1280}
      },
      audio:false
    });

    video.srcObject=activeStream;
    video.classList.remove("hidden");
    placeholder.classList.add("hidden");
    await video.play();

    shutter.disabled=false;
    status.textContent=state.selectedCamera==="user"?"Front camera":"Back camera";
  }catch{
    placeholder.classList.remove("hidden");
    video.classList.add("hidden");
    shutter.disabled=true;
    status.textContent="Camera permission was blocked or this isn't a secure HTTPS page yet.";
  }
}
function stopCamera(){
  if(activeStream){
    activeStream.getTracks().forEach(t=>t.stop());
    activeStream=null;
  }
}
async function takeCameraPhoto(){
  const video=$("#cameraVideo");
  const canvas=$("#cameraCanvas");

  if(!video||!canvas||video.videoWidth===0)return;

  const size=Math.min(video.videoWidth,video.videoHeight);
  canvas.width=size;
  canvas.height=size;

  const sx=(video.videoWidth-size)/2;
  const sy=(video.videoHeight-size)/2;
  const ctx=canvas.getContext("2d");

  if(state.selectedCamera==="user"){
    ctx.translate(size,0);
    ctx.scale(-1,1);
  }

  ctx.drawImage(video,sx,sy,size,size,0,0,size,size);
  const data=canvas.toDataURL("image/jpeg",0.72);
  const record={
    id:"camera-"+Date.now(),
    type:"camera",
    label:"Bedroom "+timeString(),
    data
  };

  try{
    await photoPut(record);
    state.battery=clamp(state.battery-1,0,100);
    save();
    renderHUD();
    addLog("Took a photo.");
    toast("Photo saved to Photos.");
  }catch{
    toast("Couldn't save the photo.");
  }
}

function setupCameraUI(){
  $("#startCamera").addEventListener("click",startCamera);
  $("#flipCamera").addEventListener("click",async()=>{
    state.selectedCamera=state.selectedCamera==="user"?"environment":"user";
    save();
    await startCamera();
  });
  $("#shutter").addEventListener("click",takeCameraPhoto);
}

function openPhoneApp(app){
  stopCamera();
  const home=$("#phoneHome");
  const view=$("#phoneView");
  home.classList.add("hidden");
  view.classList.remove("hidden");

  let html='<button class="back" id="phoneBack">‹ Apps</button>';

  if(app==="messages"){
    html+='<div class="chatlist" style="margin-top:10px" id="chatList"></div>';
  }else if(app==="camera"){
    html+=`<div class="cameraShell">
      <div class="cameraStage">
        <div class="cameraPlaceholder" id="cameraPlaceholder">
          <div style="font-size:48px">📷</div>
          <strong>Camera</strong>
          <div class="small" style="margin-top:6px">Tap Start camera and allow permission.</div>
          <div class="tiny" style="margin-top:6px">This works on the published HTTPS website in Safari.</div>
        </div>
        <video id="cameraVideo" class="hidden" autoplay playsinline muted></video>
      </div>
      <div class="cameraBar">
        <button class="mini" id="flipCamera">Flip</button>
        <button class="shutter" id="shutter" aria-label="Take photo" disabled></button>
        <button class="mini" id="startCamera">Start camera</button>
      </div>
      <canvas id="cameraCanvas" class="hidden"></canvas>
      <div id="cameraStatus" class="tiny muted" style="text-align:center;margin-top:7px"></div>
    </div>`;
  }else if(app==="photos"){
    html+=`<div class="card2" style="margin-top:10px">
      <div class="section-head"><strong>Photos</strong><span class="badge" id="photoCount"></span></div>
      <div id="photoList" class="photoGrid"></div>
    </div>`;
  }else if(app==="notes"){
    html+=`<div class="card2" style="margin-top:10px">
      <strong>Notes</strong>
      <textarea id="notesBox" style="margin-top:8px"></textarea>
      <div class="tiny muted">Saves automatically.</div>
    </div>`;
  }else if(app==="calendar"){
    html+=`<div class="card2" style="margin-top:10px">
      <strong>Calendar</strong>
      <div class="grid" style="margin-top:8px">
        <div class="itemrow"><div><strong>1 September</strong><div class="small muted">Hogwarts departure</div></div><span class="badge">Tomorrow</span></div>
        <div class="itemrow"><div><strong>11:00</strong><div class="small muted">Hogwarts Express</div></div><span class="badge">Planned</span></div>
      </div>
    </div>`;
  }else if(app==="contacts"){
    html+=`<div class="card2" style="margin-top:10px">
      <strong>Contacts</strong>
      <div class="grid" style="margin-top:8px">
        <button class="chatrow quickChat" data-name="Harry"><span class="avatar">H</span><span><strong>Harry</strong><span class="small muted" style="display:block">Brother</span></span></button>
        <button class="chatrow quickChat" data-name="Mum"><span class="avatar">M</span><span><strong>Mum</strong><span class="small muted" style="display:block">Mum ❤️</span></span></button>
        <button class="chatrow quickChat" data-name="Dad"><span class="avatar">D</span><span><strong>Dad</strong><span class="small muted" style="display:block">Dad</span></span></button>
      </div>
    </div>`;
  }else if(app==="social"){
    html+=`<div class="card2" style="margin-top:10px">
      <strong>Social</strong>
      <div class="itemrow" style="margin-top:8px">
        <div><strong>@harryp</strong><div class="small">packing is going great (lie)</div></div><span>♡ 12</span>
      </div>
      <div class="itemrow" style="margin-top:8px">
        <div><strong>@maisie</strong><div class="small muted">No posts yet</div></div>
        <button class="mini" id="fakePost">Post status</button>
      </div>
    </div>`;
  }else if(app==="settings"){
    html+=`<div class="card2" style="margin-top:10px">
      <strong>RPG settings</strong>
      <div class="switchRow"><span>Notifications</span><button class="toggle ${state.settings.notifications?'on':''}" data-setting="notifications"><span></span></button></div>
      <div class="switchRow"><span>Show relationship numbers</span><button class="toggle ${state.settings.showRelationshipNumbers?'on':''}" data-setting="showRelationshipNumbers"><span></span></button></div>
      <div class="switchRow"><span>Sound effects</span><button class="toggle ${state.settings.sound?'on':''}" data-setting="sound"><span></span></button></div>
      <div class="small muted" style="margin-top:10px">Story: Packing night • Build 0.8</div>
    </div>`;
  }

  view.innerHTML=html;
  $("#phoneBack").addEventListener("click",backToPhoneHome);

  if(app==="messages"){
    renderChatList();
  }else if(app==="camera"){
    setupCameraUI();
  }else if(app==="photos"){
    renderPhotos();
  }else if(app==="notes"){
    const box=$("#notesBox");
    box.value=state.notes;
    box.addEventListener("input",()=>{
      state.notes=box.value;
      save();
    });
  }else if(app==="contacts"){
    $$(".quickChat",view).forEach(b=>b.addEventListener("click",()=>openChat(b.dataset.name)));
  }else if(app==="social"){
    $("#fakePost").addEventListener("click",()=>{
      const text=prompt("What does Maisie post?");
      if(text){
        addLog("Posted a status: "+text);
        toast("Posted.");
      }
    });
  }else if(app==="settings"){
    $$("[data-setting]",view).forEach(b=>b.addEventListener("click",()=>{
      const key=b.dataset.setting;
      state.settings[key]=!state.settings[key];
      save();
      renderRelationships();
      openPhoneApp("settings");
    }));
  }
}

$$("[data-screen]").forEach(b=>b.addEventListener("click",()=>showScreen(b.dataset.screen)));

$("[data-action='phone']").addEventListener("click",()=>{
  showScreen("phone");
  addLog("Checked her phone.");
});
$("[data-action='nirvana']").addEventListener("click",()=>{
  state.mood="Calmer";
  changeRel("Nirvana",2);
  addLog("Talked to Nirvana.");
  renderAll();
  toast("Nirvana seems content.");
});
$("[data-action='pack']").addEventListener("click",()=>{
  const unpacked=state.inventory.find(i=>!state.packed.includes(i.id)&&!["phone","wand"].includes(i.id));
  if(!unpacked){
    toast("Nothing else useful to pack.");
    return;
  }
  togglePack(unpacked.id);
});
$("[data-action='wardrobe']").addEventListener("click",()=>showScreen("maisie"));
$("[data-action='time']").addEventListener("click",()=>advanceTime(15));

$("#customForm").addEventListener("submit",e=>{
  e.preventDefault();
  const input=$("#customAction");
  const v=input.value.trim();
  if(!v)return;

  addLog("Custom action: "+v);
  state.energy=clamp(state.energy-1,0,100);

  if(/music|headphones/i.test(v))state.mood="Relaxed";
  if(/sleep|lie down|bed/i.test(v))state.energy=clamp(state.energy+4,0,100);

  input.value="";
  renderAll();
  toast("Action added.");
});

$$(".outfitBtn").forEach(b=>b.addEventListener("click",()=>{
  state.outfit=b.dataset.outfit;
  completeTask("outfit");
  addLog("Changed outfit to "+state.outfit+".");
  renderAll();
  toast("Outfit changed.");
}));

$$(".appbtn").forEach(b=>b.addEventListener("click",()=>openPhoneApp(b.dataset.app)));

$("#resetGame").addEventListener("click",async()=>{
  if(confirm("Reset all test progress?")){
    stopCamera();
    state=clone(defaults);
    try{localStorage.removeItem("maisieRpg07")}catch{}
    try{
      const db=await dbOpen();
      const tx=db.transaction("photos","readwrite");
      tx.objectStore("photos").clear();
    }catch{}
    save();
    renderAll();
    toast("Test build reset.");
    showScreen("play");
  }
});

if("serviceWorker" in navigator && location.protocol.startsWith("http")){
  navigator.serviceWorker.register("sw.js").catch(()=>{});
}

document.addEventListener("story-reward",e=>{
  const {id,kind}=e.detail;
  state.storyRewards=state.storyRewards||[];
  if(state.storyRewards.includes(id))return;
  state.storyRewards.push(id);
  if(kind==="packing"){
    ["headphones","hoodie","book"].forEach(item=>{if(!state.packed.includes(item))state.packed.push(item)});
    state.mood="Prepared";
  }
  if(kind==="owl"){changeRel("Nirvana",2);state.mood="Calmer";}
  if(kind==="memory")state.mood="Confident";
  addLog("Story: "+{packing:"packed the essentials.",owl:"settled Nirvana for the night.",memory:"finished Harry’s matching challenge."}[kind]);
  renderAll();
});
renderAll();
})();
