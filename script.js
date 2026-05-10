let currentPage = 'landing';
let currentStep = 1;
let selectedSession = 'Quick Vent — 25 min';
let selectedPrice = '₹199';
let selectedListener = 'Auto-matched';
let selectedSlot = '12:00 PM';

function showPage(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const map = {
    'landing':'page-landing','booking':'page-booking','confirm':'page-confirm',
    'user-dash':'page-user-dash','listener-dash':'page-listener-dash','admin-dash':'page-admin-dash'
  };
  const el = document.getElementById(map[page]||'page-landing');
  if(el){el.classList.add('active');window.scrollTo(0,0);}
  currentPage = page;
  if(page==='booking'){currentStep=1;updateStep(1);}
  if(page==='listener-dash')buildSchedule();
  if(page==='user-dash')buildMoodBars();
}

function setRole(role,btn){
  document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(role==='listener')showPage('listener-dash');
  else if(role==='admin')showPage('admin-dash');
  else showPage('user-dash');
}

function scrollToHow(){
  const el = document.getElementById('how-section');
  if(el) el.scrollIntoView({behavior:'smooth'});
}

function toggleFaq(el){
  const item = el.closest('.faq-item');
  item.classList.toggle('open');
}

function selectMood(el){
  document.querySelectorAll('.mood-dot').forEach(d=>d.classList.remove('selected'));
  el.classList.add('selected');
}

function nextStep(step){
  document.querySelectorAll('.booking-step').forEach(s=>s.classList.remove('active'));
  document.getElementById('bstep'+step).classList.add('active');
  updateStep(step);
  currentStep = step;
  updateSummary();
}

function updateStep(step){
  for(let i=1;i<=4;i++){
    const dot = document.getElementById('pd'+i);
    if(!dot) continue;
    dot.classList.remove('active','done');
    if(i<step) dot.classList.add('done');
    else if(i===step) dot.classList.add('active');
  }
  for(let i=1;i<=3;i++){
    const line = document.getElementById('pl'+i);
    if(!line) continue;
    line.classList.toggle('done',i<step);
  }
}

function selectST(id,name,price){
  document.querySelectorAll('#bstep1 .listener-option').forEach(o=>o.classList.remove('selected'));
  document.getElementById(id).classList.add('selected');
  selectedSession = name; selectedPrice = price;
}

function selectSlot(el,time){
  document.querySelectorAll('.slot').forEach(s=>s.classList.remove('selected'));
  el.classList.add('selected'); selectedSlot = time;
}

function selectListener(id,name){
  document.querySelectorAll('#bstep3 .listener-option').forEach(o=>o.classList.remove('selected'));
  document.getElementById(id).classList.add('selected');
  selectedListener = name==='Match me automatically'?'Auto-matched':name;
}

function updateSummary(){
  const ss = document.getElementById('sum-session');
  const sl = document.getElementById('sum-listener');
  const sp = document.getElementById('sum-price');
  if(ss) ss.textContent = selectedSession;
  if(sl) sl.textContent = selectedListener;
  if(sp){
    const base = parseInt(selectedPrice.replace('₹',''));
    sp.textContent = '₹'+(base+19);
  }
}

function switchDashTab(tab,el){
  document.querySelectorAll('#page-user-dash .dash-nav-item').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  ['overview','sessions','journal','reflections','resources','settings'].forEach(t=>{
    const el2=document.getElementById('dtab-'+t);
    if(el2) el2.style.display = t===tab?'block':'none';
  });
}

function switchAdminTab(tab,el){
  document.querySelectorAll('#page-admin-dash .dash-nav-item').forEach(n=>n.classList.remove('active'));
  if(el) el.classList.add('active');
  ['overview','users','listeners','reports','payments','safety'].forEach(t=>{
    const el2=document.getElementById('atab-'+t);
    if(el2) el2.style.display = t===tab?'block':'none';
  });
}

function buildMoodBars(){
  const days=['M','T','W','T','F','S','S'];
  const moods=[55,70,45,80,60,75,68];
  const container=document.getElementById('mood-bars');
  if(!container||container.children.length) return;
  days.forEach((d,i)=>{
    const wrap=document.createElement('div');
    wrap.className='mc-bar-wrap';
    const bar=document.createElement('div');
    bar.className='mc-bar';
    bar.style.height=moods[i]+'%';
    bar.style.background=i===5?'var(--accent)':'var(--accent-light)';
    const label=document.createElement('div');
    label.className='mc-day'; label.textContent=d;
    wrap.appendChild(bar); wrap.appendChild(label);
    container.appendChild(wrap);
  });
}

function buildSchedule(){
  const grid=document.getElementById('sched-grid');
  if(!grid||grid.children.length) return;
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const dates=[5,6,7,8,9,10,11];
  const hasSessions=[false,false,true,false,false,true,true];
  days.forEach((d,i)=>{
    const div=document.createElement('div');
    div.className='sched-day'+(i===5?' active':'');
    div.innerHTML=`<div class="sched-day-name">${d}</div><div class="sched-date">${dates[i]}</div>${hasSessions[i]?`<div class="sched-dot"></div>`:''}`;
    div.onclick=()=>{document.querySelectorAll('.sched-day').forEach(x=>x.classList.remove('active'));div.classList.add('active');}
    grid.appendChild(div);
  });
}

buildMoodBars();
