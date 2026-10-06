(()=>{
"use strict";
const E=window.CampaignEngine;
const key="maisieCampaign11";
const root=document.querySelector("#rpgContent");
let s=E.fresh(),view="story",storageOK=true,needsReset=true;
try{
  const old=JSON.parse(localStorage.getItem(key));
  if(old?.version===11){s={...s,...old};needsReset=false;}
}catch{}
if(s.intro<5)s.relations.Nirvana=null;

const esc=t=>String(t??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const btn=(action,label,value="",extra="")=>`<button class="choice" data-campaign="${action}" data-value="${esc(value)}" ${extra}>${label}</button>`;
const choices=html=>`<div class="story-choices">${html}</div>`;
const prose=t=>`<p class="story-prose">${esc(t)}</p>`;
const speech=(name,t)=>`<div class="dialogue"><strong>${esc(name)}</strong>${esc(t)}</div>`;
const bar=(name,n,reason="")=>`<div class="skill-line"><div class="row space"><strong>${esc(name)}</strong><span>${Math.round(n)}/100</span></div><progress max="100" value="${Math.max(0,Math.min(100,n))}" aria-label="${esc(name)} progress"></progress>${reason?`<div class="tiny muted">${esc(reason)}</div>`:""}</div>`;
const progress=(name,n)=>`<div class="skill-line"><div class="row space"><strong>${esc(name)}</strong><span>${E.milestone(n)} · ${n%100}/100</span></div><progress max="100" value="${n%100}" aria-label="${esc(name)} milestone progress"></progress><div class="tiny muted">Total ${n} · next band at ${(Math.floor(n/100)+1)*100}</div></div>`;
function save(){try{localStorage.setItem(key,JSON.stringify(s));storageOK=true;}catch{storageOK=false;}}
function sync(reset=false){
  document.dispatchEvent(new CustomEvent("campaign-sync",{detail:{
    reset,started:s.started,minutes:s.minutes,date:E.date(s),location:E.locations[s.location],energy:s.energy,
    mood:s.mood>=75?"Hopeful":s.mood>=40?"Steady":"Low",battery:s.battery,contacts:[...s.contacts],photo:s.photo,
    house:s.house,inventory:[...s.inventory],relations:{...s.relations},intro:s.intro,spells:Object.keys(s.spells).filter(n=>s.spells[n]>0),post:s.post,
    messageEffects:[...s.messageEffects],personality:{...s.personality},skills:{...s.skills},tasks:s.day?[
      {id:"lesson",label:"Try a lesson or spell practice",done:s.daily.some(x=>["charms","potions","flying","practice"].includes(x))},
      {id:"friend",label:"Spend time with someone",done:s.daily.includes("friends")},
      {id:"discover",label:"Explore or study",done:s.daily.some(x=>["study","explore"].includes(x))}
    ]:[
      {id:"letter",label:"Read your Hogwarts letter",done:s.intro>0},
      {id:"supplies",label:"Get school supplies",done:s.intro>=5},
      {id:"arrival",label:"Arrive at Hogwarts",done:s.day>0}
    ]
  }}));
}
function fullLetter(){
  return `<div class="letter-paper" aria-label="Hogwarts letter">
    <div class="letter-crest">✦</div>
    <div class="letter-school">HOGWARTS SCHOOL<br>OF WITCHCRAFT AND WIZARDRY</div>
    <div class="letter-office">Headmaster: Albus Dumbledore<br>Deputy Headmistress: Minerva McGonagall</div>
    <hr>
    <p>Dear Miss Potter,</p>
    <p>We are delighted to offer you a place in the first-year class at Hogwarts School of Witchcraft and Wizardry. Your term begins on <strong>1 September 1992</strong>; please arrive in good time to board the school train from Platform 9¾.</p>
    <p>This envelope contains the list of books, clothing and equipment needed for your first year. A copy of the school rules is included for your family to read before term begins. First-year pupils should not bring a broomstick of their own.</p>
    <p>If you have questions before departure, write to the school by owl post. A member of staff will meet new pupils at the station and guide them to the castle.</p>
    <p>We look forward to welcoming you to the school community.</p>
    <p class="letter-signoff">Yours faithfully,<br><strong>Minerva McGonagall</strong><br>Deputy Headmistress</p>
    <div class="letter-address">Miss Maisie Potter<br>The Dursleys’ house</div>
  </div>`;
}
function statsHTML(){
  const knownFacts=Object.entries(s.facts).flatMap(([name,facts])=>(facts||[]).map(f=>`${name}: ${f}`));
  const knownHtml=knownFacts.length?knownFacts.slice(0,24).map(x=>`<p class="small">${esc(x)}</p>`).join(""):'<p class="small muted">Facts appear as Maisie meets people.</p>';
  const effectsHtml=s.messageEffects.length?s.messageEffects.slice(0,8).map(x=>`<p class="small">${esc(x.name)} · ${esc(x.effect)}</p>`).join(""):'<p class="small muted">Messages can change later conversations and plans.</p>';
  const journalHtml=s.history.slice(0,18).map(x=>`<p class="small">Day ${x.day} · ${x.time} — ${esc(x.text)}</p>`).join("")||'<p class="small muted">Your story starts with Hedwig at the window.</p>';
  return `<h2>My Stats</h2>
    <p class="small muted">Maisie Potter · age 11 · first year · human · half-blood<br>${esc(s.house)} · Level ${1+Math.floor(s.xp/100)} · ${s.xp} XP</p>
    <h3>Condition</h3>${bar("Energy",s.energy,"Rest, meals and activities change this.")}${bar("Mood",s.mood,"Your choices and conversations affect it.")}${bar("Phone battery",s.battery)}
    <h3>Skills</h3>${Object.entries(s.skills).map(([n,v])=>progress(n,v)).join("")}
    <h3>Personality points</h3>${Object.entries(s.personality).map(([n,v])=>progress(n,v)).join("")}
    <h3>Spells</h3>${Object.entries(s.spells).map(([n,v])=>progress(n,v)).join("")}
    <p class="small muted">Lumos: ${s.spells.Lumos===0?"Not learned yet":s.spells.Lumos<100?"A first light; building steadiness":"Working towards longer, reliable light"}.<br>Leviosa: ${s.spells.Leviosa===0?"Not learned yet":s.spells.Leviosa<100?"Early lifts; building control":"Working towards consistent control"}.</p>
    <h3>Belongings</h3><p class="small">${s.inventory.map(esc).join(" · ")}</p>${s.inventory.includes("Blackthorn wand")?'<p class="small muted">Blackthorn wand · dragon heartstring · 11 inches · supple.</p>':""}
    <h3>Known facts</h3>${knownHtml}
    <h3>Phone consequences</h3>${effectsHtml}
    <h3>Journal</h3>${journalHtml}`;
}
function relationshipsHTML(){
  return Object.entries(s.relations).map(([name,n])=>`<details class="character-detail"><summary>${esc(name)} <span class="muted">${n===null?"Unknown":n<35?"Uneasy":n>65?"Warm":"Getting to know you"}</span></summary><div class="small muted">Dislike ← Neutral → Like</div><progress max="100" value="${n===null?50:n}" aria-label="${esc(name)} relationship"></progress><p class="small">${n===null?"Feeling unknown":n+"/100"}</p>${(s.facts[name]||[]).map(x=>`<p class="small">${esc(x)}</p>`).join("")||'<p class="small muted">No facts learned yet.</p>'}</details>`).join("");
}
function hub(){
  const h=document.querySelector("#campaignHub");
  if(!h)return;
  h.innerHTML=`<div class="section-head"><strong>Your RPG</strong><span class="badge">Build 1.0</span></div><p class="small muted">${esc(E.date(s))} · ${E.time(s)} · ${esc(E.locations[s.location])}</p><div class="action-grid">${btn("returnStory","Continue story")}${btn("arcadeMenu","Mini games · Play now")}${btn("statsView","My Stats · full sheet")}${btn("mapView","Explore · Places")}${btn("journalView","Nightly and weekly reviews")}</div>`;
  const stats=document.querySelector("#campaignStats");if(stats)stats.innerHTML=statsHTML();
  const rel=document.querySelector("#relationshipList");if(rel)rel.innerHTML=relationshipsHTML();
  const scene=document.querySelector("#sceneText");if(scene)scene.textContent="The Hub holds Maisie’s phone, bag, camera, relationships and full character sheet. Continue the physical story, or open Mini games for an extra challenge.";
  const title=document.querySelector("#play .scene-title");if(title)title.textContent=s.day?`Day ${s.day} at Hogwarts`:"Hedwig’s letter";
}
function introMini(title,steps){
  return `<div class="story-game"><h2>${title} · Mini game</h2><p>Tap in order: ${steps.join(" → ")}. No timer. ${s.introProgress}/${steps.length} steps complete.</p><div class="game-grid">${steps.map(x=>btn("introGame",x,x,s.introProgress===steps.length?"disabled":"")).join("")}</div></div>`;
}
function introHTML(){
  const pages=[
    ()=>prose("Hedwig, Harry’s snowy owl, lands on the outside sill. Its claws grip a thick envelope sealed with red wax. The address is written in green ink: Maisie Potter, The Dursleys’ house.")+fullLetter()+speech("HARRY","That’s for you. Open it when you’re ready; I’m right here.")+choices(btn("intro","Read the letter aloud")+btn("intro","Read it carefully")+btn("intro","Show Harry the envelope")),
    ()=>prose("Harry comes into the family room while Petunia watches from the doorway and Vernon keeps one hand on the newspaper. The letter has made the room feel smaller.")+speech("HARRY","Hogwarts is a real school. You’ll learn spells, but you’ll also have ordinary lessons, meals and homework. I can show you the station.")+speech("MAISIE","I don’t remember Mum and Dad. What if I don’t know how to belong there?")+choices(btn("intro","Ask Harry what Hogwarts is like")+btn("intro","Tell Harry you’re nervous")+btn("intro","Ask about the train")),
    ()=>prose("The family makes the trip to Diagon Alley. A narrow shopfront opens into a bright, crowded street. You can smell parchment, wood polish and warm food. Your first stop is the wand shop.")+speech("HARRY","Take your time. The wand is yours, so it should feel right in your hand.")+choices(btn("intro","Go to the wand shop")),
    ()=>prose("The wandmaker places several boxes on the counter. One wand settles into your palm: blackthorn, dragon heartstring, eleven inches, supple.")+speech("WANDMAKER","Breathe first. Raise it gently. Then focus on one point in the room.")+introMini("Find your wand rhythm",["Breathe","Raise wand","Focus"])+choices(btn("intro",s.introProgress===3?"Choose the wand and continue":"Finish the wand practice first")),
    ()=>prose("The wand box is tucked safely away. In the owl shop, a snowy owl turns her head and studies you. You choose the name Nirvana, then gather your books, robes and carrier with Harry.")+speech("HARRY","She picked you too. Let’s get everything on the list before we head home.")+choices(btn("intro","Meet Nirvana and collect the supplies")),
    ()=>prose("That evening, your new school things cover the bed. Harry checks the list while you pack. The letter is folded into the front pocket of your trunk.")+speech("HARRY","Books first, then robes. Put your headphones on top so you can find them on the train.")+introMini("Pack for Hogwarts",["Books","Robes","Headphones"])+choices(btn("intro",s.introProgress===3?"Everything ready · Go to departure day":"Finish packing together")),
    ()=>prose("The next morning, steam drifts over Platform 9¾. Your trunk is beside your feet, Nirvana is secure in her carrier, and Harry checks your ticket.")+speech("HARRY","Ready? We can find a compartment together, or I can show you where the first years sit.")+choices(btn("intro","Board the Hogwarts Express")),
    ()=>prose("The train pulls away from London. Harry introduces you to Ron and Hermione in person. There is room to listen, ask questions or sit quietly while the countryside changes outside.")+speech("HERMIONE","Keep your school list somewhere safe. It makes unpacking much easier.")+choices(btn("intro","Introduce yourself and watch the journey")),
    ()=>prose("At the lake, first-year pupils climb into small boats. The castle rises above the dark water. You keep one hand on the side as the boat carries you towards the lights.")+choices(btn("intro","Step inside Hogwarts")),
    ()=>prose("Your name is called in the Great Hall. You sit beneath the enchanted ceiling while the Sorting Hat considers what you might become.")+speech("SORTING HAT","There is courage here, and plenty still to discover. Gryffindor!")+choices(btn("intro","Join the Gryffindor table")),
    ()=>prose("The common room is warm after the long journey. Your trunk is upstairs, your phone is charging and Nirvana is settled. Tomorrow’s timetable waits beside your bed.")+speech("HARRY","Sleep now. In the morning, you can choose your first small step.")+choices(btn("intro","Sleep · Begin my first day"))
  ];
  return (pages[s.intro]||pages[0])();
}
function phoneConsequences(){
  if(!s.messageEffects.length)return "";
  return `<div class="card2 phone-consequences"><strong>Phone choices carried into this scene</strong>${s.messageEffects.slice(0,3).map(x=>`<p class="small">${esc(x.name)} · ${esc(x.effect)}</p>`).join("")}</div>`;
}
function chapterHTML(){
  const c=E.chapter(s),a=c.activity?E.activities[c.activity]:null;
  let out=`<h1>${esc(c.title)}</h1>${prose(c.text)}${c.person&&c.speech?speech(c.person,c.speech):""}${phoneConsequences()}`;
  if(c.activity&&!c.done){out+=choices(btn("activity",`${esc(a.title)} · Play the mini game`,c.activity)+btn("skipGame","Watch a demonstration · Continue without playing"));}
  else if(c.activity&&c.done){out+=prose("You have completed this part of the day. The result is recorded in your stats.")+choices(btn("storyNext",c.next||"Continue"));}
  else if(c.conversation){out+=choices(btn("storyTalk","Speak kindly","friendly")+btn("storyTalk","Set a clear boundary","boundary")+btn("storyTalk","Carry on quietly","continue"));}
  else if(c.requiresSleep){out+=choices(btn("storySleep","Sleep · Begin tomorrow" )+btn("arcadeMenu","Play a mini game before bed"));}
  else out+=choices(btn("storyNext",c.next||"Continue"));
  return out;
}
function conversationHTML(){
  if(s.storyStep===5){
    return `<h1>A conversation between lessons</h1>${prose("Draco is standing near the courtyard wall. The space between you is yours to decide.")}${speech("DRACO",E.chapter(s).speech)}${phoneConsequences()}${choices(btn("storyTalk","Introduce yourself and speak kindly","friendly")+btn("storyTalk","Ask for some space","boundary")+btn("storyTalk","Nod and carry on","continue"))}`;
  }
  const name=s.person||"Harry";
  return `<h1>Time with ${esc(name)}</h1>${speech(name,"How is your day going? You can tell me about one thing, or we can sit quietly.")}${phoneConsequences()}${choices(btn("talk","Tell them about your day and listen","kind")+btn("talk","Compare lesson notes","class")+btn("talk","Make a teasing joke","tease")+btn("storyNext","Say goodbye for now"))}`;
}
function freeHTML(){
  const intro=["You check the timetable beside your bed. There is room to choose what matters to you today.","Students pass with books tucked under their arms. You have time to decide where to go.","The castle is becoming less overwhelming. One small choice can shape the rest of the day."][s.day%3];
  return `<h1>Day ${s.day} · Your Hogwarts life</h1>${prose(intro)}${s.messageEffects.length?phoneConsequences():""}${choices(Object.entries(E.activities).map(([k,a])=>btn("activity",`${esc(a.title)} <span class="activity-time">${a.time} min</span>`,k)).join("")+btn("sleep","Sleep · End the day"))}<p class="tiny muted">Classes and practice can launch mini games. Meals, rest, friendship and exploring change time, energy and your stats.</p>`;
}
function gameHTML(){
  const g=s.game;if(!g)return prose("There is no active mini game.")+choices(btn("returnStory","Back to story"));
  const defs={wand:{title:"Wand movement",steps:["Swish","Flick","Focus"],help:"Tap Swish → Flick → Focus. Keep the motion controlled."},potion:{title:"Potion sequence",steps:["Low heat","Add nettles","Stir clockwise"],help:"Follow the classroom order: low heat, add nettles, stir clockwise."},owl:{title:"Nirvana’s care",steps:["Water","Food","Quiet"],help:"Water → food → quiet. Give Nirvana a peaceful moment."},flying:{title:"Broom course",steps:["Lean left","Hold steady","Lean right","Land"],help:"Follow the low course: left, steady, right, land."},memory:{title:"Study pairs",steps:[],help:"Reveal two cards and find all four matching pairs."}};
  const d=defs[g.type]||defs.wand;
  let grid="";
  if(g.type==="memory"){
    const cards=["🦉 Owl","🚂 Train","📚 Book","🪄 Wand","🚂 Train","🦉 Owl","🪄 Wand","📚 Book"];
    grid=cards.map((c,i)=>{const show=g.matched.includes(i)||g.flipped.includes(i);return btn("game",show?c:"✦",String(i),`aria-label="${show?c:"Card "+(i+1)}" ${show||g.complete?"disabled":""}`);}).join("");
  }else grid=d.steps.map(x=>btn("game",x,x,g.complete?"disabled":"")).join("");
  const count=g.type==="memory"?`${g.matched.length/2} of 4 pairs`:`${g.progress} of ${d.steps.length} steps`;
  return `${g.arcade?prose("This is an arcade challenge. It is separate from the main story, so it never awards unlearned story magic."):speech(g.type==="potion"?"CLASS INSTRUCTIONS":"PRACTICE",E.activities[g.activity]?.text||"Take your time and follow the steps.")}<div class="story-game"><h2>${d.title} · Mini game</h2><p>${d.help}</p>${g.type==="wand"&&!g.arcade?`<div class="row">${btn("spell","Lumos","Lumos",g.progress||g.complete?"disabled":"")}${btn("spell","Leviosa","Leviosa",g.progress||g.complete?"disabled":"")}</div><p>Practising ${esc(g.spell)}</p>`:""}<div class="game-grid">${grid}</div>${g.type==="memory"&&g.flipped.length===2?btn("game","Turn them back","turn"):""}<p>${count}</p><div role="status" aria-live="polite" class="game-feedback">${esc(g.feedback)}</div>${g.complete?prose(s.outcome):""}</div>${choices(g.complete?btn("continue",g.arcade?"Return to my story":"Continue story") : btn("skipGame",g.arcade?"Back to my story":"Watch instead · Continue without the game"))}`;
}
function reviewHTML(r){return `<div class="story-game"><h2>${r.weekly?"Weekly check-in":"Nightly check-in"} · ${esc(r.date)}</h2><p>${r.activities?.length?r.activities.map(x=>esc(E.activities[x]?.title||x)).join(" · "):"A quiet day. Rest is part of the game too."}</p><p>Level ${1+Math.floor(r.xp/100)} · ${r.xp} XP · Energy before sleep ${r.energy}/100</p><h3>Personality</h3>${Object.entries(r.personality||{}).map(([n,v])=>progress(n,v)).join("")}<h3>Spells</h3>${Object.entries(r.spells||{}).map(([n,v])=>progress(n,v)).join("")}${r.weekly?"<p>Choose next week’s direction through your actions: lessons, friends, exploring or more practice. No fixed route is required.</p>":""}</div>`;}
function content(){
  if(!s.started&&view==="story")return `<h1>A new beginning</h1>${prose("This save starts at the exact moment Hedwig arrives at the Dursleys’ window. The main story is played through physical scenes; your phone is a separate tool whose messages can change what happens later.")}${choices(btn("start","Start fresh · Open the Hogwarts letter")+btn("arcadeMenu","Mini games · Play now"))}${prose("Maisie Potter · age 11 · first year · modern Hogwarts setting. Harry, Ron and Hermione are one year ahead of you.")}`;
  if(view==="arcade")return `<h1>Mini games</h1>${prose("Play any challenge here. Arcade wins are recorded, but they do not advance the story or grant story rewards.")}${choices(btn("arcade","🪄 Wand movement","wand")+btn("arcade","🧪 Potion sequence","potion")+btn("arcade","🧹 Broom course","flying")+btn("arcade","🃏 Matching pairs","memory")+btn("arcade","🦉 Owl care","owl")+btn("returnStory","Back to my story"))}<p class="small muted">Arcade challenges completed: ${s.arcadeWins}</p>`;
  if(view==="stats")return `<div class="story-game">${statsHTML()}</div>${choices(btn("returnStory","Back to story"))}`;
  if(view==="map")return `<h1>Explore</h1>${prose(s.day?"Walk to a place you know, or discover a route by exploring. Time and energy move with you.":"You’ll discover Hogwarts places when you arrive. You can play Mini games while getting ready.")}${choices((s.day?Object.entries(E.locations).filter(([k])=>!["home","alley","platform","train","lake"].includes(k)).map(([k,n])=>btn("travel",esc(n)+(s.discovered.includes(k)?"":" · Discover"),k)).join(""):"")+btn("returnStory","Back to story"))}`;
  if(view==="reviews")return `<h1>Your check-ins</h1>${s.reviews.map(reviewHTML).join("")||prose("Your first nightly check-in appears when you sleep. A weekly review follows every seventh school day.")}${choices(btn("returnStory","Back to story"))}`;
  if(s.paused&&view==="story")return `<h1>Story paused</h1>${prose("Your progress is saved. Nothing advances while you are away.")}${choices(btn("pause","Resume my story"))}`;
  if(s.scene==="letter")return `<div class="chapter-label">${esc(E.introSequence(s).title)}</div>${introHTML()}`;
  if(s.scene==="game")return gameHTML();
  if(s.scene==="review")return reviewHTML(s.reviews[0])+choices(btn("morning","Sleep · Begin the next day"));
  if(s.scene==="chapter")return chapterHTML();
  if(s.scene==="meeting")return `<h1>A plan made by phone</h1>${prose(`Your message has created a chance to meet ${s.flags.meeting.name} in person at ${E.locations[s.flags.meeting.place]}. The decision now belongs in the physical scene.`)}${choices(btn("meeting","Go to the meeting" )+btn("story","Return to the main story"))}`;
  if(s.scene==="conversation")return conversationHTML();
  if(s.scene==="friends")return `<h1>Choose some company</h1>${speech("MAISIE","Who should I spend time with?")}${choices(["Harry","Hermione","Ron","Draco"].map(n=>btn("friend",n,n)).join("")+btn("continue","Have time to myself"))}`;
  if(s.scene==="result")return `<h1>What Maisie does next</h1>${prose(s.outcome||"The moment settles, and you decide what happens next.")}${choices(btn("continue","Continue the story"))}`;
  if(s.scene==="free")return freeHTML();
  return `<h1>Hogwarts</h1>${prose("Your next scene is ready.")}${choices(btn("story","Continue"))}`;
}
function render(){
  if(needsReset){sync(true);needsReset=false;}
  save();sync();hub();
  const changes=s.changes.map(c=>`<div class="change-note"><strong>${esc(c.name)} ${c.amount>0?"+":""}${c.amount}</strong> · ${esc(c.reason)} · Total ${c.total}<progress max="100" value="${c.total%100}" aria-label="${esc(c.name)} change progress"></progress></div>`).join("");
  root.innerHTML=`<div class="chapter-label">${esc(E.date(s))} · ${E.time(s)} · ${esc(E.locations[s.location])}</div>${s.started?`<div class="reader-tools">${btn("statsView","Stats")}${btn("arcadeMenu","Mini games")}${btn("pause",s.paused?"Resume":"Pause")}</div>`:""}${s.reply?`<div class="game-feedback reply-note" role="status">${esc(s.reply)}</div>`:""}${changes?`<details class="changes" open><summary>What changed</summary>${changes}</details>`:""}${content()}${s.started&&view==="story"&&s.scene==="free"&&!s.paused?'<form id="rpgActionForm" class="inputrow"><input id="rpgAction" maxlength="240" placeholder="Try: practise Lumos, talk to Harry…" aria-label="Your action"><button class="send" type="submit">Do</button></form><p class="tiny muted">Typed actions use supported activities and conversations.</p>':""}<p class="story-save">${storageOK?"Progress saved on this device.":"Saving is unavailable. Keep this page open to retain progress."}</p>`;
  const form=root.querySelector("#rpgActionForm");
  if(form)form.addEventListener("submit",e=>{e.preventDefault();const input=root.querySelector("#rpgAction");E.action(s,"text",input.value);render();});
}
function openStory(){document.querySelector('.header [data-screen="rpg"]').click();}
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-campaign]");if(!b||b.disabled)return;
  const action=b.dataset.campaign,value=b.dataset.value;
  if(action==="returnStory"){view="story";openStory();}
  else if(action==="arcadeMenu"){view="arcade";openStory();}
  else if(action==="statsView"){view="stats";openStory();}
  else if(action==="mapView"){view="map";openStory();}
  else if(action==="journalView"){view="reviews";openStory();}
  else{
    E.action(s,action,value);
    if(action==="start")sync(true);
    view="story";
  }
  if(action==="friend"&&value==="Draco"){s.location="courtyard";if(!s.facts.Draco.length)s.facts.Draco=["A second-year Slytherin.","You met in the courtyard."];}
  render();
  if(!["game","introGame","spell"].includes(action))window.scrollTo({top:0,behavior:"smooth"});
});
document.addEventListener("phone-message",e=>{
  const p=e.detail||{};
  const result=E.message(s,p.name,p.text);
  p.result=result;
  s.reply=result.effect||"";
  s.outcome=result.effect;
  render();
});
document.addEventListener("campaign-hub-change",e=>{
  const p=e.detail||{};s.energy=p.energy;s.battery=p.battery;s.minutes=Math.min(1439,p.minutes);
  Object.keys(s.relations).forEach(n=>{if(p.relations?.[n]!=null)s.relations[n]=p.relations[n];});save();hub();
});
document.addEventListener("game-screen",e=>{if(["people","maisie","play"].includes(e.detail.id))setTimeout(hub,0);});
render();
})();
