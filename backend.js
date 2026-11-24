/* Noor Go - طبقة الربط بـ Firebase. تعمل فقط لو firebase-config.js فيه مفاتيح */
(function(){var C=window.NOOR_FB||{},NG=window.NG={on:!!(C.apiKey&&C.projectId)},A,D,ST,conf;
if(!NG.on)return;
function ld(u){return new Promise(function(r,j){var s=document.createElement('script');s.src=u;s.onload=r;s.onerror=j;document.head.appendChild(s)})}
var B='https://www.gstatic.com/firebasejs/10.12.2/firebase-';
NG.ready=ld(B+'app-compat.js').then(function(){return Promise.all(['auth','firestore','storage'].map(function(m){return ld(B+m+'-compat.js')}))}).then(function(){firebase.initializeApp(C);A=firebase.auth();D=firebase.firestore();ST=firebase.storage();A.useDeviceLanguage()});
var TS=function(){return firebase.firestore.FieldValue.serverTimestamp()};
NG.sendOtp=async function(p){await NG.ready;if(window.NATIVE&&window.NATIVE.phone){NG.vid=await NATIVE.phone(p);return}if(!NG.rv){var d=document.createElement('div');d.id='rc';document.body.appendChild(d);NG.rv=new firebase.auth.RecaptchaVerifier('rc',{size:'invisible'})}conf=await A.signInWithPhoneNumber(p,NG.rv)};
NG.verifyOtp=async function(code){var u=window.NATIVE&&NG.vid?(await A.signInWithCredential(firebase.auth.PhoneAuthProvider.credential(NG.vid,code))).user:(await conf.confirm(code)).user,ref=D.collection('users').doc(u.uid),s=await ref.get();if(!s.exists)await ref.set({phone:u.phoneNumber,name:'',createdAt:TS()});return u};
NG.saveToken=function(t){return D.collection('users').doc(A.currentUser.uid).update({fcmToken:t}).catch(function(){})};
NG.user=function(){return A&&A.currentUser};
NG.signOut=function(){return A.signOut()};
NG.requestRide=async function(r){var ref=await D.collection('rides').add(Object.assign({riderId:A.currentUser.uid,status:'requested',createdAt:TS()},r));return ref.id};
NG.watchRide=function(id,cb){return D.collection('rides').doc(id).onSnapshot(function(s){cb(s.data())})};
NG.cancelRide=function(id,fee){return D.collection('rides').doc(id).update({status:'cancelled',cancelledBy:A.currentUser.uid,cancelFee:fee||0})};
NG.watchOpen=function(type,cb){return D.collection('rides').where('status','==','requested').where('type','==',type).onSnapshot(function(q){cb(q.docs.map(function(d){return Object.assign({id:d.id},d.data())}))})};
NG.accept=function(id){var u=A.currentUser,ref=D.collection('rides').doc(id);return D.runTransaction(async function(t){var s=await t.get(ref);if(s.data().status!=='requested')throw new Error('taken');t.update(ref,{status:'accepted',driverId:u.uid})})};
NG.setStatus=function(id,st){return D.collection('rides').doc(id).update({status:st})};
NG.pushLoc=function(lat,lon,rideId){var l={lat:lat,lon:lon,t:Date.now()},b=D.batch();b.update(D.collection('captains').doc(A.currentUser.uid),{loc:l});if(rideId)b.update(D.collection('rides').doc(rideId),{driverLoc:l});return b.commit()};
NG.online=function(on){return D.collection('captains').doc(A.currentUser.uid).update({online:!!on})};
NG.applyCaptain=function(f){return D.collection('captains').doc(A.currentUser.uid).set(Object.assign({status:'pending',online:false,createdAt:TS()},f))};
NG.uploadDoc=async function(kind,file){var r=ST.ref('captainDocs/'+A.currentUser.uid+'/'+kind);await r.put(file);return r.fullPath};
})();
