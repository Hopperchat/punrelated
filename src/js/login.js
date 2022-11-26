import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPopup, signInWithEmailAndPassword, signInWithPhoneNumber, GithubAuthProvider, fetchSignInMethodsForEmail, OAuthProvider, linkWithCredential } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import intlTelInput from 'intl-tel-input';
import '../css/login.css';

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

const auth = getAuth();

const database = getDatabase(app);

// Initialize Verifier
window.verifier = new RecaptchaVerifier('sign-in-with-phone-number', {
  size: 'invisible'
}, auth);

const phone_input = document.getElementById('phone-input');
const phone = intlTelInput(phone_input, {
  utilsScript: 'utils.js'
});

const selected_flag = document.querySelector('.iti__selected-flag');
selected_flag.removeAttribute('aria-owns');
selected_flag.removeAttribute('aria-activedescendant');

const email_input = document.getElementById('email-input');
const password_input = document.getElementById('password-input');
document.getElementById('sign-in-with-email').addEventListener('click', () => {
  signInWithEmailAndPassword(auth, email_input.value, password_input.value)
  .then((result) => {
    AuthWorked(result.uid);
  })
  .catch((error) => {
    clientError(error);
  });
});

document.getElementById('sign-in-with-google').addEventListener('click', GoogleSignIn);

document.getElementById('sign-in-with-github').addEventListener('click', GithubSignIn);

document.getElementById('sign-in-with-phone-number').addEventListener('click', PhoneSignIn);

function GoogleSignIn() {
  signInWithPopup(auth, new GoogleAuthProvider)
  .then((result) => {
    AuthWorked(result.uid);
  }).catch((error) => {
    clientError(error);
  });
}

async function GithubSignIn() {
  signInWithPopup(auth, new GithubAuthProvider)
  .then((result) => {
    AuthWorked(result.uid);
  })
  .catch((error) => {
    const parsed = JSON.parse(JSON.stringify(error));
    const email = parsed.customData.email;
    const credential = OAuthProvider.credentialFromError(error);
    if (email && error.code === 'auth/account-exists-with-different-credential') {
      fetchSignInMethodsForEmail(auth, email)
      .then(() => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ login_hint: email, ux_mode: 'popup' });
        signInWithPopup(auth, provider)
        .then((result) => {
          console.log(result);
          linkWithCredential(result.user, credential)
          .then((result) => {
            AuthWorked(result.uid);
          });
        });
      });
    } else
      clientError(error);
  });
}

var confirmation_code;
function PhoneSignIn() {
  window.verifier.verify();
  signInWithPhoneNumber(auth, phone.getNumber(), window.verifier)
  .then((code) => {
    confirmation_code = code;
  })
  .catch((error) => console.log(error));
}

const code_input = document.getElementById('code-input');
document.getElementById('confirm-sms-code').addEventListener('click', () => ConfirmSmsCode(code_input.value));
function ConfirmSmsCode(code) {
  confirmation_code?.confirm(code)
  .then((result) => {
    AuthWorked(result.uid);
  })
  .catch((error) => {
    clientError(error);
  });
}

const client_console = document.getElementById('client-console');
function clientError(message) {
  console.log(message);
  client_console.innerText = message;
}

function userExists(uid) {
  return new Promise((resolve) => {
    onValue(ref(database, 'users_public/' + uid),
    (snapshot) => {
      resolve(snapshot.exists());
    });
  });
}

async function AuthWorked(uid) {
  if(await userExists(uid)) {
    window.open('home', '_self');
  } else {
    window.open('complete-profile', '_self');
  }
}