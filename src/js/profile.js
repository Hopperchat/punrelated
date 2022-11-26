import { initializeApp } from 'firebase/app';
import { getDatabase, set, ref } from 'firebase/database';
import { getStorage, uploadBytes, ref as _ref } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../css/profile.css';

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

const canvas = document.getElementById('file-output');

const update_avatar = document.getElementById('update-avatar');
const image = new Image;
const ctx = canvas.getContext('2d');

let file;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

onAuthStateChanged(auth, (result) => {
  if(!result) return window.open('login', '_self');
  AddCompleteProfileListener(result.uid);
  const fileInput = document.getElementById('file-input');
  const chooseFile = document.getElementById('choose-file');
  canvas.addEventListener('click', () => fileInput.click());
  chooseFile.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    if(!e.target.files[0]) return;
    update_avatar.disabled = true;
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
      update_avatar.disabled = false;
      canvas.style.visibility = 'visible';
      hideElement(bottle);
    });
  });
});

const profile_picture_section = document.getElementById('profile-picture-section');

slideIn(profile_picture_section);

function AddCompleteProfileListener(user_id) {
  update_avatar.addEventListener('click', async () => {
    const image_path = _ref(storage, 'profile_pictures/' + user_id);
    uploadBytes(image_path, file).then(() => {
      set(ref(database, 'users_public/' + user_id + '/avatar_url'), 'https://storage.googleapis.com/punrelated-cloud.appspot.com/profile_pictures/' + user_id)
      .then(() => {
        window.open('home', '_self');
      });
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

function slideIn(element) {
  function callback() {
    element.removeEventListener('animationend', callback);
    element.style.animation = 'none';
  }
  element.style.display = 'flex';
  element.style.animation = 'slide-in 1s ease-in-out';
  element.addEventListener('animationend', callback);
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