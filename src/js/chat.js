import { initializeApp } from 'firebase/app';
import { getDatabase, set, ref, push, child, query, endAt, update, onValue, limitToLast, orderByChild, onChildAdded, onChildRemoved, onChildChanged } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'scroll-behavior-polyfill';
import '../css/chat.css';

// Prevent long-polling infinite loop
localStorage.setItem('firebase:previous_websocket_failure', false);
const app = initializeApp({
  apiKey: 'AIzaSyCdKjMjf2KgLVu-OdOu1r3hn7Q2oZdSr0A',
  authDomain: 'punrelated-cloud.firebaseapp.com',
  projectId: 'punrelated-cloud',
  storageBucket: 'punrelated-cloud.appspot.com',
  messagingSenderId: '302019084968',
  appId: '1:302019084968:web:80664afab808a608bbb89d'
});

// send message with header and content
// decrypt header with rsa private and decrypt content 
// with aes gcm when decrypted

const auth = getAuth();

const database = getDatabase(app);

const message_input = document.getElementById('message-input');
onAuthStateChanged(auth, (user) => {
  if(user) {
    console.log(user.uid);
    message_input.addEventListener('keyup', async (event) => {
      if(event.key === 'Enter') {
        const content = message_input.value;
        const key = await GenerateAESKey();
        const [ encrypted, iv ] = await EncryptAES(content, key);
        const message_key = push(ref(database, 'test')).key;

        const { skey, ekey } = await getPublicKey(user.uid);

        const encryptedMessage = arrayBufferToBase64(encrypted);

        const encryptedKey = await encryptRSA(key, ekey);
        console.log(encryptedKey);

        const JSONKey = arrayBufferToBase64(encryptedKey);

        set(child(ref(database, 'test'), message_key), {
          content: encryptedMessage,
          header: {
            key: JSONKey,
            iv: iv
          }
        }).then(() => {
          message_input.value = '';
        });
      }
    });
  }
});

function getPublicKey(uid) {
  return new Promise((resolve) => {
    onValue(ref(database, 'users_public/' + uid),
    async (snapshot) => {
      const ekey = await importRSAeKey(snapshot.val().ekey);
      const skey = await importRSAsKey(snapshot.val().skey);
      resolve({ ekey, skey });
    },
    { onlyOnce: true });
  });
}

async function EncryptAES(message, key) {
  var iv = window.crypto.getRandomValues(new Uint8Array(12));
  message = await window.crypto.subtle.encrypt({
    name: "AES-GCM",
    iv: iv
  }, key, new TextEncoder().encode(message))
  return [ message, iv ];
}
async function DecryptAES(buffer, key, iv) {
  return new TextDecoder().decode(await window.crypto.subtle.decrypt({
    name: "AES-GCM",
    iv: iv
  }, key, buffer));
}

async function GenerateAESKey() {
  return await window.crypto.subtle.generateKey({
    name: "AES-GCM",
    length: 256
  }, true, ["encrypt", "decrypt"]);
}

function importAESKey(key) {
  return window.crypto.subtle.importKey("raw", key, {
    name: "AES-GCM"
  }, true, ["encrypt", "decrypt"]);
}

function createEncryptionKeyPair() {
  return window.crypto.subtle.generateKey({
    name: "RSA-OAEP",
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: "SHA-256"},
    1, ["encrypt", "decrypt"]);
}
function createSigningKeyPair() {
  return window.crypto.subtle.generateKey({
    name: "ECDSA",
    namedCurve: "P-384"},
    1, ["sign", "verify"]);
}
function importRSAsKey(key) {
  return window.crypto.subtle.importKey("jwk", key, {
    name: "ECDSA",
    namedCurve: "P-384"
  }, false, [key.key_ops]);
}
function exportKey(a) {
  return window.crypto.subtle.exportKey("jwk", a);
}
function importRSAeKey(key) {
  return window.crypto.subtle.importKey("jwk", key, {
    name: "RSA-OAEP",
    hash: "SHA-256"
  }, false, [key.key_ops]);
}

function signMessage(message, key) {
  return window.crypto.subtle.sign({
    name: "ECDSA",
    hash: {
      name: "SHA-256"
    }
  },
  key,
  new TextEncoder().encode(message));
}

function verifyMessage(message, key, encoded) {
  return window.crypto.subtle.verify({
    name: "ECDSA",
    hash: {
      name: "SHA-256"
    }
  },
  key,
  message,
  new TextEncoder().encode(encoded));
}

function encryptRSA(a, b) {
  return window.crypto.subtle.encrypt({
    name: "RSA-OAEP"
  }, b, new TextEncoder().encode(a));
}
async function decryptRSA(a, b) {
  return new TextDecoder().decode(await window.crypto.subtle.decrypt({
    name: "RSA-OAEP"
  }, b, a));
}

// Data transfer functions
function arrayBufferToBase64(a) {
  return window.btoa(String.fromCharCode(...new Uint8Array(a)))
}
function base64ToArrayBuffer(a) {
  return Uint8Array.from(window.atob(a), b => b.charCodeAt(0));
}