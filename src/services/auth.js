import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
const facebookProvider = new FacebookAuthProvider();
export const registrarConEmail = async (email, password, nombre) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (nombre) {
      await updateProfile(result.user, { displayName: nombre });
    }
    return { ...result.user, displayName: nombre || result.user.email };
  } catch (error) {
    console.error('Error registro:', error);
    throw error;
  }
};

export const crearPerfilUsuario = async (uid, email, nombre, origen = 'actor') => {
  try {
    await setDoc(doc(db, 'users', uid), {
      uid,
      email,
      nombre: nombre || email,
      proveedor: 'email',
      tipo: origen,
      createdAt: new Date(),
      datosCaracterizacion: {}
    });
  } catch (error) {
    console.error('Error creando perfil:', error);
  }
};

export const eliminarCuentaActual = async () => {
  try {
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
  } catch (error) {
    console.error('Error eliminando cuenta no autorizada:', error);
  }
};

export const loginConEmailPassword = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error('Error login email/contraseña:', error);
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