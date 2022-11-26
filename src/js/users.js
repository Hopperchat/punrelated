import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../css/users.css';

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

const fragment = new DocumentFragment();
const users_container = document.getElementById('users-list');
const loading_spinner = document.getElementById('loading-spinner');

onAuthStateChanged(auth, (result) => {
  onValue(ref(database, 'users_public'),
  async (snapshot) => {
    const users = snapshot.val();
    const keys = Object.keys(users);
    for await(const key of keys) {
      const user = users[key];
      const user_element = _element('div', 'user-card');
      const avatar_container = _element('div', 'avatar-container');
      const avatar = _element('img', 'user-avatar');
      avatar.src = user.avatar_url;
      avatar_container.append(avatar);
      user_element.append(avatar_container);

      function getOrder(role) {
        var order = 0;
        switch(role) {
          case 'moderator':
            order = 2;
            break;
          case 'hacker':
            order = 1;
            break;
          default:
            order = 0;
        }
        return order;
      }

      const message_role = user.role === 'basic' ? ' ' : `<span class="user-role ${user.role}">${clean(user.role)}</span>`;

      const display_name = _element('h3', 'user-display-name');
      display_name.innerText = user.display_name;

      display_name.innerHTML += message_role;

      user_element.append(display_name);
      user_element.style.order = getOrder(user.role);

      fragment.append(user_element);
    }

    loading_spinner.remove();
    
    users_container.append(...fragment.children);
  },
  {
    onlyOnce: true
  })
});

function _element(type, class_name) {
  const element = document.createElement(type);
  element.className = class_name;
  return element;
}

function clean(content) {
  return content.replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
}