/* رسم التقرير: هذه الوظيفة نفسها تُستخدم للمعاينة وتصدير PNG. */
window.ReportRenderer = (() => {
  const W=1620,H=971;
  const canvas=document.getElementById('report');
  const ctx=canvas.getContext('2d',{alpha:false});
  let bg=null;
  const img=new Image();img.src='assets/background.png';
  const backgroundReady=new Promise((resolve,reject)=>{img.onload=()=>{bg=img;resolve()};img.onerror=()=>reject(Error('تعذّر تحميل الخلفية assets/background.png'))});
  const days=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const colors={green:'#bce8c5',orange:'#ffddb5',red:'#f7c8c8',gray:'#646b6d',neutral:'rgba(243,245,239,.87)',ink:'#073f32',redText:'#9e2121'};
  function rounded(x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
  function text(t,x,y,maxWidth,size=21,color=colors.ink,weight='600',align='center'){
    ctx.save();ctx.direction='rtl';ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=color;ctx.font=`${weight} ${size}px Tahoma, Arial, sans-serif`;
    let s=String(t??'');let fontSize=size;while(ctx.measureText(s).width>maxWidth&&fontSize>12){fontSize-=1;ctx.font=`${weight} ${fontSize}px Tahoma, Arial, sans-serif`}
    ctx.fillText(s,x,y,maxWidth);ctx.restore();
  }
  function splitText(value,maxWidth,size=19){let words=String(value||'').split(/\s+/);if(words.length<2)return [String(value||'')];ctx.font=`500 ${size}px Tahoma`;let lines=[''];words.forEach(word=>{let last=lines.length-1;let next=lines[last]?lines[last]+' '+word:word;if(ctx.measureText(next).width>maxWidth && lines[last] && lines.length<2)lines.push(word);else lines[last]=next});return lines}
  function drawField(value,x,y,w,h,fill,fs=21,weight='600',color=colors.ink){rounded(x,y,w,h,9,fill);let lines=splitText(value,w-12,fs);if(lines.length===2){text(lines[0],x+w/2,y+h/2-13,w-12,fs-2,color,weight);text(lines[1],x+w/2,y+h/2+13,w-12,fs-2,color,weight)}else text(value,x+w/2,y+h/2,w-10,fs,color,weight)}
  function drawGroup(group,idx,records){
    // حدود ألواح الخلفية: يمين 807–1568، يسار 32–790؛ المساحة البيضاء تبدأ أسفل اسم المجموعة.
    const x=idx===0?827:52; const width=720; const y=356; const gap=5;const nameW=174,recW=304,evalW=115,doneW=112;
    const columns=[{w:nameW,name:'الاسم'},{w:recW,name:'التسميع'},{w:evalW,name:'التقييم'},{w:doneW,name:'إنجاز المطلوب'}];
    let xx=x;columns.forEach(col=>{drawField(col.name,xx,y,col.w,44,'rgba(229,237,231,.91)',17,'700');xx+=col.w+gap});
    const maxRows=Math.max(6,group.students.length);const rowY=y+54;const rowGap=5;const rowH=Math.min(65,(838-rowY-(maxRows-1)*rowGap)/maxRows);
    for(let i=0;i<maxRows;i++){
      const student=group.students[i];const yy=rowY+i*(rowH+rowGap); if(!student)continue;
      const r=records[student.id]||{};
      drawField(student.name,x,yy,nameW,rowH,'rgba(246,238,219,.96)',19,'700');
      const restX=x+nameW+gap;const restWidth=recW+evalW+doneW+gap*2;
      if(r.done==='absent'||r.done==='blocked'){
        drawField(r.done==='absent'?'غائب':'-',restX,yy,restWidth,rowH,r.done==='absent'?colors.red:colors.gray,27,'700',r.done==='absent'?colors.redText:'#ffffff');
      }else{
        drawField(r.rec||'',restX,yy,recW,rowH,colors.neutral,20,'500');
        drawField(r.eval||'',restX+recW+gap,yy,evalW,rowH,colors.neutral,19,'600');
        let done=r.done||'';let fill=done==='100'?colors.green:done==='50'?colors.orange:done==='X'||done==='0'?colors.red:colors.neutral;
        let label=done==='100'?'100%':done==='50'?'50%':done==='0'?'0%':done==='X'?'X':'';
        drawField(label,restX+recW+gap+evalW+gap,yy,doneW,rowH,fill,23,'700',done==='X'||done==='0'?colors.redText:colors.ink)
      }
    }
  }
  async function render(date,groups,records){await backgroundReady;await document.fonts.ready;ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);ctx.drawImage(bg,0,0,W,H);
    const dt=new Date((date||'2026-10-24')+'T12:00:00');const day=isNaN(dt)?'':days[dt.getDay()];
    // الخلفية نفسها تحتوي العناوين والإطارات؛ نكتب فقط قيم اليوم والتاريخ.
    // نغطي خطوط التعبئة داخل المستطيلين الصغيرين، دون تغطية التسميات الأصلية.
    rounded(1248,119,132,34,5,'#fffaf1');
    rounded(1248,164,132,34,5,'#fffaf1');
    text(day,1314,136,120,22,colors.ink,'700');
    text(date?`${Number(date.slice(8,10))} / ${Number(date.slice(5,7))}`:'',1314,181,122,22,colors.ink,'700');
    groups.forEach((g,i)=>drawGroup(g,i,records));return canvas;
  }
  function toBlob(){return new Promise((res,rej)=>canvas.toBlob(b=>b?res(b):rej(Error('تعذّر تحويل Canvas إلى PNG')),'image/png'))}
  return {render,toBlob,canvas,backgroundReady};
})();
