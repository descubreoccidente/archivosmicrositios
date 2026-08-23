import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
const facebookProvider = new FacebookAuthProvider();
export const enviarEnlaceAcceso = async (email, origen = 'actor') => {
  try {
    const actionCodeSettings = {
      url: `${window.location.origin}/ingresar?origen=${origen}`,
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(auth, email, actionCodeSettings);
    window.localStorage.setItem('emailParaAcceso', email);
    window.localStorage.setItem('origenAcceso', origen);
    return { success: true };
  } catch (error) {
    console.error('Error enviando enlace:', error);
    throw error;
  }
};

export const esEnlaceDeAcceso = (url) => {
  return isSignInWithEmailLink(auth, url);
};

export const completarLoginConEnlace = async (url) => {
  try {
    let email = window.localStorage.getItem('emailParaAcceso');
    if (!email) {
      email = window.prompt('Confirma tu correo para completar el acceso:');
    }
    const result = await signInWithEmailLink(auth, email, url);

    const userRef = doc(db, 'users', result.user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: result.user.uid,
        email: result.user.email,
        nombre: result.user.displayName || result.user.email,
        proveedor: 'email',
        tipo: window.localStorage.getItem('origenAcceso') || 'actor',
        createdAt: new Date(),
        datosCaracterizacion: {}
      });
    }

    window.localStorage.removeItem('emailParaAcceso');
    window.localStorage.removeItem('origenAcceso');
    return result.user;
  } catch (error) {
    console.error('Error completando login con enlace:', error);
    throw error;
  }
};
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
const SCRIPT_URL_BREVO = 'https://script.google.com/macros/s/AKfycbxfrMrdDAhW45wCBaGqv7FJz9YDDox12lz1YZvOSOMYTZOKnA8mlX_RAK6U_am8LCyr/exec';
export const agregarContactoBrevo = async (email, nombre, listaId) => {
  try {
    await fetch(SCRIPT_URL_BREVO, {
      method: 'POST',
      mode: 'no-cors',
      body: JSON.stringify({ tipo: 'contacto_brevo', email, nombre, listaId }),
    });
  } catch (error) {
    console.error('Error agregando contacto a Brevo:', error);
  }
};