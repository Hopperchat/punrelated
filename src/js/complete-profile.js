import { initializeApp } from 'firebase/app';
import { getDatabase, set, ref, query, onValue, orderByChild, equalTo } from 'firebase/database';
import { getStorage, uploadBytes, getDownloadURL, ref as _ref } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Filter from 'bad-words';
import '../css/complete-profile.css';

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

const database = getDatabase(app);

const storage = getStorage(app);

const auth = getAuth();

const filter = new Filter();

onAuthStateChanged(auth, (result) => {
  if(!result) return window.open('login', '_self')
  console.log(auth.uid);
  const config = {
    uid: result.uid,
    displayName: defaultUsername ?? 'Anonymous'
  };

  displayNameInput.value = defaultUsername;

  AddCompleteProfileListener(config);
});

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop)
});

const defaultUsername = params.username;

const profilePictureSection = document.getElementById('profile-picture-section');
const displayNameForm = document.getElementById('display-name-form');
const nextDisplayName = document.getElementById('next-display-name');
const displayNameInput = document.getElementById('display-name-input');

const [ displayGroup ] = document.getElementsByClassName('input-group');

slideIn(displayNameForm);

displayNameInput.addEventListener('keyup', (e) => {
  if(!e.target.value.length) return;
  if(!(/^[\w\ @.\s]+$/.test(e.target.value)) || filter.isProfane(e.target.value)) {
    e.target.className = 'material-input error';
  } else {
    e.target.className = 'material-input';
  }
});

displayNameForm.addEventListener('submit', (e) => {
  e.preventDefault();
});

let displayName;

nextDisplayName.addEventListener('click', () => {
  let name = displayNameInput.value;
  validateDisplayName(name)
  .then((name) => {
    displayName = name;
    slideOut(displayNameForm)
    .then(() => slideIn(profilePictureSection));
  })
  .catch((error) => {
    const div = appendFormError(displayGroup, error);
    displayNameInput.className = 'material-input error';
    displayNameInput.addEventListener('keyup', callback);
    function callback() {
      displayNameInput.removeEventListener('keyup', callback);
      div.remove();
    }
  });
});

const canvas = document.getElementById('file-output');
const bottle = document.getElementById('bottle');const liquid = document.getElementById('liquid');
const ctx = canvas.getContext('2d');
const image = new Image;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function AddCompleteProfileListener(user) {
  const fileInput = document.getElementById('file-input');
  const chooseFile = document.getElementById('choose-file');
  canvas.addEventListener('click', () => fileInput.click());
  chooseFile.addEventListener('click', () => fileInput.click());

  let file;

  const completeProfile = document.getElementById('complete-profile');

  completeProfile.addEventListener('click', () => {
    const config = {
      uid: user.uid,
      file,
      displayName: displayName
    };
    AddUserData(config);
  });

  fileInput.addEventListener('change', async (e) => {
    if(!e.target.files[0]) return;
    completeProfile.disabled = true;
    bottle.style.display = 'block';
    liquid.style.transform = 'translateY(250px)';
    canvas.style.visibility = 'hidden';
    let start = performance.now();
    console.log(e.target.files[0]);
    ResizeFile(e.target.files[0], 10000,
    (progress) => {
      liquid.style.transform = `translateY(${progress / 100 * 130 - 10}px)`
    })
    .then(async (result) => {
      console.log('\n\nFile loaded successfully.\n\nFile time: ', performance.now() - start, '\n\nFile size: ', result.size, '\n\n');
      result = new File([result], 'result', { 'type': 'image/webp' });

      console.log(result);

      await sleep(400);
      file = result;
      completeProfile.disabled = false;
      canvas.style.visibility = 'visible';
      hideElement(bottle);
    });
  });
}

