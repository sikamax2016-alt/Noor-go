// جسر الإضافات الأصلية (بيتجمّع بـ esbuild إلى www/native.js وقت البناء)
import { Capacitor, registerPlugin } from '@capacitor/core';
import { App } from '@capacitor/app';
import { PushNotifications } from '@capacitor/push-notifications';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';

if (Capacitor.isNativePlatform()) {
  const BG = registerPlugin('BackgroundGeolocation');
  const N = { on: true };
  let wid = null;
  N.start = async (cb) => {
    if (wid !== null) return;
    try {
      wid = await BG.addWatcher(
        { backgroundMessage: 'نور جو بيتابع موقعك عشان توصلك الطلبات', backgroundTitle: 'نور جو شغال', requestPermissions: true, stale: false, distanceFilter: 10 },
        (loc, err) => {
          if (err) { if (err.code === 'NOT_AUTHORIZED' && confirm('محتاج إذن الموقع طول الوقت عشان توصلك الطلبات. تفتح الإعدادات؟')) BG.openSettings(); return; }
          if (loc) cb(loc.latitude, loc.longitude);
        });
    } catch (e) { wid = null; }
  };
  N.stop = async () => { if (wid === null) return; try { await BG.removeWatcher({ id: wid }); } catch (e) {} wid = null; };
  N.phone = async (p) => {
    let done = false;
    let timer;
    let sent;
    let failed;
    const cleanup = () => { clearTimeout(timer); try { sent && sent.remove(); failed && failed.remove(); } catch (e) {} };
    return new Promise(async (res, rej) => {
      const finish = (fn, value) => { if (done) return; done = true; cleanup(); fn(value); };
      try {
        sent = await FirebaseAuthentication.addListener('phoneCodeSent', (e) => finish(res, e.verificationId));
        failed = await FirebaseAuthentication.addListener('phoneVerificationFailed', (e) => finish(rej, new Error((e && (e.message || e.code)) || 'phone-verification-failed')));
        timer = setTimeout(() => finish(rej, new Error('phone-verification-timeout')), 30000);
        const r = await FirebaseAuthentication.signInWithPhoneNumber({ phoneNumber: p });
        if (r && r.verificationId) finish(res, r.verificationId);
      } catch (e) { finish(rej, e); }
    });
  };
  App.addListener('appUrlOpen', ({ url }) => {
    if (url) window.dispatchEvent(new CustomEvent('noor:email-link', { detail: url }));
  });
  N.push = async (save) => {
    try {
      let p = await PushNotifications.checkPermissions();
      if (p.receive === 'prompt') p = await PushNotifications.requestPermissions();
      if (p.receive !== 'granted') return;
      await PushNotifications.addListener('registration', (t) => save(t.value));
      await PushNotifications.addListener('pushNotificationReceived', (n) => { if (window.RIDES && window.RIDES.note) window.RIDES.note(((n.title || '') + ' ' + (n.body || '')).trim()); });
      await PushNotifications.register();
    } catch (e) {}
  };
  window.NATIVE = N;
}
