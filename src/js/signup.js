import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signInWithPhoneNumber, GithubAuthProvider } from 'firebase/auth';
import intlTelInput from 'intl-tel-input';
import '../css/signup.css';

// Set up phone input
const phoneInput = document.getElementById('phone-input');
const phone = intlTelInput(phoneInput, {
  utilsScript: 'utils.js'
});

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

// Initialize Verifier
window.verifier = new RecaptchaVerifier('send-sms-code', {
  size: 'invisible'
}, auth);

document.getElementById('sign-up-with-google').addEventListener('click', GoogleSignUp);

document.getElementById('sign-up-with-github').addEventListener('click', GithubSignUp);

const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
document.getElementById('sign-up-with-email').addEventListener('click', () => EmailSignUp(emailInput.value, passwordInput.value));

document.getElementById('email-verify').addEventListener('click', () => {
  console.log('clicked');
  SendEmailVerificationAgain(emailInput.value, passwordInput.value);
});

document.getElementById('send-sms-code').addEventListener('click', () => {
  const phone_number = phone.getNumber();
  PhoneSignUp(phone_number);
});

const codeInput = document.getElementById('code-input');
document.getElementById('confirm-sms-code').addEventListener('click', () => {
  ConfirmCode(codeInput.value);
});

const client_console = document.getElementById('client-console');
function clientError(message) {
  console.log(message);
  client_console.innerText = message;
}

function GoogleSignUp() {
  signInWithPopup(auth, new GoogleAuthProvider)
  .then((result) => {
    const user = result.user;
    window.open('complete-profile?username=' + user.displayName, '_self');
  }).catch((error) => clientError(error));
}

function GithubSignUp() {
  signInWithPopup(auth, new GithubAuthProvider)
  .then(() => {
    window.open('complete-profile', '_self');
  })
  .catch((error) => clientError(error));
}

function EmailSignUp(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
  .then((result) => {
    const user = result.user;
    sendEmailVerification(user, {
      url: window.location.origin + '/complete-profile?username=' + email
    })
    .then(() => {
      clientError('email send success! check spam folder');
    });
  })
  .catch((error) => {
    if(error.code === 'auth/email-already-in-use') {
      return clientError('This email already exists.');
    }
    clientError(error);
  });
}

function SendEmailVerificationAgain(email, password) {
  signInWithEmailAndPassword(auth, email, password)
  .then((result) => {
    const user = result.user;
    if(user.emailVerified) return;
    sendEmailVerification(user, {
      url: window.location.origin + '/complete-profile?username=' + email
    })
    .catch((error) => clientError(error));
  })
  .catch((error) => {
    clientError(error);
  });
}

function PhoneSignUp(number) {
  window.verifier.verify();
  signInWithPhoneNumber(auth, number, window.verifier)
  .then((code) => {
    clientError('Message sent successfully.');
    window.confirmationCode = code;
  })
  .catch((error) => console.log(error));
}

function ConfirmCode(code) {
  window.confirmationCode?.confirm(code)
  .then(() => {
    window.open('complete-profile?username=Anonymous', '_self');
  })
  .catch((error) => {
    clientError(error);
  });
}