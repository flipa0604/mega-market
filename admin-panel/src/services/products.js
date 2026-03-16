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
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

const PRODUCTS = 'products';

export async function uploadProductImage(file) {
  const name = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const storageRef = ref(storage, `products/${name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function getProducts() {
  const q = query(
    collection(db, PRODUCTS),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProduct(id) {
  const d = await getDoc(doc(db, PRODUCTS, id));
  return d.exists() ? { id: d.id, ...d.data() } : null;
}

export async function addProduct(data) {
  const docRef = await addDoc(collection(db, PRODUCTS), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(id, data) {
  await updateDoc(doc(db, PRODUCTS, id), data);
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, PRODUCTS, id));
}
