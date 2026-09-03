const DAYS=['周日','周一','周二','周三','周四','周五','周六'];
const SLOTS=[['08:00','09:40'],['10:00','11:40'],['13:30','15:10'],['15:30','17:10'],['18:30','20:10']];
const colors={coral:'#e77a62',sage:'#759c85',blue:'#7491a8',purple:'#9483ae',gold:'#d5a952'};
const defaultCourses=[
 {id:1,name:'高等数学',day:1,start:'08:00',end:'09:40',location:'教学楼 A203',teacher:'陈老师',color:'coral'},
 {id:2,name:'大学英语',day:1,start:'13:30',end:'15:10',location:'博学楼 305',teacher:'Sarah',color:'blue'},
 {id:3,name:'程序设计基础',day:2,start:'10:00',end:'11:40',location:'实验楼 402',teacher:'李老师',color:'sage'},
 {id:4,name:'线性代数',day:3,start:'08:00',end:'09:40',location:'教学楼 B101',teacher:'王老师',color:'purple'},
 {id:5,name:'体育',day:4,start:'15:30',end:'17:10',location:'东操场',teacher:'周老师',color:'gold'},
 {id:6,name:'大学物理',day:5,start:'10:00',end:'11:40',location:'理科楼 208',teacher:'赵老师',color:'coral'}
];
const future=(days)=>{const d=new Date();d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)};
const defaultTasks=[
 {id:11,title:'完成高数习题册第三章',date:future(2),type:'作业',course:'高等数学',done:false},
 {id:12,title:'准备英语课堂展示',date:future(5),type:'作业',course:'大学英语',done:false},
 {id:13,title:'程序设计期中考试',date:future(12),type:'考试',course:'程序设计基础',done:false}
];
let courses=JSON.parse(localStorage.getItem('shiguang-courses')||'null')||defaultCourses;
let tasks=JSON.parse(localStorage.getItem('shiguang-tasks')||'null')||defaultTasks;
const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
function persist(){localStorage.setItem('shiguang-courses',JSON.stringify(courses));localStorage.setItem('shiguang-tasks',JSON.stringify(tasks));}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}
function dateDiff(date){const a=new Date();a.setHours(0,0,0,0);return Math.ceil((new Date(date+'T00:00:00')-a)/86400000)}
function formatDate(date){const d=new Date(date+'T00:00:00');return `${d.getMonth()+1}月${d.getDate()}日`}
function render(){
 const now=new Date(),day=now.getDay();
 const hour=now.getHours();$('#greeting').textContent=`${hour<11?'早上好':hour<14?'中午好':hour<18?'下午好':'晚上好'}，今天也要加油`;
 $('#dateText').textContent=new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long'}).format(now);
 const today=courses.filter(c=>+c.day===day).sort((a,b)=>a.start.localeCompare(b.start));
 $('#todayCount').textContent=today.length;$('#todayTitle').textContent=`${DAYS[day]}的课程`;
 $('#taskCount').textContent=tasks.filter(t=>!t.done).length;
 const exams=tasks.filter(t=>t.type==='考试'&&!t.done&&dateDiff(t.date)>=0).sort((a,b)=>a.date.localeCompare(b.date));$('#examDays').textContent=exams.length?dateDiff(exams[0].date):'—';
 $('#todayCourses').innerHTML=today.length?today.map(c=>`<div class="course-row" style="--accent:${colors[c.color]}"><time>${c.start}<small>${c.end}</small></time><i class="dot"></i><div><h3>${esc(c.name)}</h3><p>${esc(c.location||'地点待定')} · ${esc(c.teacher||'老师待定')}</p></div><span class="course-tag">${timeState(c,now)}</span></div>`).join(''):'<div class="empty">今天没有课程，给自己一点自由时间吧 ☕</div>';
 renderTasks();renderSchedule();
}
function timeState(c,now){const cur=now.toTimeString().slice(0,5);return cur<c.start?'未开始':cur>c.end?'已结束':'进行中'}
function esc(v=''){const d=document.createElement('div');d.textContent=v;return d.innerHTML}
function taskHTML(t,del=true){const diff=dateDiff(t.date);return `<div class="task-item ${t.done?'done':''}"><input class="task-check" type="checkbox" ${t.done?'checked':''} data-task="${t.id}" aria-label="完成${esc(t.title)}"><div><h3>${esc(t.title)}</h3><p>${esc(t.course||t.type)} · ${diff<0?'已过期':diff===0?'今天截止':diff===1?'明天截止':formatDate(t.date)+'截止'}</p></div>${del?`<button class="delete-btn" data-delete-task="${t.id}" aria-label="删除">×</button>`:`<span class="task-type">${esc(t.type)}</span>`}</div>`}
function renderTasks(){const active=tasks.filter(t=>!t.done).sort((a,b)=>a.date.localeCompare(b.date));$('#taskList').innerHTML=active.length?active.slice(0,4).map(t=>taskHTML(t,false)).join(''):'<div class="empty">待办已清空，做得漂亮！</div>';$('#allTasks').innerHTML=tasks.length?[...tasks].sort((a,b)=>a.done-b.done||a.date.localeCompare(b.date)).map(t=>taskHTML(t,true)).join(''):'<div class="empty">还没有待办事项</div>';$('#activeTaskBadge').textContent=active.length;const deadlines=active.slice(0,5);$('#deadlineList').innerHTML=deadlines.length?deadlines.map(t=>{const d=new Date(t.date+'T00:00:00');return `<div class="deadline"><div class="date-box"><strong>${d.getDate()}</strong><small>${d.getMonth()+1}月</small></div><div><h3>${esc(t.title)}</h3><p>${esc(t.type)} · ${dateDiff(t.date)>=0?'还有 '+dateDiff(t.date)+' 天':'已过期'}</p></div></div>`}).join(''):'<div class="empty">近期没有截止事项</div>'}
function renderSchedule(){let html='<div class="grid-cell grid-head"></div>';for(let d=1;d<=7;d++)html+=`<div class="grid-cell grid-head">${DAYS[d%7]}</div>`;SLOTS.forEach(slot=>{html+=`<div class="grid-cell time-label">${slot[0]}<br>—<br>${slot[1]}</div>`;for(let d=1;d<=7;d++){const course=courses.find(c=>+c.day===d%7&&c.start>=slot[0]&&c.start<slot[1]);html+=`<div class="grid-cell">${course?`<div class="course-block" style="--accent:${colors[course.color]}"><button class="remove" data-delete-course="${course.id}" aria-label="删除课程">×</button><h3>${esc(course.name)}</h3><p>${course.start}–${course.end}</p><p>${esc(course.location||'地点待定')}</p></div>`:''}</div>`}});$('#scheduleGrid').innerHTML=html}
function showView(id){$$('.view').forEach(v=>v.classList.toggle('active',v.id===id));$$('.nav-item').forEach(n=>n.classList.toggle('active',n.dataset.view===id));window.scrollTo({top:0,behavior:'smooth'})}
$$('.nav-item').forEach(n=>n.onclick=()=>showView(n.dataset.view));$$('[data-go]').forEach(b=>b.onclick=()=>showView(b.dataset.go));
['#addCourseBtn','#addCourseBtn2'].forEach(s=>$(s).onclick=()=>$('#courseDialog').showModal());
['#quickTaskBtn','#addTaskBtn'].forEach(s=>$(s).onclick=()=>{const date=new Date();date.setDate(date.getDate()+1);$('#taskForm [name=date]').value=date.toISOString().slice(0,10);$('#taskDialog').showModal()});
$('#saveCourse').onclick=e=>{e.preventDefault();const f=$('#courseForm');if(!f.reportValidity())return;const data=Object.fromEntries(new FormData(f));if(data.end<=data.start){toast('结束时间要晚于开始时间');return}courses.push({...data,id:Date.now(),day:+data.day});persist();f.reset();$('#courseDialog').close();render();toast('课程已加入课表')};
$('#saveTask').onclick=e=>{e.preventDefault();const f=$('#taskForm');if(!f.reportValidity())return;tasks.push({...Object.fromEntries(new FormData(f)),id:Date.now(),done:false});persist();f.reset();$('#taskDialog').close();render();toast('待办已加入清单')};
document.addEventListener('click',e=>{const tid=e.target.dataset.task,del=e.target.dataset.deleteTask,cid=e.target.dataset.deleteCourse;if(tid){const t=tasks.find(x=>x.id==tid);t.done=!t.done;persist();render()}if(del){tasks=tasks.filter(x=>x.id!=del);persist();render();toast('待办已删除')}if(cid){courses=courses.filter(x=>x.id!=cid);persist();render();toast('课程已删除')}});
$('#clearCourses').onclick=()=>{if(confirm('确定清空全部课程吗？')){courses=[];persist();render();toast('课表已清空')}};
render();
