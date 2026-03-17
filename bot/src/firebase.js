const admin = require('firebase-admin');
const config = require('./config');
const path = require('path');
const fs = require('fs');

function getCredential() {
  let jsonPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!jsonPath) {
    const defaultPath = path.resolve(process.cwd(), 'serviceAccount.json');
    if (fs.existsSync(defaultPath)) jsonPath = defaultPath;
  }
  if (jsonPath) {
    const fullPath = path.isAbsolute(jsonPath) ? jsonPath : path.resolve(process.cwd(), jsonPath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Firebase: credential file not found: ${fullPath}`);
    }
    const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (!json.private_key || !json.client_email) {
      throw new Error('Firebase: invalid serviceAccount.json (missing private_key or client_email)');
    }
    console.log('Firebase: using credentials from', fullPath);
    return admin.credential.cert(json);
  }
  const { projectId, clientEmail, privateKey } = config.firebase;
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase: no credentials. Put serviceAccount.json in the bot folder, or set in .env: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    );
  }
  console.log('Firebase: using credentials from .env');
  return admin.credential.cert({
    projectId,
    clientEmail,
    privateKey,
  });
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: getCredential() });
}

const db = admin.firestore();
const usersRef = db.collection('users');
const categoriesRef = db.collection('categories');
const productsRef = db.collection('products');
const ordersRef = db.collection('orders');

async function getCategories() {
  const snap = await categoriesRef.orderBy('createdAt', 'asc').get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

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

async function getProductsByCategory(categoryId) {
  const snap = await productsRef
    .where('categoryId', '==', categoryId)
    .orderBy('createdAt', 'asc')
    .get();
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return list.reverse();
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
  categoriesRef,
  productsRef,
  ordersRef,
  getUser,
  createUser,
  updateUser,
  getCategories,
  getProducts,
  getProductsByCategory,
  getProduct,
  getCart,
  setCart,
  clearCart,
  createOrder,
};
