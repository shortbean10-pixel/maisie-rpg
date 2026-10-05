(()=>{
"use strict";
const key="maisieStory08", root=document.querySelector("#storyContent");
const fresh=()=>({step:0,reply:"",packing:[],packed:false,owl:0,owlDone:false,flipped:[],matched:[],memoryDone:false});
let s=fresh(), feedback="";
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&Number.isInteger(saved.step)&&saved.step>=0&&saved.step<=5)s=Object.assign(s,saved);}catch{}
const esc=text=>String(text).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const prose=text=>`<p class="story-prose">${text}</p>`;
const speech=(name,text)=>`<div class="dialogue"><strong>${name}</strong>${text}</div>`;
const button=(action,label,extra="")=>`<button class="choice" data-story="${action}" ${extra}>${label}</button>`;
const next=label=>`<div class="story-choices">${button("next",label||"Continue →")}</div>`;
const skip=()=>'<button class="story-secondary" data-story="skip">Skip the game and keep reading →</button>';
const items=["Headphones","Hoodie","School book","Desk lamp","Plant pot","Alarm clock"];
// Fixed, shuffled pairs stay consistent across reloads and allow untimed play.
const cards=["🦉 Owl","🚂 Train","📚 Books","🪄 Wand","🚂 Train","🦉 Owl","🪄 Wand","📚 Books"];
function save(){try{localStorage.setItem(key,JSON.stringify(s));document.querySelector("#storySave").textContent="Progress saved on this device · Part "+(s.step+1)+" of 6";}catch{document.querySelector("#storySave").textContent="Saving is unavailable. Keep this page open to retain your progress.";}}
function reward(kind){document.dispatchEvent(new CustomEvent("story-reward",{detail:{id:"packing-night-"+kind,kind}}));}
function game(title,description,content){return `<div class="story-game"><h2>${title}</h2><p>${description}</p>${content}<div class="game-feedback" role="status" aria-live="polite">${esc(feedback)}</div></div>`;}
function render(){
 let html="";
 if(s.step===0){
  html=prose("The trunk is open beside your bed. Nirvana watches from her perch while your phone lights up against a pile of clothes. Tomorrow, Hogwarts becomes somewhere you actually go.")+speech("HARRY · TEXT","you packed yet or are you leaving it till tomorrow 😭")+prose("You glance at the empty space in the trunk. What do you send back?")+`<div class="story-choices">${button("reply","‘I have a system. You just can’t see it.’",'data-reply="system"')}${button("reply","‘A little nervous, actually.’",'data-reply="nervous"')}${button("reply","‘Come help then 🙄’",'data-reply="help"')}</div>`;
 }else if(s.step===1){
  const replies={system:"a system called everything on the floor? iconic",nervous:"yeah. i was too. one thing at a time, okay?",help:"fine but i’m charging one chocolate frog for this"};
  html=speech("MAISIE",esc({system:"I have a system. You just can’t see it.",nervous:"A little nervous, actually.",help:"Come help then 🙄"}[s.reply]||"Time to pack."))+speech("HARRY · TEXT",replies[s.reply]||"start with the things you actually need")+prose("You pull the trunk closer. Something comfy, something for the journey, something for school. That sounds manageable.");
  html+=game("Trunk check","Choose the three things Maisie just thought of, then check the trunk. Tap again to change a choice.",`<div class="game-grid">${items.map((x,i)=>button("pack",x,`data-item="${i}" aria-pressed="${s.packing.includes(i)}" ${s.packed?"disabled":""}`)).join("")}</div>${s.packed?'<p>✓ Essentials packed.</p>':button("checkPack","Check my trunk")}`)+(s.packed?next():skip());
 }else if(s.step===2){
  html=prose(s.packed?"You close the trunk lid halfway, leaving a little room for tomorrow’s last-minute things.":"You set the packing list on the trunk. You can finish it later; right now, the room feels a bit too quiet.")+speech("HARRY · TEXT","what are you most looking forward to?")+`<div class="story-choices">${button("looking","‘Seeing the castle.’",'data-answer="castle"')}${button("looking","‘Meeting people. Hopefully.’",'data-answer="people"')}${button("looking","‘Honestly? The food.’",'data-answer="food"')}</div>`;
 }else if(s.step===3){
  html=speech("HARRY · TEXT",{castle:"it’s huge. you’ll see what i mean when we get there",people:"you don’t have to meet everyone on day one. promise",food:"okay that is an extremely fair answer"}[s.looking]||"one thing at a time")+prose("Nirvana gives a soft, impatient hoot. You put your phone down. Her water needs refreshing, her evening food is ready, and the cover is folded beside the cage.")+speech("MAISIE","‘All right, your turn. Water, food, then cover. I remembered.’");
  html+=game("Settle Nirvana","Tap the three care actions in the order Maisie said. There is no timer; a wrong tap just lets you try again.",`<div class="game-grid">${["Refresh water","Offer food","Lower the cover"].map((x,i)=>button("owl",x,`data-item="${i}" ${s.owlDone?"disabled":""}`)).join("")}</div><p>${s.owlDone?"✓ Nirvana is settled.":s.owl+" of 3 actions in order"}</p>`)+(s.owlDone?next():skip());
 }else if(s.step===4){
  html=prose(s.owlDone?"Nirvana tucks her head down. You pick your phone back up, careful not to disturb her.":"You leave Nirvana’s things ready and return to the bed.")+speech("HARRY · TEXT","one last challenge. find the matching pairs. loser carries the other one’s trunk (joking. mostly)")+prose("Eight picture cards appear in the message. You can practically hear him laughing.");
  html+=game("Harry’s matching challenge","Tap two cards to look for a pair. If they don’t match, tap Turn them back, then try again. Find all four pairs.",`<div class="game-grid">${cards.map((x,i)=>{const matched=s.matched.includes(i),open=matched||s.flipped.includes(i);return button("card",open?x:"✦",`data-item="${i}" aria-label="${open?x:"Face-down card "+(i+1)}" ${matched||s.flipped.includes(i)||s.memoryDone?"disabled":""}`)}).join("")}</div><p>${s.matched.length/2} of 4 pairs found</p>${s.flipped.length===2?button("turn","Turn them back"):""}`)+(s.memoryDone?next("Read Harry’s reply →"):skip());
 }else{
  html=speech("HARRY · TEXT",s.memoryDone?"okay okay you win 😂 see you in the morning":"we’ll call it a draw. see you in the morning")+prose("You plug in your phone and look once more at the trunk beside your bed. Tomorrow can wait until tomorrow. For tonight, you let yourself breathe.")+speech("MAISIE","‘Night, Harry.’")+prose("End of the packing-night chapter. Your choices and games are saved. You can spend more time in the hub, or replay this chapter with different replies.")+`<div class="story-choices"><button class="choice primary" data-screen="play" id="storyHubEnd">Go to the hub</button>${button("replay","Replay this chapter")}</div><p class="small muted">Replaying restarts this chapter only. Your hub items and previous rewards stay saved.</p>`;
 }
 root.innerHTML=html;
 root.querySelectorAll('[data-story="pack"]').forEach(b=>b.classList.toggle("selected",s.packing.includes(Number(b.dataset.item))));
 root.querySelectorAll('[data-story="card"]').forEach(b=>b.classList.toggle("matched",s.matched.includes(Number(b.dataset.item))));
 const end=root.querySelector("#storyHubEnd");if(end)end.addEventListener("click",()=>document.querySelector('.navbtn[data-screen="play"]').click());
 save();
}
root.addEventListener("click",e=>{
 const b=e.target.closest("[data-story]");if(!b||b.disabled)return;
 const action=b.dataset.story, i=Number(b.dataset.item); feedback="";
 if(action==="reply"){s.reply=b.dataset.reply;s.step=1;}
 if(action==="looking"){s.looking=b.dataset.answer;s.step=3;}
 if(action==="next"||action==="skip")s.step=Math.min(5,s.step+1);
 if(action==="pack"){
  if(s.packing.includes(i))s.packing=s.packing.filter(n=>n!==i);
  else if(s.packing.length<3)s.packing.push(i);
  else feedback="Three things at a time. Tap one to swap it out.";
 }
 if(action==="checkPack"){
  if(s.packing.length===3&&[0,1,2].every(n=>s.packing.includes(n))){s.packed=true;feedback="Headphones, hoodie, school book. Sorted!";reward("packing");}
  else feedback="Think: something comfy, something for the journey, something for school. You can change your picks.";
 }
 if(action==="owl"){
  if(i===s.owl){s.owl++;feedback=["Fresh water. Next, food.","Food ready. Now the cover.","A happy little hoot. Goodnight, Nirvana."][i];}
  else{s.owl=0;feedback="Start again with water, then food, then the cover.";}
  if(s.owl===3){s.owlDone=true;reward("owl");}
 }
 if(action==="card"){
  if(s.flipped.length===2)feedback="Turn these two back before choosing another card.";
  else{
   s.flipped.push(i);
   if(s.flipped.length===2&&cards[s.flipped[0]]===cards[s.flipped[1]]){s.matched.push(...s.flipped);s.flipped=[];feedback="A match!";}
   if(s.matched.length===8){s.memoryDone=true;feedback="All four pairs found. Harry owes you one.";reward("memory");}
  }
 }
 if(action==="turn")s.flipped=[];
 if(action==="replay")s=fresh();
 render();
 if(["next","skip","reply","looking","replay"].includes(action))window.scrollTo({top:0,behavior:"smooth"});
});
render();
})();
