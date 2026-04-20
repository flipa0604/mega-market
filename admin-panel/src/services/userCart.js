import {
  collection,
  query,
  where,
  limit,
  getDocs,
  getDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';

const USERS = 'users';

export async function findUserDocIdByTelegramId(telegramId) {
  if (telegramId == null) return null;
  const q = query(
    collection(db, USERS),
    where('telegramId', '==', String(telegramId)),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}

export async function getCartByTelegramId(telegramId) {
  const userDocId = await findUserDocIdByTelegramId(telegramId);
  if (!userDocId) return { userDocId: null, cart: [] };
  const d = await getDoc(doc(db, USERS, userDocId));
  const data = d.data();
  const cart = Array.isArray(data?.cart) ? data.cart : [];
  return { userDocId, cart };
}

export async function saveCartByTelegramId(telegramId, cart) {
  const userDocId = await findUserDocIdByTelegramId(telegramId);
  if (!userDocId) throw new Error('USER_NOT_FOUND');
  await updateDoc(doc(db, USERS, userDocId), { cart });
}
