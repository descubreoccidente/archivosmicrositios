import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export const loginConGoogle = async (origen = 'actor') => {
  try {
    const result = await signInWithPopup(auth, googleProvider);

    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        nombre: result.user.displayName,
        proveedor: 'google',
        tipo: origen,
        createdAt: new Date(),
        datosCaracterizacion: {}
      });
    }

    return result.user;
  } catch (error) {
    console.error('Error Google:', error);
    throw error;
  }
};

export const loginConFacebook = async (origen = 'actor') => {
  try {
    const result = await signInWithPopup(auth, facebookProvider);

    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        nombre: result.user.displayName,
        proveedor: 'facebook',
        tipo: origen,
        createdAt: new Date(),
        datosCaracterizacion: {}
      });
    }

    return result.user;
  } catch (error) {
    console.error('Error Facebook:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logout:', error);
  }
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};