(()=>{
"use strict";
const copy=x=>JSON.parse(JSON.stringify(x)),cap=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
const locations={home:"Potter home",alley:"Diagon Alley",platform:"Platform 9¾",train:"Hogwarts Express",lake:"Black Lake",common:"Gryffindor common room",hall:"Great Hall",library:"Library",courtyard:"Courtyard",owlery:"Owlery",charms:"Charms classroom",potions:"Potions classroom",grounds:"Flying grounds",alcove:"Upstairs alcove"};
const activities={
 charms:{title:"Charms lesson",place:"charms",time:50,energy:9,skill:"Charms",game:"wand",text:"A feather waits on your desk. Flitwick asks you to concentrate on the movement before trying the spell."},
 potions:{title:"Potions lesson",place:"potions",time:50,energy:9,skill:"Potions",game:"potion",text:"The instructions are on the board. Keep your cauldron steady and follow each step in order."},
 flying:{title:"Flying practice",place:"grounds",time:40,energy:12,skill:"Flying",game:"flying",text:"Madam Hooch sets out a low practice course. This is about control, not height."},
 study:{title:"Study in the library",place:"library",time:30,energy:6,skill:"Knowledge",game:"memory",text:"You open your first-year notes. Matching the symbols might help the next lesson stick."},
 explore:{title:"Explore the castle",place:"courtyard",time:25,energy:5,skill:"Exploration",text:"You follow a quieter staircase and find a route back to the courtyard. One less way to get lost."},
 owl:{title:"Visit Nirvana",place:"owlery",time:20,energy:3,skill:"Care",game:"owl",text:"Nirvana turns towards your footsteps. Fresh water, food, then a quiet moment together."},
 friends:{title:"Spend time with someone",place:"common",time:20,energy:3,skill:"Confidence",text:"The common room has a few spare seats. You can decide who to talk to."},
 meal:{title:"Eat in the Great Hall",place:"hall",time:25,energy:-18,text:"You find a seat and get something to eat. The castle sounds a little less overwhelming afterwards."},
 rest:{title:"Take a quiet break",place:"common",time:20,energy:-16,text:"You settle into an armchair. Nothing needs to happen for a few minutes."},
 practice:{title:"Practise a spell",place:"charms",time:20,energy:7,skill:"Charms",game:"wand",text:"You choose a clear space and a small practice object. Focus first; the spell can follow."}
};
const people={Harry:["Your older brother.","Second-year Gryffindor."],Draco:["A second-year Slytherin."],Hermione:["A second-year Gryffindor.","Often studies in the library."],Ron:["A second-year Gryffindor.","Knows Harry."],Mum:["Your mum."],Dad:["Your dad."],Nirvana:["Your snowy owl."]};
function fresh(){return {version:9,started:false,day:0,minutes:600,location:"home",scene:"letter",energy:72,mood:80,battery:84,xp:0,house:"Not sorted yet",skills:{Charms:0,Potions:0,Flying:0,Knowledge:0,Exploration:0,Care:0,Confidence:0},spells:{Lumos:0,Leviosa:0},relations:{Harry:78,Mum:94,Dad:92,Nirvana:88,Draco:null,Hermione:null,Ron:null},facts:{Harry:copy(people.Harry),Mum:["Your mum."],Dad:["Your dad."],Nirvana:[],Draco:[],Hermione:[],Ron:[]},discovered:["home"],history:[],changes:[],daily:[],reviews:[],game:null,photo:false,unknown:"No unresolved messages in this new game.",outcome:"",reply:"",post:null,intro:0,introProgress:0,arcadeWins:0,inventory:["iPhone","Headphones","Blue hoodie"],visits:{},paused:false};}
function date(s){if(s.day===0)return s.intro<5?"31 July":"1 September";const d=new Date(Date.UTC(2000,8,1));d.setUTCDate(d.getUTCDate()+s.day-1);return ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][(s.day-1)%7]+" "+d.getUTCDate()+" "+["January","February","March","April","May","June","July","August","September","October","November","December"][d.getUTCMonth()];}
function time(s){return String(Math.floor(s.minutes/60)%24).padStart(2,"0")+":"+String(s.minutes%60).padStart(2,"0");}
function milestone(n){return ["Beginner","Developing","Steady","Skilled","Practised"][Math.min(4,Math.floor(n/100))];}
function change(s,name,before,after,reason){if(before!==after)s.changes.push({name,amount:after-before,total:after,reason});}
function stat(s,name,amount,reason){const before=s[name];s[name]=cap(before+amount);change(s,name,before,s[name],reason);}
function gain(s,name,amount,reason){const before=s.skills[name]||0;s.skills[name]=before+amount;change(s,name,before,s.skills[name],reason);s.xp+=amount;}
function spell(s,name,amount){const before=s.spells[name]||0;s.spells[name]=before+amount;change(s,name,before,s.spells[name],"Spell practice");}
function relate(s,name,amount,reason){const before=s.relations[name];s.relations[name]=cap((before===null?50:before)+amount);change(s,name,before===null?50:before,s.relations[name],reason);}
function log(s,text){s.history.unshift({day:s.day,time:time(s),text});s.history=s.history.slice(0,120);}
function move(s,id){if(!locations[id])return;s.location=id;if(!s.discovered.includes(id)){s.discovered.push(id);gain(s,"Exploration",5,"Discovered "+locations[id]);}}
function beginGame(s,type,activity,spellName="Leviosa"){
 s.game={type,activity,spell:spellName,progress:0,selected:[],matched:[],flipped:[],attempts:0,complete:false,feedback:"",rewarded:false};
 s.scene="game";
}
function finishGame(s){const g=s.game;if(g.rewarded)return;g.complete=true;g.rewarded=true;
 if(g.arcade){s.arcadeWins++;s.outcome="Challenge complete! Your school-day progress hasn’t moved.";return;}
 const a=activities[g.activity];gain(s,a.skill,12,"Completed "+a.title.toLowerCase());
 if(g.type==="wand")spell(s,g.spell,8);
 if(g.type==="owl")relate(s,"Nirvana",2,"Cared for Nirvana");
 s.outcome={wand:g.spell==="Lumos"?"A small light holds at your wand tip. You let it fade before your focus slips.":"The feather rises and stays almost still. Keeping it steady still takes concentration.",potion:"The mixture settles to the colour in the instructions. Careful work pays off.",flying:"You finish the low course and land safely. Your turns feel a little smoother.",memory:"The last pair clicks into place. Your notes make a little more sense.",owl:"Nirvana settles beside you with a soft hoot."}[g.type];log(s,s.outcome);
}
function chooseGame(s,value){const g=s.game;if(!g||g.complete)return;g.feedback="";
 const sequences={wand:["Swish","Flick","Focus"],potion:["Low heat","Add nettles","Stir clockwise"],owl:["Water","Food","Quiet"],flying:["Lean left","Hold steady","Lean right","Land"]};
 if(g.type==="memory"){
  const cards=["Owl","Train","Book","Wand","Train","Owl","Wand","Book"],i=Number(value);
  if(value==="turn"){g.flipped=[];return;}
  if(!Number.isInteger(i)||i<0||i>7||g.matched.includes(i)||g.flipped.includes(i))return;
  if(g.flipped.length===2){g.feedback="Turn the two cards back first.";return;}
  g.flipped.push(i);
  if(g.flipped.length===2&&cards[g.flipped[0]]===cards[g.flipped[1]]){g.matched.push(...g.flipped);g.flipped=[];g.feedback="A match!";}
  if(g.matched.length===8)finishGame(s);return;
 }
 const sequence=sequences[g.type];if(value===sequence[g.progress]){g.progress++;g.feedback="That’s it. "+g.progress+" of "+sequence.length+" steps.";}
 else{g.progress=0;g.attempts++;g.feedback="Try again from the first step. No progress or energy lost.";}
 if(g.progress===sequence.length)finishGame(s);
}
function act(s,id,value){
 s.changes=[];s.reply="";if(s.paused&&id!=="pause")return;
 if(id==="arcade"){
  if(!["wand","potion","flying","memory","owl"].includes(value))return;
  const previous=s.scene;beginGame(s,value,{wand:"practice",potion:"potions",flying:"flying",memory:"study",owl:"owl"}[value]);s.game.arcade=true;s.game.returnScene=previous;return;
 }
 if(id==="introGame"){
  const seq=s.intro===2?["Breathe","Raise wand","Focus"]:s.intro===4?["Books","Robes","Headphones"]:null;
  if(!seq)return;
  if(value===seq[s.introProgress]){s.introProgress++;s.reply=s.introProgress===3?"All three steps done. Ready to move on.":"Good. Next step.";}else{s.introProgress=0;s.reply="Start again from the first step.";}return;
 }
 if(id==="start"){s.started=true;s.scene="letter";return;}
 if(id==="pause"){s.paused=!s.paused;return;}
 if(id==="intro"){
  if(s.scene!=="letter")return;
  s.intro++;s.introProgress=0;
  s.reply={excited:"You read it twice, then race to find your family. Harry looks up with a grin. ‘Told you it would come.’",nervous:"You hold the letter carefully. Harry waits while you read. ‘You don’t have to know everything yet.’",calm:"You fold the letter and set it beside you. Hogwarts is real now. There is a lot to get ready."}[value]||"";
  if(s.intro===2){move(s,"alley");s.minutes=660;}
  if(s.intro===3){s.inventory.push("Blackthorn wand");gain(s,"Confidence",5,"Found your wand");}
  if(s.intro===4){s.inventory.push("Nirvana’s carrier","First-year school books","Hogwarts robes");s.facts.Nirvana=["Your snowy owl.","Her name is Nirvana."];relate(s,"Nirvana",1,"Met Nirvana");}
  if(s.intro===5){move(s,"platform");s.minutes=630;}
  if(s.intro===6){move(s,"train");s.minutes=660;s.facts.Ron=copy(people.Ron);s.facts.Hermione=copy(people.Hermione);}
  if(s.intro===7){move(s,"lake");s.minutes=1110;}
  if(s.intro===8){move(s,"hall");s.minutes=1140;}
  if(s.intro===9){s.house="Gryffindor";move(s,"common");s.minutes=1260;}
  if(s.intro===10){s.day=2;s.minutes=480;s.scene="free";s.reply="Your first morning at Hogwarts. The day is yours to play.";}
  log(s,"Moved on: "+["Letter","Family","Diagon Alley","Wand","Nirvana","Platform","Train","Lake","Sorting","Common room","First morning"][s.intro]);return;
 }
 if(id==="arrival"){
  s.reply={greet:"‘Here!’ you call. Harry appears at the doorway. Draco sits up, leaving you room to decide what to do next.",leave:"You put your phone away and get up. ‘Coming.’ Harry waits outside while you gather your things.",stay:"‘Give me a minute,’ you tell Harry. He nods towards the corridor. Draco returns your phone without another comment."}[value];s.minutes+=3;s.scene="free";log(s,s.reply);return;
 }
 if(id==="activity"){
  const a=activities[value];if(!a||s.day===0)return;
  if(s.energy<Math.max(0,a.energy)){s.reply="You’re too tired for that right now. Eat, rest or sleep first.";return;}
  if(s.minutes+a.time>1260&&a.energy>0){s.reply="It’s late. You can rest in the common room or go to bed; lessons can wait for tomorrow.";return;}
  if(["charms","potions","flying"].includes(value)&&s.daily.includes(value)){s.reply="You’ve done that lesson today. Try spell practice, a break or another activity.";return;}
  if(["charms","potions","flying"].includes(value)&&(s.day-1)%7>=5){s.reply="It’s the weekend. Try personal practice, exploring or time with friends.";return;}
  move(s,a.place);s.minutes=Math.min(1439,s.minutes+a.time);stat(s,"energy",-a.energy,a.title);if(!s.daily.includes(value))s.daily.push(value);
  s.outcome=a.text;s.visits[value]=(s.visits[value]||0)+1;
  if(a.game){beginGame(s,a.game,value);return;}
  if(a.skill)gain(s,a.skill,5,a.title);
  if(value==="friends")s.scene="friends";
  else{s.scene="result";log(s,a.text);}
  return;
 }
 if(id==="spell"){if(value in s.spells&&s.game?.type==="wand"&&!s.game.progress&&!s.game.complete)s.game.spell=value;return;}
 if(id==="game"){chooseGame(s,value);return;}
 if(id==="skipGame"){if(s.game?.arcade){s.scene=s.game.returnScene;s.game=null;return;}s.outcome="You watch the demonstration and keep the steps in mind for next time.";s.game=null;s.scene="result";log(s,s.outcome);return;}
 if(id==="continue"){s.scene=s.game?.arcade?s.game.returnScene:"free";s.game=null;return;}
 if(id==="friend"){
  if(!Object.hasOwn(s.relations,value))return;
  if(!s.facts[value]?.length)s.facts[value]=copy(people[value]);
  s.person=value;s.scene="dialogue";return;
 }
 if(id==="talk"){
  const name=s.person||"Harry";
  if(value==="kind"){relate(s,name,2,"Listened to "+name);gain(s,"Confidence",3,"A conversation");s.outcome=name+" listens while you talk about the day. The conversation feels a little easier.";
   if(!s.facts[name].includes("You have shared a conversation about your school day."))s.facts[name].push("You have shared a conversation about your school day.");}
  if(value==="tease"){relate(s,name,-1,"A joke landed awkwardly");s.outcome="The joke lands awkwardly. You change the subject and give "+name+" some space.";}
  if(value==="class"){gain(s,"Knowledge",4,"Compared lesson notes");s.outcome="You compare the parts of the lesson you found difficult. One small tip gives you something to try next time.";}
  s.minutes=Math.min(1439,s.minutes+10);s.scene="result";log(s,s.outcome);return;
 }
 if(id==="travel"){if(!locations[value]||s.day===0)return;move(s,value);s.minutes=Math.min(1439,s.minutes+10);stat(s,"energy",-2,"Walked to "+locations[value]);s.scene="free";s.reply="You arrive at "+locations[value]+".";return;}
 if(id==="sleep"){
  if(s.day===0){s.reply="Finish getting to Hogwarts first.";return;}
  const review={day:s.day,date:date(s),xp:s.xp,energy:s.energy,skills:copy(s.skills),spells:copy(s.spells),activities:[...s.daily],weekly:s.day%7===0};
  s.reviews.unshift(review);s.reviews=s.reviews.slice(0,30);s.scene="review";return;
 }
 if(id==="morning"){
  s.day++;s.minutes=480;s.daily=[];s.location="common";stat(s,"energy",100-s.energy,"A full night’s sleep");stat(s,"battery",100-s.battery,"Charged overnight");stat(s,"mood",3,"Fresh morning");s.scene="free";s.reply="A new day begins. Choose your first activity.";log(s,"Started "+date(s));return;
 }
 if(id==="post"){
  s.post={id:"post-"+Date.now(),text:String(value).slice(0,180)};s.outcome="Your status is saved to the in-game Social feed.";s.scene="result";log(s,"Posted: "+s.post.text);return;
 }
 if(id==="text"){
  const text=String(value).trim().slice(0,240),t=text.toLowerCase();if(!text)return;
  if(/^(sleep|go to bed|end (the )?day)/.test(t))return act(s,"sleep");
  if(/^(rest|relax|take a break)/.test(t))return act(s,"activity","rest");
  if(/^(eat|breakfast|lunch|dinner)/.test(t))return act(s,"activity","meal");
  if(/^(study|read|homework)/.test(t))return act(s,"activity","study");
  if(/^(explore|walk around)/.test(t))return act(s,"activity","explore");
  if(/^(visit|feed|care for).*nirvana/.test(t))return act(s,"activity","owl");
  if(/^(cast|practi[sc]e).*\b(lumos|leviosa|spell)\b/.test(t)){act(s,"activity","practice");if(s.game)s.game.spell=/lumos/.test(t)?"Lumos":"Leviosa";return;}
  const course=Object.keys(activities).find(a=>["charms","potions","flying"].includes(a)&&t.includes(a));if(course)return act(s,"activity",course);
  const person=Object.keys(s.relations).find(n=>t.includes(n.toLowerCase()));
  if(person&&/^(talk|chat|sit|meet)/.test(t)){act(s,"activity","friends");if(s.scene==="friends")act(s,"friend",person);return;}
  const place=Object.keys(locations).find(k=>t.includes(locations[k].toLowerCase()));if(place&&/^(go|walk|visit|head)/.test(t))return act(s,"travel",place);
  if(/^post\s+/.test(t))return act(s,"post",text.replace(/^post\s+/i,""));
  if(s.scene==="arrival"&&/^(hi|hello|here|coming|leave)/.test(t))return act(s,"arrival",/leave|coming/.test(t)?"leave":"greet");
  s.reply="I haven’t turned that into a game action. Try ‘practise Lumos’, ‘go to the library’, ‘talk to Harry’, ‘eat’, ‘sleep’, or pick an option below. Nothing changed.";
 }
}
const api={fresh,act,date,time,milestone,locations,activities,people,copy};
if(typeof module!=="undefined"&&module.exports)module.exports=api;else window.CampaignEngine=api;
})();
