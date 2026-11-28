/* Noor Go - طبقة الربط بـ Firebase. تعمل فقط لو firebase-config.js فيه مفاتيح */
(function(){var C=window.NOOR_FB||{},NG=window.NG={on:!!(C.apiKey&&C.projectId)},A,D,ST,conf;
if(!NG.on)return;
function ld(u){return new Promise(function(r,j){var s=document.createElement('script');s.src=u;s.onload=r;s.onerror=j;document.head.appendChild(s)})}
var B='https://www.gstatic.com/firebasejs/10.12.2/firebase-';
NG.ready=Promise.race([ld(B+'app-compat.js').then(function(){return Promise.all(['auth','firestore','storage'].map(function(m){return ld(B+m+'-compat.js')}))}).then(function(){firebase.initializeApp(C);A=firebase.auth();D=firebase.firestore();ST=firebase.storage();A.useDeviceLanguage()}),new Promise(function(_,j){setTimeout(function(){j(new Error('firebase-timeout'))},15000)})]).catch(function(e){NG.error=e;throw e});
var TS=function(){return firebase.firestore.FieldValue.serverTimestamp()};
async function ensureUser(u){var ref=D.collection('users').doc(u.uid),s=await ref.get();if(!s.exists)await ref.set({email:u.email||null,phone:u.phoneNumber||null,name:'',createdAt:TS()});return u}
 NG.googleSignIn=async function(){await NG.ready;var cr,u;if(window.NATIVE&&NATIVE.google){var r=await NATIVE.google();cr=firebase.auth.GoogleAuthProvider.credential(r.idToken,r.accessToken);u=(await A.signInWithCredential(cr)).user}else{u=(await A.signInWithPopup(new firebase.auth.GoogleAuthProvider())).user}return ensureUser(u)};
NG.saveToken=function(t){return D.collection('users').doc(A.currentUser.uid).update({fcmToken:t}).catch(function(){})};
NG.wallet=function(cb){return D.collection('wallets').doc(A.currentUser.uid).onSnapshot(function(s){cb((s.data()||{}).balance||0)},function(){})};
NG.topup=function(amt,ph){return D.collection('walletRequests').add({uid:A.currentUser.uid,amount:amt,phone:ph,status:'pending',at:TS()})};
NG.myTopups=function(cb){return D.collection('walletRequests').where('uid','==',A.currentUser.uid).onSnapshot(function(q){cb(q.docs.map(function(d){return d.data()}))},function(){})};
NG.promo=async function(code){var s=await D.collection('promos').doc(code).get();if(!s.exists||!s.data().active)return null;var u=await D.collection('redemptions').doc(A.currentUser.uid+'_'+code).get();return u.exists?{used:true}:{code:code,pct:s.data().pct}};
NG.redeem=function(code){return D.collection('redemptions').doc(A.currentUser.uid+'_'+code).set({uid:A.currentUser.uid,code:code,at:TS()})};
NG.ticket=function(m){return D.collection('tickets').add({uid:A.currentUser.uid,phone:A.currentUser.phoneNumber||'',message:m,status:'open',at:TS()})};
NG.deleteAccount=async function(){var u=A.currentUser;try{await D.collection('captains').doc(u.uid).delete()}catch(e){}try{await D.collection('users').doc(u.uid).delete()}catch(e){}await u.delete()};
NG.myRides=function(cb){return D.collection('rides').where('riderId','==',A.currentUser.uid).onSnapshot(function(q){cb(q.docs.map(function(d){return Object.assign({id:d.id},d.data())}))},function(){})};
NG.driverRides=function(cb){return D.collection('rides').where('driverId','==',A.currentUser.uid).onSnapshot(function(q){cb(q.docs.map(function(d){return Object.assign({id:d.id},d.data())}))},function(){})};
NG.profile=function(cb){return D.collection('users').doc(A.currentUser.uid).onSnapshot(function(s){cb(s.data()||{})},function(){})};
NG.setName=function(n){return D.collection('users').doc(A.currentUser.uid).update({name:n})};
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
