// إشعارات Push حقيقية (FCM). بتتنشر بـ: firebase deploy --only functions  (محتاجة خطة Blaze)
const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const MSG = { accepted: 'الكابتن قبل طلبك وجاي ليك', arrived: 'الكابتن وصل', started: 'الرحلة بدأت', completed: 'وصلت بالسلامة' };
async function send(tokens, body) {
  tokens = tokens.filter(Boolean);
  if (!tokens.length) return;
  await admin.messaging().sendEachForMulticast({ tokens, notification: { title: 'نور جو', body }, android: { priority: 'high' } });
}
const token = async (uid) => (await db.doc('users/' + uid).get()).get('fcmToken');
exports.onRideUpdate = onDocumentUpdated('rides/{id}', async (e) => {
  const b = e.data.before.data(), a = e.data.after.data();
  if (b.status === a.status) return;
  if (a.status === 'cancelled') { if (a.driverId && a.cancelledBy === a.riderId) await send([await token(a.driverId)], 'الراكب لغى الرحلة'); return; }
  if (MSG[a.status]) await send([await token(a.riderId)], MSG[a.status]);
});
exports.onRideCreate = onDocumentCreated('rides/{id}', async (e) => {
  const r = e.data.data();
  const q = await db.collection('captains').where('status', '==', 'approved').where('online', '==', true).where('vehicle', '==', r.type).get();
  const toks = [];
  for (const d of q.docs) toks.push(await token(d.id));
  await send(toks, 'طلب رحلة جديد قريب منك');
});
