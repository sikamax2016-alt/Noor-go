# نور جو - مشروع أندرويد (Capacitor)

## 1) رفع المشروع على GitHub
ارفع محتويات المجلد على مستودع **خاص (Private)**. ملف `admin-NOT-IN-APP.html` هو لوحة الإدارة، انقله لاستضافة الويب بإسم `admin.html` (مش بيتحط في التطبيق).

## 2) Firebase
1. في مشروعك أضف تطبيق **Android** باسم الحزمة `com.noorgo.app`.
2. نزّل `google-services.json` وضع محتواه في GitHub Secret باسم `GOOGLE_SERVICES_JSON`.
3. فعّل Authentication > Phone، والصق `firestore.rules` و`storage.rules` وانشرهم.

## 3) مفتاح التوقيع (مرة واحدة، واحتفظ بنسخة آمنة منه)
```
keytool -genkeypair -v -keystore release.jks -alias noor -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.jks
keytool -list -v -keystore release.jks -alias noor
```
- الناتج الأول (base64) في Secret باسم `KEYSTORE_BASE64`، وباقي الأسرار: `KEYSTORE_PASSWORD` و`KEY_ALIAS` (noor) و`KEY_PASSWORD`.
- من الأمر الثالث انسخ **SHA-1 وSHA-256** وضيفهم لتطبيق Android في Firebase (لازم للدخول بـ OTP).
- بعد الرفع على Google Play ضيف كمان بصمات **App signing key** من Play Console إلى Firebase.

## 4) البناء
في GitHub: Actions > Build Android > Run workflow. بعد ما يخلص نزّل `noor-go-android` من Artifacts: ملف APK للتجربة وAAB للرفع على Google Play. بدون أسرار التوقيع بيطلع APK تجريبي فقط (debug).

## 5) إشعارات Push (اختياري ومحتاج Blaze)
```
npm i -g firebase-tools && firebase login
cd functions && npm install && cd ..
firebase deploy --only functions
```
