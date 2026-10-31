/* محرّك موحّد: يرسم القالب المختار ويصدّر نفس Canvas إلى PNG. */
window.ReportRenderer = (() => {
 'use strict';
 const canvas=document.getElementById('report'); const ctx=canvas.getContext('2d',{alpha:false});
 const days=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
 const colors={green:'#A8D5B5',orange:'#F2C991',red:'#E8B1AA',gray:'#626967',neutral:'#FFF9EF',ink:'#063F32',redText:'#912F2B',gold:'#C69A3A'};
 const cache=new Map(); let current='classic';
 function loadImage(path){if(!cache.has(path)){cache.set(path,new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('تعذر تحميل الخلفية '+path));image.src=path;}));}return cache.get(path);}
 function rounded(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();}
 function text(value,x,y,maxWidth,size=21,color=colors.ink,weight='600'){
  ctx.save();ctx.direction='rtl';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;
  let sz=size,s=String(value??'');ctx.font=`${weight} ${sz}px Tahoma, Arial, sans-serif`;
  while(ctx.measureText(s).width>maxWidth&&sz>11){sz--;ctx.font=`${weight} ${sz}px Tahoma, Arial, sans-serif`;}ctx.fillText(s,x,y,maxWidth);ctx.restore();
 }
 function drawField(value,x,y,w,h,fill,fs=21,weight='600',color=colors.ink){
  rounded(x,y,w,h,8,fill);
  // يحافظ على الإطار الذهبي بعد كتابة النص، وليس للخانة الفارغة فقط.
  if(fill===colors.neutral){ctx.save();ctx.beginPath();ctx.roundRect(x+.6,y+.6,w-1.2,h-1.2,8);ctx.strokeStyle=colors.gold;ctx.lineWidth=1.2;ctx.stroke();ctx.restore();}
  const s=String(value??'');const words=s.split(/\s+/);let lines=[s];
  if(s.length>18 && words.length>1){const mid=Math.ceil(words.length/2);lines=[words.slice(0,mid).join(' '),words.slice(mid).join(' ')];}
  if(lines.length===2){text(lines[0],x+w/2,y+h/2-12,w-10,fs-2,color,weight);text(lines[1],x+w/2,y+h/2+12,w-10,fs-2,color,weight);}
  else text(s,x+w/2,y+h/2,w-10,fs,color,weight);
 }
 function statusField(r,x,y,w,h){
  const value=r.done||'';let fill=value==='100'?colors.green:value==='50'?colors.orange:value==='X'||value==='0'?colors.red:colors.neutral;
  const label=value==='100'?'100%':value==='50'?'50%':value==='0'?'0%':value==='X'?'X':'';
  drawField(label,x,y,w,h,fill,23,'700',value==='X'||value==='0'?colors.redText:colors.ink);
 }
 function drawGroup(group,records,layout){
  const {x,width,y,nameW,recW,evalW,doneW,gap,rowH,rowGap}=layout;
  const columns=[{w:nameW,name:'الاسم'},{w:recW,name:'التسميع'},{w:evalW,name:'التقييم'},{w:doneW,name:'إنجاز المطلوب'}];
  let xx=x+width;columns.forEach(col=>{xx-=col.w;drawField(col.name,xx,y,col.w,layout.headerH,'#D5E5D9',layout.headerSize||19,'700','#164E3D');xx-=gap;});
  const rowY=y+layout.headerH+layout.headerGap;
  group.students.forEach((student,i)=>{
   const yy=rowY+i*(rowH+rowGap),r=records[student.id]||{};
   const nameX=x+width-nameW,recX=nameX-gap-recW,evalX=recX-gap-evalW,doneX=evalX-gap-doneW;
   drawField(student.name,nameX,yy,nameW,rowH,'#F0E3C5',layout.nameSize||23,'700');
   if(r.done==='absent'||r.done==='blocked')drawField(r.done==='absent'?'غائب':'-',doneX,yy,recW+evalW+doneW+gap*2,rowH,r.done==='absent'?colors.red:colors.gray,27,'700',r.done==='absent'?colors.redText:'#fff');
   else{drawField(r.rec||'',recX,yy,recW,rowH,colors.neutral,layout.recSize||20,'500');drawField(r.eval||'',evalX,yy,evalW,rowH,colors.neutral,layout.evalSize||19,'600');statusField(r,doneX,yy,doneW,rowH);}
  });
 }
 function dayFor(date){if(!date)return '';const d=new Date(date+'T12:00:00');return Number.isNaN(d.getTime())?'':days[d.getDay()];}
 async function render(date,groups,records,templateId='classic'){
  const template=window.REPORT_TEMPLATES[templateId];if(!template)throw Error('القالب غير موجود');current=templateId;
  const img=await loadImage(template.image);if(document.fonts)await document.fonts.ready;
  canvas.width=template.width;canvas.height=template.height;ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
  const day=dayFor(date),formatted=date?`${Number(date.slice(8,10))} / ${Number(date.slice(5,7))}`:'';
  if(templateId==='classic'){
   rounded(1263,119,132,34,5,'#fffaf1');rounded(1263,164,132,34,5,'#fffaf1');
   text(day,1329,136,120,22,colors.ink,'700');text(formatted,1329,181,122,22,colors.ink,'700');
   groups.forEach((g,i)=>drawGroup(g,records,{x:i===0?842:67,width:720,y:356,nameW:174,recW:304,evalW:115,doneW:112,gap:5,headerH:44,headerGap:10,rowH:65,rowGap:5,nameSize:23}));
  }else{
   // داخل الشريط العلوي للقالب العمودي: اليوم يمينًا والتاريخ يسارًا.
   rounded(492,291,170,41,6,'#FFF9EF');rounded(163,291,150,41,6,'#FFF9EF');
   text(day,577,312,164,27,colors.ink,'700');text(formatted,238,312,147,26,colors.ink,'700');
   drawGroup(groups[0],records,{x:75,width:790,y:414,nameW:192,recW:322,evalW:119,doneW:139,gap:6,headerH:52,headerGap:11,rowH:68,rowGap:8,nameSize:24,recSize:20,evalSize:19,headerSize:20});
  }
  return canvas;
 }
 const toBlob=()=>new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('تعذر تصدير PNG')),'image/png'));
 return {render,toBlob,canvas,loadImage};
})();
