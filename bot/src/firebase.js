const admin = require('firebase-admin');
const config = require('./config');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId,
      clientEmail: config.firebase.clientEmail,
      privateKey: config.firebase.privateKey,
    }),
  });
}

const db = admin.firestore();
const usersRef = db.collection('users');
const productsRef = db.collection('products');
const ordersRef = db.collection('orders');

async function getUser(telegramId) {
  const snap = await usersRef.where('telegramId', '==', String(telegramId)).limit(1).get();
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function createUser(telegramId, data) {
  const doc = await usersRef.add({
    telegramId: String(telegramId),
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return { id: doc.id, telegramId: String(telegramId), ...data };
}

async function updateUser(userId, data) {
  await usersRef.doc(userId).update(data);
}

async function getProducts() {
  const snap = await productsRef.orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getProduct(id) {
  const doc = await productsRef.doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

async function getCart(telegramId) {
  const user = await getUser(telegramId);
  if (!user || !user.cart) return [];
  return Array.isArray(user.cart) ? user.cart : [];
}

async function setCart(telegramId, cart) {
  const user = await getUser(telegramId);
  if (!user) return;
  await usersRef.doc(user.id).update({ cart });
}

async function clearCart(telegramId) {
  await setCart(telegramId, []);
}

async function createOrder(orderData) {
  const doc = await ordersRef.add({
    ...orderData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return doc.id;
}

module.exports = {
  db,
  usersRef,
  productsRef,
  ordersRef,
  getUser,
  createUser,
  updateUser,
  getProducts,
  getProduct,
  getCart,
  setCart,
  clearCart,
  createOrder,
};
