/* جسر الإضافات الأصلية: بيشتغل بس جوه تطبيق أندرويد (Capacitor) */
(function(){var C=window.Capacitor;if(!C||!C.isNativePlatform||!C.isNativePlatform())return;
var N=window.NATIVE={on:true},BG=C.registerPlugin('BackgroundGeolocation'),PN=C.registerPlugin('PushNotifications'),FA=C.registerPlugin('FirebaseAuthentication'),wid=null;
N.start=async function(cb){if(wid!==null)return;try{wid=await BG.addWatcher({backgroundMessage:'نور جو بيتابع موقعك عشان توصلك الطلبات',backgroundTitle:'نور جو شغال',requestPermissions:true,stale:false,distanceFilter:10},function(loc,err){if(err){if(err.code==='NOT_AUTHORIZED'&&confirm('محتاج إذن الموقع طول الوقت عشان توصلك الطلبات. تفتح الإعدادات؟'))BG.openSettings();return}if(loc)cb(loc.latitude,loc.longitude)})}catch(e){wid=null}};
N.stop=async function(){if(wid===null)return;try{await BG.removeWatcher({id:wid})}catch(e){}wid=null};
N.phone=function(p){return new Promise(function(res,rej){FA.addListener('phoneCodeSent',function(e){res(e.verificationId)});FA.signInWithPhoneNumber({phoneNumber:p}).then(function(r){if(r&&r.verificationId)res(r.verificationId)}).catch(rej)})};
N.push=async function(save){try{var p=await PN.checkPermissions();if(p.receive==='prompt')p=await PN.requestPermissions();if(p.receive!=='granted')return;
 await PN.addListener('registration',function(t){save(t.value)});await PN.addListener('pushNotificationReceived',function(n){if(window.RIDES&&RIDES.note)RIDES.note(((n.title||'')+' '+(n.body||'')).trim())});await PN.register()}catch(e){}};
})();