function ResizeFile(file, byte_size, progress=()=>{}) {
  return new Promise((resolve, reject) => {
    const blob_url = URL.createObjectURL(file);
    const { width, height } = canvas;
    const diff = file.size - byte_size;
    ctx.fillStyle = '#fff';
    image.onload = async () => {
      let w = image.naturalWidth;
      let h = image.naturalHeight
      let scale = Math.max(width / w, height / h);
      ctx.setTransform(scale, 0, 0, scale, width / 2, height / 2);
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.drawImage(image, -w / 2, -h / 2, w, h);
      loop(100);
      function loop(iter) {
        let data_url = canvas.toDataURL('image/jpeg', iter / 100);
        let blob = dataURItoBlob(data_url);
        if(blob.size < byte_size) return resolve(blob);
        if(iter < 1) return reject('File is too big');
        iter--;
        progress(1 - (blob.size - byte_size) / diff);
        loop(iter);
      }
    };
    image.src = blob_url;
  });
}

function dataURItoBlob(dataURI) {
  var byteString = atob(dataURI.split(',')[1]);
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }
  var blob = new Blob([ab], {type: mimeString});
  return blob;
}

async function AddUserData(user) {
  const image_path = _ref(storage, 'profile_pictures/' + user.uid);
  uploadBytes(image_path, user.file).then(() => {
    getDownloadURL(image_path).then(async (url) => {
      const ekeys = await createEncryptionKeyPair();
      const epublic_key = await exportKey(ekeys.publicKey);
      const eprivate_key = await exportKey(ekeys.privateKey);
      const skeys = await createSigningKeyPair();
      const spublic_key = await exportKey(skeys.publicKey);
      const sprivate_key = await exportKey(skeys.privateKey);

      // Create public profilew
      set(ref(database, 'users_public/' + user.uid), {
        display_name: user.displayName,
        ekey: epublic_key,
        skey: spublic_key,
        role: 'basic',
        avatar_url: 'https://storage.googleapis.com/punrelated-cloud.appspot.com/profile_pictures/' + user.uid
      })
      .then(() => {
        onValue(ref(database, `users_private/${user.uid}/ekey`), (snapshot) => {
          if(snapshot.exists()) return window.open('/', '_self');
          set(ref(database, `users_private/${user.uid}/ekey`), eprivate_key)
          .then(() => {
            onValue(ref(database, `users_private/${user.uid}/skey`), (snapshot) => {
              if(snapshot.exists()) return window.open('/', '_self');
              set(ref(database, `users_private/${user.uid}/skey`), sprivate_key)
              .then(() => {
                window.open('/', '_self');
              });
            });
          });
        }, (error) => {
          console.log(error);
        }, {
          onlyOnce: true
        });
      });
    });
  })
  .catch((error) => {
    console.log(error);
  });
}

function hideElement(ele) {
  ele.addEventListener('animationend', callback);
  ele.style.animation = 'fade-out 1s ease-in-out';
  function callback() {
    ele.removeEventListener('animationend', callback);
    ele.style.display = 'none';
    ele.style.animation = 'none';
  }
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

function exportKey(key) {
  return window.crypto.subtle.exportKey("jwk", key);
}

function slideOut(element) {
  return new Promise(resolve => {
    function callback() {
      element.style.display = 'none';
      element.removeEventListener('animationend', callback);
      resolve();
    }
    element.style.animation = 'slide-out .4s ease-in-out';
    element.addEventListener('animationend', callback);
  });
}

function slideIn(element) {
  function callback() {
    element.removeEventListener('animationend', callback);
    element.style.animation = 'none';
  }
  element.style.display = 'flex';
  element.style.animation = 'slide-in 1s ease-in-out';
  element.addEventListener('animationend', callback);
}

function validateDisplayName(username) {
  return new Promise((resolve, reject) => {
    if(!username.length) reject('Please enter a Display Name.');
    if(username !== username.trim()) reject('Your Display Name has trailing whitespace.');
    if(filter.isProfane(username)) reject('Your Display Name contains profanity.');
    if(!(/^[\w\ @.\s]+$/.test(username))) reject('Display Name must only contain alphanumerics, spaces, @, and periods.');
    if(username.length > 20) reject('Display Name must be no longer than 20 characters in length.');
    onValue(query(ref(database, 'users_public'), orderByChild('display_name'), equalTo(username)), (snapshot) => {
      if(snapshot.exists())
        reject('Username already exists.');
      else
        resolve(username)
    });
  });
}

function appendFormError(element, message) {
  const div = document.createElement('div');
  div.innerText = message;
  div.className = 'form-error';
  element.insertAdjacentElement('afterend', div);
  return div;
}