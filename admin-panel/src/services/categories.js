import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const CATEGORIES = 'categories';

export async function getCategories() {
  const q = query(
    collection(db, CATEGORIES),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCategory(id) {
  const d = await getDoc(doc(db, CATEGORIES, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

export async function addCategory(name) {
  const docRef = await addDoc(collection(db, CATEGORIES), {
    name: name.trim(),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(id, name) {
  await updateDoc(doc(db, CATEGORIES, id), { name: name.trim() });
}

export async function deleteCategory(id) {
  await deleteDoc(doc(db, CATEGORIES, id));
}
