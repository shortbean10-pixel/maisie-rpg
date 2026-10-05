(()=>{
"use strict";
const E=window.CampaignEngine,key="maisieCampaign09",root=document.querySelector("#rpgContent");
let s=E.fresh(),view="story",storageOK=true,needsReset=true;
try{const old=JSON.parse(localStorage.getItem(key));if(old?.version===9){s={...s,...old};needsReset=false;}}catch{}
if(s.intro<4)s.relations.Nirvana=null;
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const btn=(action,label,value="",extra="")=>`<button class="choice" data-campaign="${action}" data-value="${esc(value)}" ${extra}>${label}</button>`;
const choices=html=>`<div class="story-choices">${html}</div>`;
const prose=t=>`<p class="story-prose">${esc(t)}</p>`;
const speech=(name,t)=>`<div class="dialogue"><strong>${esc(name)}</strong>${esc(t)}</div>`;
const bar=(name,n,reason="")=>`<div class="skill-line"><div class="row space"><strong>${esc(name)}</strong><span>${n}/100${n>=100?" in current band":""}</span></div><progress max="100" value="${n>=100?n%100:n}" aria-label="${esc(name)} progress"></progress><div class="tiny muted">${esc(reason)}</div></div>`;
const progress=(name,n)=>`<div class="skill-line"><div class="row space"><strong>${esc(name)}</strong><span>${E.milestone(n)} · ${n%100}/100</span></div><progress max="100" value="${n%100}" aria-label="${esc(name)} milestone progress"></progress><div class="tiny muted">Total ${n} · Next band at ${(Math.floor(n/100)+1)*100}</div></div>`;
function save(){try{localStorage.setItem(key,JSON.stringify(s));storageOK=true;}catch{storageOK=false;}}
function sync(reset=false){document.dispatchEvent(new CustomEvent("campaign-sync",{detail:{reset,started:s.started,minutes:s.minutes,date:E.date(s),location:E.locations[s.location],energy:s.energy,mood:s.mood>=75?"Hopeful":s.mood>=40?"Steady":"Low",battery:s.battery,contacts:s.day?Object.keys(s.relations).filter(n=>n!=="Nirvana"&&s.facts[n]?.length):["Harry","Mum","Dad","Family"],photo:s.photo,house:s.house,inventory:s.inventory,relations:s.relations,intro:s.intro,spells:Object.keys(s.spells).filter(n=>s.spells[n]>0),post:s.post,tasks:s.day?[
 {id:"lesson",label:"Try a lesson or spell practice",done:s.daily.some(x=>["charms","potions","flying","practice"].includes(x))},
 {id:"friend",label:"Spend time with someone",done:s.daily.includes("friends")},
 {id:"discover",label:"Explore or study",done:s.daily.some(x=>["study","explore"].includes(x))}
 ]:[{id:"letter",label:"Read your Hogwarts letter",done:s.intro>0},{id:"supplies",label:"Get your school supplies",done:s.intro>=4},{id:"arrival",label:"Get to Hogwarts",done:s.day>0}]}}));}
function statsHTML(){return `<h2>My Stats</h2><p class="small muted">Maisie · Age 11 · First year · Human · Half-blood<br>${esc(s.house)} · Level ${1+Math.floor(s.xp/100)} · ${s.xp} XP</p>${bar("Energy",s.energy)}${bar("Mood",s.mood)}${bar("Phone battery",s.battery)}<h3>Skills</h3>${Object.entries(s.skills).map(([n,v])=>progress(n,v)).join("")}<h3>Spells</h3>${Object.entries(s.spells).map(([n,v])=>progress(n,v)).join("")}<p class="small muted">Lumos: ${s.spells.Lumos===0?"Not learned yet":s.spells.Lumos<100?"A first light; building steadiness":"Working towards longer, reliable light"}.<br>Leviosa: ${s.spells.Leviosa===0?"Not learned yet":s.spells.Leviosa<100?"Early lifts; building control":"Working towards consistent control"}.</p><h3>Belongings</h3><p class="small">${s.inventory.map(esc).join(" · ")}</p>${s.inventory.includes("Blackthorn wand")?'<p class="small muted">Blackthorn wand: dragon heartstring, 11 inches, supple.</p>':""}<h3>Journal</h3>${s.history.slice(0,15).map(x=>`<p class="small">Day ${x.day} · ${x.time} — ${esc(x.text)}</p>`).join("")||'<p class="small muted">Your new story starts with the letter.</p>'}`;}
function relationshipsHTML(){return Object.entries(s.relations).map(([name,n])=>`<details class="character-detail"><summary>${esc(name)} <span class="muted">${n===null?"Unknown":n<35?"Uneasy":n>65?"Warm":"Getting to know you"}</span></summary><div class="small muted">Dislike ← Neutral → Like</div><progress max="100" value="${n===null?50:n}" aria-label="${esc(name)} relationship"></progress><p class="small">${n===null?"Feeling unknown":n+"/100"}</p>${(s.facts[name]||[]).map(x=>`<p class="small">${esc(x)}</p>`).join("")||'<p class="small muted">No facts learned yet.</p>'}</details>`).join("");}
function hub(){
 document.querySelector("#campaignHub").innerHTML=`<div class="section-head"><strong>Your RPG</strong><span class="badge">Build 0.9</span></div><p class="small muted">${esc(E.date(s))} · ${E.time(s)} · ${esc(E.locations[s.location])}</p><div class="action-grid">${btn("returnStory","Continue story")}${btn("arcadeMenu","Mini games · Play now")}${btn("statsView","My Stats · Skills and spells")}${btn("mapView","Explore · Places")}${btn("journalView","Nightly and weekly reviews")}</div>`;
 document.querySelector("#campaignStats").innerHTML=statsHTML();
 document.querySelector("#relationshipList").innerHTML=relationshipsHTML();
 document.querySelector("#sceneText").textContent="The Hub keeps your phone, notes, photos, bag and character details. Continue story to play your next scene, or choose Mini games to play a challenge now.";
 document.querySelector("#play .scene-title").textContent=s.day?"Day "+s.day+" at Hogwarts":"Your Hogwarts letter";
}
function introHTML(){
 const intro=[
 ()=>prose("An owl lands outside the window. The envelope in its beak is addressed to you: Maisie Potter.")+speech("HOGWARTS SCHOOL OF WITCHCRAFT AND WIZARDRY","You have a place at Hogwarts. Term begins on 1 September. A school supply list is tucked inside.")+choices(btn("intro","Run to show your family","excited")+btn("intro","Ask Harry what the first day is like","nervous")+btn("intro","Read the letter carefully again","calm")),
 ()=>speech("HARRY","First year. You’ll find your way. We’ll get your stuff before September.")+prose("The letter is yours to keep. Mum checks the supply list, and Dad gets ready for a trip to Diagon Alley.")+choices(btn("intro","Go to Diagon Alley")),
 ()=>prose("The shop bells ring as you step into Diagon Alley. Inside the wand shop, a blackthorn wand waits in its box: dragon heartstring, eleven inches, supple.")+speech("OLLIVANDER","A slow breath. Raise it gently. Then focus.")+introMini("Try the wand",["Breathe","Raise wand","Focus"])+choices(btn("intro",s.introProgress===3?"Choose the wand and continue":"Watch the demonstration and continue")),
 ()=>prose("Warm sparks drift from the wand tip. You tuck its box carefully under your arm. In the owl shop, a snowy owl watches you from a high perch.")+speech("MAISIE","Nirvana. That suits you.")+choices(btn("intro","Meet Nirvana and collect the school supplies")),
 ()=>prose("Back home, your new school things are spread across the bed. Harry leans against the doorway.")+speech("HARRY","books first. then robes. headphones on top for the train. trust me.")+introMini("Pack with Harry",["Books","Robes","Headphones"])+choices(btn("intro",s.introProgress===3?"Everything ready · Go to departure day":"Finish packing together · Go to departure day")),
 ()=>prose("1 September. Steam drifts above Platform 9¾. Your trunk is beside your feet, Nirvana is secure in her carrier, and Harry checks that you have your ticket.")+speech("HARRY","You ready? We can find a compartment together.")+choices(btn("intro","Board the Hogwarts Express")),
 ()=>prose("The train pulls out. Harry points out Ron and Hermione, both in his year. You have a chance to say hello; there is no need to decide what anyone will be to you yet.")+speech("HERMIONE","First year? Keep your school list. It helps when you’re unpacking.")+choices(btn("intro","Introduce yourself, then watch the journey")),
 ()=>prose("At the lake, the first years climb into the little boats. Hogwarts rises beyond the dark water. You keep your hand on the side of the boat as it moves towards the castle.")+choices(btn("intro","Step inside Hogwarts")),
 ()=>prose("Your name is called in the Great Hall. You sit on the stool and pull the Sorting Hat down over your eyes.")+speech("SORTING HAT","There is courage here. Plenty still to discover. Gryffindor!")+choices(btn("intro","Join the Gryffindor table")),
 ()=>prose("The common room is warm after the long journey. Your trunk is upstairs, your phone is charging, and Nirvana is settled. Tomorrow you can begin finding your own way.")+choices(btn("intro","Sleep · Begin my first day"))
 ];return (intro[s.intro]||intro[0])();
}
function introMini(title,steps){return `<div class="story-game"><h2>${title} · Mini game</h2><p>Tap in this order: ${steps.join(" → ")}. No timer. ${s.introProgress}/3 steps complete.</p><div class="game-grid">${[...steps].reverse().map(x=>btn("introGame",x,x,s.introProgress===3?"disabled":"")).join("")}</div></div>`;}
function gameHTML(){const g=s.game;const defs={wand:{title:"Wand movement",steps:["Swish","Flick","Focus"],help:"Tap Swish → Flick → Focus. Keep the motion controlled."},potion:{title:"Potion sequence",steps:["Low heat","Add nettles","Stir clockwise"],help:"Remember the board: Low heat → Add nettles → Stir clockwise. This is a fictional classroom exercise."},owl:{title:"Nirvana’s care",steps:["Water","Food","Quiet"],help:"Water → Food → Quiet. Give Nirvana a peaceful moment."},flying:{title:"Broom course",steps:["Lean left","Hold steady","Lean right","Land"],help:"Follow the low course: Left → Straight → Right → Land."},memory:{title:"Study pairs",help:"Reveal two cards. Find all four pairs. Turn mismatches back before trying again."}};const d=defs[g.type];
 let grid="";
 if(g.type==="memory")grid=["🦉 Owl","🚂 Train","📚 Book","🪄 Wand","🚂 Train","🦉 Owl","🪄 Wand","📚 Book"].map((c,i)=>{const show=g.matched.includes(i)||g.flipped.includes(i);return btn("game",show?c:"✦",String(i),`aria-label="${show?c:"Card "+(i+1)}" ${show||g.complete?"disabled":""}`);}).join("");
 else grid=[...d.steps].reverse().map(x=>btn("game",x,x,g.complete?"disabled":"")).join("");
 return `${g.arcade?prose("Play a challenge here at any time. Arcade games don’t advance the story or give Maisie unlearned magic."):speech(g.type==="potion"?"CLASS INSTRUCTIONS":"PRACTICE",E.activities[g.activity].text)}<div class="story-game"><h2>${d.title} · Mini game</h2><p>${d.help}</p>${g.type==="wand"&&!g.arcade?`<div class="row">${btn("spell","Lumos","Lumos",g.progress||g.complete?"disabled":"")}${btn("spell","Leviosa","Leviosa",g.progress||g.complete?"disabled":"")}</div><p>Practising ${g.spell}</p>`:""}<div class="game-grid">${grid}</div>${g.type==="memory"&&g.flipped.length===2?btn("game","Turn them back","turn"):""}<p>${g.type==="memory"?g.matched.length/2+" of 4 pairs":g.progress+" of "+d.steps.length+" steps"}</p><div role="status" aria-live="polite" class="game-feedback">${esc(g.feedback)}</div>${g.complete?prose(s.outcome):""}</div>${choices(g.complete?btn("continue",g.arcade?"Return to my story":"Continue story →"):btn("skipGame",g.arcade?"Back to my story":"Watch instead · Continue without the game"))}`;
}
function reviewHTML(r){return `<div class="story-game"><h2>${r.weekly?"Weekly check-in":"Nightly check-in"} · ${esc(r.date)}</h2><p>${r.activities.length?r.activities.map(x=>esc(E.activities[x]?.title||x)).join(" · "):"A quiet day. Rest is part of the game too."}</p><p>Level ${1+Math.floor(r.xp/100)} · ${r.xp} XP · Energy before sleep ${r.energy}/100</p>${Object.entries(r.spells).map(([n,v])=>progress(n,v)).join("")}${r.weekly?'<p>Choose next week’s direction through your actions: lessons, friends, exploring or more time practising. No fixed route is required.</p>':""}</div>`;}
function content(){
 if(!s.started&&view==="story")return prose("A new game, from the moment Maisie receives her Hogwarts letter. Your school days will progress through your choices, with classes, friends, spell practice, exploring and mini games.")+choices(btn("start","Start fresh · Open my Hogwarts letter")+btn("arcadeMenu","Mini games · Play now"))+prose("Age 11 · First year · Modern Hogwarts AU. Harry, Ron and Hermione are in their second year. No friendships or mysteries are decided in advance.");
 if(view==="arcade")return '<h1>Mini games</h1>'+prose("Choose one and play now. All challenges are untimed, with retries and a way back to your story.")+choices(btn("arcade","🪄 Wand movement","wand")+btn("arcade","🧪 Potion sequence","potion")+btn("arcade","🧹 Broom course","flying")+btn("arcade","🃏 Matching pairs","memory")+btn("arcade","🦉 Owl care","owl")+btn("returnStory","Back to my story"))+`<p class="small muted">Arcade challenges completed: ${s.arcadeWins}</p>`;
 if(view==="stats")return '<div class="story-game">'+statsHTML()+"</div>"+choices(btn("returnStory","Back to story"));
 if(view==="map")return '<h1>Explore</h1>'+prose(s.day?"Walk to a place you know, or discover a route by exploring. Time and energy move with you.":"You’ll discover Hogwarts places when you arrive. You can play Mini games while getting ready.")+choices(Object.entries(E.locations).filter(([k])=>s.day&&!["home","alley","platform","train","lake","alcove"].includes(k)).map(([k,n])=>btn("travel",esc(n)+(s.discovered.includes(k)?"":" · Discover"),k)).join("")+btn("returnStory","Back to story"));
 if(view==="reviews")return '<h1>Your check-ins</h1>'+(s.reviews.map(reviewHTML).join("")||prose("Your first nightly check-in appears when you sleep. A weekly review follows every seventh school day."))+choices(btn("returnStory","Back to story"));
 if(s.paused)return '<h1>Story paused</h1>'+prose("Your progress is saved. Nothing advances while you’re away.")+choices(btn("pause","Resume my story"));
 if(s.scene==="letter")return '<h1>'+["The letter","Your family","Diagon Alley","Nirvana","Packing night","Departure day","The train","Across the lake","The Sorting","Your first night"][s.intro]+'</h1>'+introHTML();
 if(s.scene==="game")return gameHTML();
 if(s.scene==="review")return reviewHTML(s.reviews[0])+choices(btn("morning","Sleep · Begin the next day →"));
 if(s.scene==="result")return prose(s.outcome)+choices(btn("continue","What do I do next? →"));
 if(s.scene==="friends")return speech("MAISIE","Who should I spend time with?")+choices(["Harry","Hermione","Ron"].map(n=>btn("friend",n,n)).join("")+btn("friend","Talk to Draco in the courtyard","Draco")+btn("continue","Have some time to myself"));
 if(s.scene==="dialogue")return speech(s.person,"How’s your day going?")+choices(btn("talk","Tell them about my day and listen","kind")+btn("talk","Compare lesson notes","class")+btn("talk","Make a teasing joke","tease")+btn("continue","Say goodbye for now"));
 const intro=["You check the small list beside your bed. There is plenty you can try today.","A door closes softly somewhere along the corridor. Your next move is up to you.","Students pass with books tucked under their arms. You have a little time to decide where to go."][s.day%3];
 return '<h1>Day '+s.day+' · Your Hogwarts life</h1>'+prose(intro)+(s.minutes>=1200?speech("MAISIE","It’s getting late. Maybe one quiet thing before bed."):"")+choices(Object.entries(E.activities).filter(([k])=>k!=="practice").map(([k,a])=>btn("activity",esc(a.title)+` <span class="activity-time">${a.time} min</span>`,k)).join("")+btn("activity","🪄 Practise Lumos or Leviosa","practice")+btn("sleep","Sleep · End the day"));
}
function render(){if(needsReset){sync(true);needsReset=false;}save();sync();hub();
 const changes=s.changes.map(c=>`<div class="change-note"><strong>${esc(c.name)} ${c.amount>0?"+":""}${c.amount}</strong> · ${esc(c.reason)} · Total ${c.total}<progress max="100" value="${c.total>=100?c.total%100:c.total}" aria-label="${esc(c.name)} change progress"></progress></div>`).join("");
 root.innerHTML=`<div class="chapter-label">${esc(E.date(s))} · ${E.time(s)} · ${esc(E.locations[s.location])}</div>${s.started?'<div class="reader-tools">'+btn("statsView","Stats")+btn("arcadeMenu","Mini games")+btn("pause",s.paused?"Resume":"Pause")+'</div>':""}${s.reply?`<div class="game-feedback reply-note" role="status">${esc(s.reply)}</div>`:""}${changes?`<details class="changes" open><summary>What changed</summary>${changes}</details>`:""}${content()}${s.started&&view==="story"&&s.scene==="free"&&!s.paused?'<form id="rpgActionForm" class="inputrow"><input id="rpgAction" maxlength="240" placeholder="Try: practise Lumos, talk to Harry…" aria-label="Your action"><button class="send" type="submit">Do</button></form><p class="tiny muted">Typed actions use the game’s supported activities. Characters use written dialogue branches.</p>':""}<p class="story-save">${storageOK?"Progress saved on this device.":"Saving is unavailable. Keep this page open to retain progress."}</p>`;
 const form=root.querySelector("#rpgActionForm");if(form)form.addEventListener("submit",e=>{e.preventDefault();const text=root.querySelector("#rpgAction").value;E.act(s,"text",text);render();});
}
function openStory(){document.querySelector('.header [data-screen="rpg"]').click();}
document.addEventListener("click",e=>{
 const b=e.target.closest("[data-campaign]");if(!b||b.disabled)return;
 const action=b.dataset.campaign,value=b.dataset.value;
 if(action==="returnStory"){view="story";openStory();}
 else if(action==="arcadeMenu"){view="arcade";if(!s.started)s.started=true;openStory();}
 else if(action==="statsView"){view="stats";openStory();}
 else if(action==="mapView"){view="map";openStory();}
 else if(action==="journalView"){view="reviews";openStory();}
 else {if(action==="start")sync(true);E.act(s,action,value);view="story";}
 if(action==="friend"&&value==="Draco"){s.location="courtyard";if(!s.facts.Draco.length)s.facts.Draco=["A second-year Slytherin.","You met in the courtyard."];}
 render();if(!["game","introGame","spell"].includes(action))window.scrollTo({top:0,behavior:"smooth"});
});
document.addEventListener("campaign-hub-change",e=>{
 const p=e.detail;s.energy=p.energy;s.battery=p.battery;
 s.minutes=Math.min(1439,p.minutes);
 Object.keys(s.relations).forEach(n=>{if(p.relations[n]!=null)s.relations[n]=p.relations[n];});
 save();hub();
});
document.addEventListener("game-screen",e=>{if(e.detail.id==="people"||e.detail.id==="maisie"||e.detail.id==="play")setTimeout(hub,0);});
render();
})();
