/* تحكم التطبيق: إدخال البيانات، الربط بالطلاب، الحفظ المحلي، تصدير الصورة. */
(() => {
  'use strict';
  let templateId='classic';let groups=window.REPORT_TEMPLATES[templateId].groups;const renderer=window.ReportRenderer;
  const $=id=>document.getElementById(id);
  let all=[];
  let storagePrefix='fatima-hoffaz-v2:classic:';
  const statuses=[['','— اختر —'],['100','100%'],['50','50%'],['X','X'],['0','0%'],['absent','غائب'],['blocked','-']];
  let records={};let currentDate='';let renderVersion=0;let busy=false;
  const norm=s=>String(s||'').replace(/[\u064B-\u065F\u0670ـ]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/\s+/g,'').trim();
  let index=new Map();function rebuildIndex(){all=groups.flatMap(g=>g.students);index=new Map();all.forEach(s=>[s.name,...(s.aliases||[])].forEach(a=>index.set(norm(a),s)));}rebuildIndex();
  function findStudent(s){return index.get(norm(s))||null}
  const defaultRecord=()=>({rec:'',eval:'',done:''});
  function get(student){return records[student.id]||(records[student.id]=defaultRecord())}
  function notify(message,error=false){$('notice').textContent=message;$('notice').style.color=error?'#a12626':'#28614c'}
  function store(){try{localStorage.setItem(storagePrefix+currentDate,JSON.stringify(records));localStorage.setItem(storagePrefix+'lastDate',currentDate)}catch(e){notify('تعذر الحفظ التلقائي في هذا المتصفح.',true)}}
  function load(date){currentDate=date;try{records=JSON.parse(localStorage.getItem(storagePrefix+date)||'{}')||{}}catch(e){records={}}}
  function update(student,field,value){get(student)[field]=value;store();draw()}
  function renderEditors(){const target=$('editors');target.replaceChildren();for(const group of groups){const box=document.createElement('section');box.className='group-editor';const heading=document.createElement('h3');heading.textContent=group.title;box.append(heading);
    const headings=document.createElement('div');headings.className='editor-head';['الاسم','التسميع','التقييم','الإنجاز'].forEach(t=>{const el=document.createElement('span');el.textContent=t;headings.append(el)});box.append(headings);
    for(const student of group.students){const row=document.createElement('div');row.className='editrow';let name;if(window.REPORT_TEMPLATES[templateId].editableNames){name=document.createElement('input');name.className='name-input';name.type='text';name.value=student.name;name.setAttribute('aria-label','اسم الطالب');name.addEventListener('change',()=>{student.name=name.value.trim()||student.name;saveNames();rebuildIndex();draw();});}else{name=document.createElement('span');name.className='student-name';name.textContent=student.name;}
      let rec=document.createElement('input');rec.type='text';rec.placeholder='السورة / المقطع';rec.value=get(student).rec||'';rec.addEventListener('input',()=>update(student,'rec',rec.value));
      let ev=document.createElement('input');ev.type='text';ev.placeholder='التقييم';ev.value=get(student).eval||'';ev.addEventListener('input',()=>update(student,'eval',ev.value));
      let done=document.createElement('select');statuses.forEach(([value,text])=>done.add(new Option(text,value)));done.value=get(student).done||'';done.addEventListener('change',()=>update(student,'done',done.value));row.append(name,rec,ev,done);box.append(row)}target.append(box)}
  }
  function draw(){const version=++renderVersion;renderer.render(currentDate,groups,records,templateId).catch(err=>{if(version===renderVersion)notify('تعذر عرض التقرير: '+err.message,true)})}
  const evaluations=['ممتاز','جيد','جيد جدا','جيد جدًا','مقبول','رائع','بحاجة مراجعة','بحاجة إلى مراجعة'];
  const statusFromValue=v=>/مفصول|محروم|انحرم/.test(v)?'blocked':/غائب/.test(v)?'absent':/لم يسمع|لم يسمّع/.test(v)?'X':null;
  function isNumber(s){return /^\d+(?:[.,]\d+)?$/.test(s.trim())}
  function isDateOrDay(s){return /^\d{1,4}\s*[\/\-]\s*\d{1,2}(?:\s*[\/\-]\s*\d{1,4})?$/.test(s)||/^(السبت|الأحد|الاحد|الإثنين|الاثنين|الثلاثاء|الاربعاء|الأربعاء|الخميس|الجمعة)$/.test(s)}
  function importPaste(){const raw=$('paste').value.trim();if(!raw){notify('الصق بيانات Google Sheets أولًا.',true);return}
    const lines=raw.split(/\r?\n/).map(l=>l.split('\t').map(s=>s.trim())).filter(r=>r.some(Boolean));
    const seen=new Set();let count=0;let duplicates=0;
    for(const row of lines){let student=null;let nameIndex=-1;for(let i=0;i<row.length;i++){const found=findStudent(row[i]);if(found){student=found;nameIndex=i;break}}if(!student)continue;if(seen.has(student.id)){duplicates++;continue}seen.add(student.id);
      const values=row.filter((_,i)=>i!==nameIndex);
      // أسماء الأعمدة والتواريخ والأرقام لا تُحسب تسميعًا.
      let rec=values.find(v=>v && !isNumber(v) && !isDateOrDay(v) && !evaluations.includes(v) && !/^(الاسم|التقييم|السورة|عدد الصفحات|الصفحات)$/.test(v))||'';
      let evaluation=values.find(v=>evaluations.includes(v))||'';
      let r=get(student);r.rec=rec;r.eval=evaluation;
      const detected=statusFromValue(rec);if(detected)r.done=detected;
      // قيم 100/50/X التي حددتها يدويًا لا تُمسح عند استيراد بيانات أخرى.
      count++;
    }
    store();renderEditors();draw();notify(`تم استيراد ${count} طالبًا من القالب.${duplicates?' وتجاهل '+duplicates+' صف مكرر.':''} راجع التسميع وحدّد الإنجاز يدويًا.`)
  }
  function dateChanged(){load($('date').value);renderEditors();draw();notify('تم تحميل بيانات التاريخ المحدد إن كانت محفوظة على الجهاز.')}
  function reset(){if(!confirm('هل تريد تفريغ بيانات هذا اليوم فقط؟'))return;records={};store();renderEditors();draw();notify('تم تفريغ بيانات هذا اليوم.')}
  async function imageBlob(){await renderer.render(currentDate,groups,records,templateId);return renderer.toBlob()}
  function filename(){return `إنجاز-التسميع-${templateId}-${currentDate||'بدون-تاريخ'}.png`}
  async function withBusy(fn){if(busy)return;busy=true;const buttons=[$('download'),$('share')];buttons.forEach(b=>b.disabled=true);try{await fn()}catch(e){console.error(e);notify('تعذّر تجهيز الصورة: '+e.message,true)}finally{busy=false;buttons.forEach(b=>b.disabled=false)}}
  function saveBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
  async function download(){await withBusy(async()=>{notify('جارٍ إنشاء PNG...');const blob=await imageBlob();saveBlob(blob,filename());notify('تم تجهيز الصورة؛ تحقّق من التنزيلات.')})}
  async function share(){await withBusy(async()=>{notify('جارٍ إنشاء الصورة للمشاركة...');const blob=await imageBlob();const file=new File([blob],filename(),{type:'image/png'});
    if(navigator.canShare && navigator.canShare({files:[file]})){await navigator.share({files:[file],title:'إنجاز التسميع اليومي'});notify('تم فتح المشاركة.')}
    else{saveBlob(blob,filename());notify('المشاركة المباشرة غير متاحة؛ تم تجهيز تنزيل PNG بدلًا منها.')}
  })}
  function saveNames(){if(!window.REPORT_TEMPLATES[templateId].editableNames)return;try{localStorage.setItem('fatima-hoffaz:names:'+templateId,JSON.stringify(all.map(s=>s.name)))}catch(e){notify('تعذر حفظ الأسماء',true)}}
  function restoreNames(){if(!window.REPORT_TEMPLATES[templateId].editableNames)return;try{const names=JSON.parse(localStorage.getItem('fatima-hoffaz:names:'+templateId)||'null');if(Array.isArray(names))all.forEach((s,i)=>{if(typeof names[i]==='string'&&names[i].trim())s.name=names[i].trim()});}catch(e){}}
  function switchTemplate(id){templateId=id;groups=window.REPORT_TEMPLATES[id].groups;storagePrefix='fatima-hoffaz-v2:'+id+':';rebuildIndex();restoreNames();rebuildIndex();let last='';try{last=localStorage.getItem(storagePrefix+'lastDate')||''}catch(e){}if(last)$('date').value=last;load($('date').value);renderEditors();draw();notify('القالب جاهز. التعديلات محفوظة بشكل مستقل لكل قالب.');}
  function init(){const iso=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Amman'});let last='';try{last=localStorage.getItem(storagePrefix+'lastDate')||''}catch(e){}$('date').value=last||iso;load($('date').value);
    $('template').addEventListener('change',e=>switchTemplate(e.target.value));$('date').addEventListener('change',dateChanged);$('import').addEventListener('click',importPaste);$('reset').addEventListener('click',reset);$('download').addEventListener('click',download);$('share').addEventListener('click',share);$('print').addEventListener('click',()=>window.print());renderEditors();draw();}
  init();
})();
