# تحويل موقع إنجاز التسميع اليومي إلى تطبيق PWA

## أضف ثلاثة ملفات فقط إلى فرع new-design
1. `manifest.webmanifest` إلى جذر المستودع بجانب `index.html`.
2. `assets/icons/icon-192.png` إلى المسار نفسه.
3. `assets/icons/icon-512.png` إلى المسار نفسه.

## أضف الأسطر التالية داخل `<head>` من `index.html` بعد `<title>` وقبل `</head>`:
```html
<link rel="manifest" href="./manifest.webmanifest">
<meta name="theme-color" content="#104C39">
<link rel="icon" type="image/png" sizes="192x192" href="./assets/icons/icon-192.png">
<link rel="apple-touch-icon" href="./assets/icons/icon-192.png">
```

لا تستبدل ملف `index.html` كاملًا: أضف هذه الأسطر فقط. لا تغيّر `app.js` أو `report.js` أو `style.css`.

## التثبيت على Android
بعد Commit في الفرع الذي يُنشر منه GitHub Pages، افتح الموقع عبر Chrome، ثم القائمة ⋮ > إضافة إلى الشاشة الرئيسية > تثبيت (إذا ظهر).
إذا ثبت الاختصار سابقًا، احذفه ثم ثبته مجددًا لتجربة العرض المستقل.

## ملاحظات
- هذه المرحلة تفعّل الأيقونة والنافذة المستقلة فقط، ولا تضيف Service Worker؛ لتجنب تخزين نسخ قديمة من ملفات JavaScript.
- يمكن للمستخدم رؤية كود واجهة الموقع عبر المتصفح، وPWA لا يخفيه.
- لا تضمن هذه الإضافة العمل دون اتصال بالإنترنت.
- الأيقونة مؤقتة بشكل مصحف هندسي، ويمكن استبدالها بشعار المسجد المعتمد مع الاحتفاظ بأسماء الملفّات.
