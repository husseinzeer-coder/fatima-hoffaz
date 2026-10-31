/* إضافة قالب جديد تكون هنا، دون إنشاء صفحة JavaScript جديدة لكل قالب. */
window.REPORT_TEMPLATES = {
  classic: {
    id:'classic', title:'القالب الأول — مجموعتان', image:'assets/background.png',
    width:1620, height:971, editableNames:false,
    groups:window.STUDENT_GROUPS
  },
  single12: {
    id:'single12', title:'القالب الثاني — مجموعة 12 طالبًا', image:'assets/background-12.png',
    width:941, height:1672, editableNames:true,
    groups:[{id:'single',title:'المجموعة',students:Array.from({length:12},(_,i)=>({id:'single-'+(i+1),name:'طالب '+(i+1),aliases:[]}))}]
  }
};
