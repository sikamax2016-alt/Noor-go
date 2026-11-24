// بيجهّز مشروع أندرويد المتولّد: الصلاحيات + توقيع الإصدار (لو متغيرات KS_* موجودة)
const fs = require('fs');
const mf = 'android/app/src/main/AndroidManifest.xml';
let m = fs.readFileSync(mf, 'utf8');
const perms = ['INTERNET','ACCESS_FINE_LOCATION','ACCESS_COARSE_LOCATION','ACCESS_BACKGROUND_LOCATION','FOREGROUND_SERVICE','FOREGROUND_SERVICE_LOCATION','POST_NOTIFICATIONS','VIBRATE'];
for (const p of perms) {
  const tag = `<uses-permission android:name="android.permission.${p}" />`;
  if (!m.includes(`android.permission.${p}"`)) m = m.replace('</manifest>', `    ${tag}\n</manifest>`);
}
fs.writeFileSync(mf, m);
if (process.env.KS_FILE) {
  const gf = 'android/app/build.gradle';
  let g = fs.readFileSync(gf, 'utf8');
  if (!g.includes('signingConfigs.release')) {
    g = g.replace('buildTypes {', `signingConfigs {\n        release {\n            storeFile file(System.getenv('KS_FILE'))\n            storePassword System.getenv('KS_PASS')\n            keyAlias System.getenv('KS_ALIAS')\n            keyPassword System.getenv('KS_KEYPASS')\n        }\n    }\n    buildTypes {`);
    g = g.replace(/(buildTypes\s*\{\s*release\s*\{)/, '$1\n            signingConfig signingConfigs.release');
    fs.writeFileSync(gf, g);
  }
}
console.log('patched android project');
