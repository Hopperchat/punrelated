import { initializeApp } from 'firebase/app';
import { getDatabase, set, ref, push, child, query, endAt, update, onValue, limitToLast, orderByChild, onChildAdded, onChildRemoved, onChildChanged } from 'firebase/database';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import 'scroll-behavior-polyfill';
import '../css/chat.css';
const matcher = window.matchMedia('(prefers-color-scheme: dark)');
const favicon = document.getElementById('favicon');
matcher.addEventListener('change', onThemeChange);
onThemeChange();
function onThemeChange() {
  if(matcher.matches) {
    favicon.href = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' shape-rendering='crispEdges' viewBox='0 25 120 100'%3E%3Cstyle%3E path %7B fill: %23fff !important; %7D%0A%3C/style%3E%3Cg transform='translate(10 12.5)'%3E%3Cellipse cx='49' cy='91' rx='48' ry='9' fill='%230073'/%3E%3Cpath d='m95 50 1-6-6-1' fill='%2300f'/%3E%3Cpath d='m95 50-8-11-2 15' fill='%230ff'/%3E%3Cpath d='m85 54 2-15-10-3' fill='%230af'/%3E%3Cpath d='m69 36-1-7 9 7' fill='%2300f'/%3E%3Cpath d='m85 54-8-18-11-1' fill='%2302f'/%3E%3Cpath d='m85 54-19-19 3 12' fill='%230af'/%3E%3Cpath d='m85 54-22-10 15 15' fill='%23027'/%3E%3Cpath d='m66 35 3 12-6-3' fill='%230ff'/%3E%3Cpath d='m66 35-8 4 5 5' fill='%230af'/%3E%3Cpath d='m58 39 20 20-19 7' fill='%2320f'/%3E%3Cpath d='m78 59-19 7 17 4' fill='%2300cf'/%3E%3Cpath d='m85 86-26-20 17 4' fill='%23008'/%3E%3Cpath d='m85 86-26-20 19 25' fill='%23005'/%3E%3Cpath d='m85 86 7 5h-14' fill='%2340f'/%3E%3Cpath d='m57 80 2-14 10 13' fill='%23007'/%3E%3Cpath d='m57 80 1 8 11-9' fill='%23002'/%3E%3Cpath d='m73 91-15-3 8-7' fill='%2340f'/%3E%3Cpath d='m58 39-7 2 8 14' fill='%2305f'/%3E%3Cpath d='m50 54 1-13 8 14' fill='%2304f'/%3E%3Cpath d='m50 54 9 12v-11' fill='%2302c'/%3E%3Cpath d='m50 54 13 15-22 2' fill='%2302f'/%3E%3Cpath d='m50 54-26-16 27 3' fill='%230ff'/%3E%3Cpath d='m50 54-26-16-17 9' fill='%235ff'/%3E%3Cpath d='m34 51-32 8 5-12' fill='%230bf'/%3E%3Cpath d='m21 54-17 17-2-12' fill='%2308f'/%3E%3Cpath d='m21 54-17 17 23 2' fill='%2304a'/%3E%3Cpath d='m34 51-7 22-7-19' fill='%2304f'/%3E%3Cpath d='m50 54-23 19 7-22' fill='%2302a'/%3E%3Cpath d='m50 54-26 21 18-4' fill='%2320c'/%3E%3Cpath d='m4 71v16l23-14' fill='%2300a'/%3E%3Cpath d='m18 91-14-4 11-7' fill='%23005'/%3E%3Cpath d='m15 82 3 9h9' fill='%2340f'/%3E%3Cpath d='m27 73-9 5 13 13' fill='%23208'/%3E%3Cpath d='m29 82 11 9h-9' fill='%2340f'/%3E%3C/g%3E%3C/svg%3E"
  } else {
    favicon.href = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1024' height='1024' shape-rendering='crispEdges' viewBox='0 25 120 100'%3E%3Cg transform='translate(10 12.5)'%3E%3Cellipse cx='49' cy='91' rx='48' ry='9' fill='%230073'/%3E%3Cpath d='m95 50 1-6-6-1' fill='%2300f'/%3E%3Cpath d='m95 50-8-11-2 15' fill='%230ff'/%3E%3Cpath d='m85 54 2-15-10-3' fill='%230af'/%3E%3Cpath d='m69 36-1-7 9 7' fill='%2300f'/%3E%3Cpath d='m85 54-8-18-11-1' fill='%2302f'/%3E%3Cpath d='m85 54-19-19 3 12' fill='%230af'/%3E%3Cpath d='m85 54-22-10 15 15' fill='%23027'/%3E%3Cpath d='m66 35 3 12-6-3' fill='%230ff'/%3E%3Cpath d='m66 35-8 4 5 5' fill='%230af'/%3E%3Cpath d='m58 39 20 20-19 7' fill='%2320f'/%3E%3Cpath d='m78 59-19 7 17 4' fill='%2300cf'/%3E%3Cpath d='m85 86-26-20 17 4' fill='%23008'/%3E%3Cpath d='m85 86-26-20 19 25' fill='%23005'/%3E%3Cpath d='m85 86 7 5h-14' fill='%2340f'/%3E%3Cpath d='m57 80 2-14 10 13' fill='%23007'/%3E%3Cpath d='m57 80 1 8 11-9' fill='%23002'/%3E%3Cpath d='m73 91-15-3 8-7' fill='%2340f'/%3E%3Cpath d='m58 39-7 2 8 14' fill='%2305f'/%3E%3Cpath d='m50 54 1-13 8 14' fill='%2304f'/%3E%3Cpath d='m50 54 9 12v-11' fill='%2302c'/%3E%3Cpath d='m50 54 13 15-22 2' fill='%2302f'/%3E%3Cpath d='m50 54-26-16 27 3' fill='%230ff'/%3E%3Cpath d='m50 54-26-16-17 9' fill='%235ff'/%3E%3Cpath d='m34 51-32 8 5-12' fill='%230bf'/%3E%3Cpath d='m21 54-17 17-2-12' fill='%2308f'/%3E%3Cpath d='m21 54-17 17 23 2' fill='%2304a'/%3E%3Cpath d='m34 51-7 22-7-19' fill='%2304f'/%3E%3Cpath d='m50 54-23 19 7-22' fill='%2302a'/%3E%3Cpath d='m50 54-26 21 18-4' fill='%2320c'/%3E%3Cpath d='m4 71v16l23-14' fill='%2300a'/%3E%3Cpath d='m18 91-14-4 11-7' fill='%23005'/%3E%3Cpath d='m15 82 3 9h9' fill='%2340f'/%3E%3Cpath d='m27 73-9 5 13 13' fill='%23208'/%3E%3Cpath d='m29 82 11 9h-9' fill='%2340f'/%3E%3C/g%3E%3C/svg%3E"
  }
}

console.log('%c\n\nPunrelated\n\nBeta v0.0.11\n\n- Safari IOS issue resolved.\n- Webpack configuration updated to support year-long cache and content hash in filename.\n\n', "font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif");

const fragment = new DocumentFragment();

const messageLoadAmount = ~~(window.innerHeight * 2 / 32);

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

const chat_ref = ref(database, 'test_chat');

const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if(user) {
    onValue(ref(database, `users_public/${user.uid}/display_name`),
    (snapshot) => {
      window.display_name = snapshot.val();
      AddSendMessageListener(snapshot.val(), user.uid);
      LoadChats();
    }, { onlyOnce: true });
  } else {
    window.open('login', '_self');
  }
});

const messages_container = document.getElementById('messages-container');
const send_message = document.getElementById('send-message');
const message_input = document.getElementById('message-input');

function AddSendMessageListener(username, user_id) {
  let keys = {};
  send_message.addEventListener('click', () => {
    PostMessage(message_input.value);
    message_input.value = '';
    message_input.style.height = '46px';
  });

  message_input.addEventListener('keydown', trackKeys);
  message_input.addEventListener('keyup', (e) => {
    trackKeys(e);
    message_input.style.height = '';
    message_input.style.height = message_input.scrollHeight + 2 +  'px';
  });

  function trackKeys(e) {
    keys[e.key] = e.type === 'keydown';
    if(keys.Enter && !keys.Shift) {
      e.preventDefault();
      PostMessage(message_input.value);
      message_input.value = '';
      message_input.style.height = '46px';
    }
  }

  function PostMessage(content) {
    if(!content) return;
    const message_key = push(chat_ref).key;
    const date = new Date().getTime();
    set(child(chat_ref, message_key), {
      author: username,
      content: content,
      original_content: content,
      date_created: date,
      wkoa: user_id
    });
  }
}

function formatTime(timeString) {
  const [ hourString, minute ] = timeString.split(':');
  const hour = +hourString % 24;
  return (hour % 12 || 12) + ':' + minute + (hour < 12 ? 'AM' : 'PM');
}

const author_data = {};

function GetUserInfo(user_id) {
  return new Promise(async (resolve) => {
    onValue(ref(database, 'users_public/' + user_id),
    (snapshot) => {
      if(!snapshot.exists()) return resolve(null);
      const user_config = {
        avatar_url: snapshot.val().avatar_url,
        display_name: snapshot.val().display_name,
        role: snapshot.val().role
      };
      author_data[user_id] = user_config;
      resolve(user_config);
    }, { onlyOnce: true });
  });
}

const loading_spinner = document.getElementById('loading-spinner');

function LoadChats() {
  // Load initial 10 messages
  let last_key;
  let last_username;
  let last_millis = 0;
  onValue(query(ref(database, 'test_chat'), orderByChild('date_created'), limitToLast(messageLoadAmount)),
  async (snapshot) => {
    const messages = snapshot.val();
    if(!messages) return;
    const keys = Object.keys(messages);
    keys.sort((a, b) => messages[a].date_created - messages[b].date_created);
    last_key = messages[keys[0]].date_created - 1;
    for(const key of keys) {
      const author = author_data[messages[key].wkoa] ?? await GetUserInfo(messages[key].wkoa);
      if(!author) continue;
      const this_millis = messages[key].date_created;
      const message = await MessageElement(key, messages[key], author, (last_username !== author.display_name) || (this_millis - last_millis > 1000 * 60 * 15));
      last_millis = this_millis;
      fragment.append(message);
      last_username = author.display_name;
    }

    messages_container.append(...fragment.children);
    messages_overflow_container.style.scrollBehavior = 'auto';
    messages_overflow_container.scrollTop = messages_overflow_container.scrollHeight;

    fragment.innerHTML = '';

    // Load newest message
    onChildAdded(query(ref(database, 'test_chat'), orderByChild('date_created'), limitToLast(1)),
    async (snapshot) => {
      const message = snapshot.val();
      if(!message) return;
      const author = author_data[message.wkoa] ?? await GetUserInfo(message.wkoa);
      if(!author) return;
      const new_message = await PushClientMessage(snapshot.key, message, author, 'beforeend', last_username !== author.display_name);
      last_username = author.display_name;
      if(!new_message) return;
      const next_message = new_message.previousElementSibling;
      if(next_message) {
        if(next_message && (author.display_name !== JSON.parse(next_message.dataset.author).display_name || JSON.parse(next_message.dataset.data).date_created - message.date_created > 1000 * 60) && next_message.dataset.headerless === 'false') {
          const { key, data, author } = next_message.dataset;
          next_message.dataset.headerless = false;
          const new_message = await MessageElement(key, JSON.parse(data), JSON.parse(author), true);
          next_message.insertAdjacentElement('afterend', new_message);
          next_message.remove();
        }
      }
      if(messages_overflow_container.scrollHeight - messages_overflow_container.scrollTop < window.innerHeight) {
        messages_overflow_container.style.scrollBehavior = 'smooth';
        messages_overflow_container.scrollTop = messages_overflow_container.scrollHeight;
      }
    });

    // Load messages on scroll
    messages_overflow_container.addEventListener('scroll', LoadOnScroll);
    messages_overflow_container.addEventListener('touchmove', LoadOnScroll);
  },
  {
    onlyOnce: true
  });

  // Remove messages from chat when removed
  onChildRemoved(ref(database, 'test_chat'),
  async (snapshot) => {
    const message = document.getElementById(snapshot.key);
    if(!message) return;
    const next_message = message.nextElementSibling;
    if(message.dataset.headerless === 'false' && next_message && next_message.dataset.headerless === 'true') {
      const { key, data, author } = next_message.dataset;
      next_message.dataset.headerless = false;
      const new_message = await MessageElement(key, JSON.parse(data), JSON.parse(author), true);
      next_message.insertAdjacentElement('afterend', new_message);
      next_message.remove();
    }
    message.remove();
  });

  // Update messages in realtime on DOM
  onChildChanged(chat_ref, (snapshot) => {
    const message = document.getElementById(snapshot.key);
    message.querySelector('.message-content').innerHTML = markdown(clean(snapshot.val().content)) + (snapshot.val().is_edited === true ? '<span class="is-edited">(edited)</span>' : '');
  });

  // Add messages on scroll
  const messages_overflow_container = document.getElementById('messages-overflow-container');
  function LoadOnScroll() {
    if(messages_overflow_container.scrollTop < window.innerHeight) {
      messages_overflow_container.removeEventListener('scroll', LoadOnScroll);
      messages_overflow_container.removeEventListener('touchmove', LoadOnScroll);
      let my_query = query(ref(database, 'test_chat'), orderByChild('date_created'), endAt(last_key), limitToLast(messageLoadAmount));
      onValue(my_query, async (snapshot) => {
        const messages = snapshot.val();
        if(!messages) return;
        
        const keys = Object.keys(messages);
        if(!keys[0]) return;
        last_key = messages[keys[0]].date_created - 1;
        keys.reverse();
        for await (const key of keys) {
          const author = author_data[messages[key].wkoa] ?? await GetUserInfo(messages[key].wkoa);
          if(!author) continue;
          const message = await MessageElement(key, messages[key], author, false);
          fragment.prepend(message);
          const next_message = message.nextElementSibling;
          if(!next_message) continue;
          const date = JSON.parse(message.dataset.data).date_created;
          const next_key = next_message.dataset.key;
          const next_data = JSON.parse(next_message.dataset.data);
          const next_author = JSON.parse(next_message.dataset.author);
          if(key === keys[keys.length - 1]) {
            const new_message = await MessageElement(key, messages[key], author, true);
            message.insertAdjacentElement('afterend', new_message);
            message.remove();
          }

          if((author.display_name !== next_author.display_name || date - next_data.date_created > 1000 * 60 * 15) && next_message.dataset.headerless === 'true') {
            const new_message = await MessageElement(next_key, next_data, next_author, true);
            next_message.insertAdjacentElement('afterend', new_message);
            next_message.remove();
          } else if(author.display_name === next_author.display_name && next_message.dataset.headerless === 'false') {
            const new_message = await MessageElement(next_key, next_data, next_author, false);
            next_message.insertAdjacentElement('afterend', new_message);
            next_message.remove();
          }
        }
        
        const last_child = fragment.children[fragment.children.length - 1];
        const next_child = messages_container.children[0];
        const key = last_child.id;
        const author = author_data[messages[key].wkoa] ?? await GetUserInfo(messages[key].wkoa);
        if(!author) return;
        const date = JSON.parse(last_child.dataset.data).date_created;
        const next_key = next_child.dataset.key;
        const next_data = JSON.parse(next_child.dataset.data);
        const next_author = JSON.parse(next_child.dataset.author);

        if((author.display_name !== next_author.display_name || date - next_data.date_created > 1000 * 60 * 15) && next_child.dataset.headerless === 'true') {
          const new_message = await MessageElement(next_key, next_data, next_author, true);
          next_child.insertAdjacentElement('afterend', new_message);
          next_child.remove();
        } else if(author.display_name === next_author.display_name && next_child.dataset.headerless === 'false') {
          const new_message = await MessageElement(next_key, next_data, next_author, false);
          next_child.insertAdjacentElement('afterend', new_message);
          next_child.remove();
        }

        const children = fragment.children;
        let from_bottom = messages_overflow_container.scrollHeight - messages_overflow_container.scrollTop;
        messages_container.prepend(...children);
        messages_overflow_container.style.scrollBehavior = 'auto';
        messages_overflow_container.scrollTop = messages_overflow_container.scrollHeight - from_bottom;

        fragment.innerHTML = '';

        if(keys[messageLoadAmount - 1]) {
          messages_overflow_container.addEventListener('scroll', LoadOnScroll, false);
          messages_overflow_container.addEventListener('touchmove', LoadOnScroll, false);
        } else {
          loading_spinner.remove();
        }
      }, {
        onlyOnce: true
      });
    }
  }
}

async function PushClientMessage(key, data, author, position, use_header) {
  if(document.getElementById(key)) return;
  const element = await MessageElement(key, data, author, use_header);
  messages_container.insertAdjacentElement(position, element);
  return element;
}

// Constructs a message based on key, data, author data,
// and whether or not to use header
async function MessageElement(key, data, author, use_header) {
  let datetime = new Date(data.date_created);
  let date = datetime.date();
  let time = formatTime(datetime.time());
  let by_me = author.display_name === window.display_name;

  let message_role = author.role === 'basic' ? ' ' : `<span class="message-role ${author.role}">${clean(author.role)}</span>`;
  
  // Message Element
  let message = _element('li', 'message');
  message.style.order = ~~((datetime - new Date('October 1 2022')) / 10000);
  message.id = key;

  // Left side pocket
  let message_pocket = _element('div', 'message-pocket');
  // Right side text
  let message_text = _element('div', 'message-text');

  const config = {
    key: key,
    data: JSON.stringify(data),
    author: JSON.stringify(author),
    by_me
  };
  for(var i in config)
    message.dataset[i] = config[i];
  
  if(use_header) {
    message_text.innerHTML = `<header class="message-metadata"><span>${author.display_name}</span>${message_role}<span>${date} ${time}</span></header>`;

    let avatar = _element('img', 'message-avatar');
    avatar.src = author_data[data.wkoa].avatar_url;
    message_pocket.append(avatar);
    message.dataset.headerless = false;
  } else {
    message_pocket.innerHTML = `<span class="message-time">${clean(time)}</span>`;
    message.dataset.headerless = true;
  }

  const message_content = _element('p', 'message-content');
  message_content.innerHTML = markdown(clean(data.content)) + (data.is_edited === true ? '<span class="is-edited">(edited)</span>' : '');
  message_text.append(message_content);

  if(by_me) {
    let message_tools = _element('div', 'message-tools');

    function UpdateMessage(content, update_key) {
      if(!content) return;
      const date = new Date().getTime();
      update(child(chat_ref, update_key), {
        content: content,
        is_edited: true
      });
    }

    // Edit message
    const edit_message = _element('button', 'edit-message');
    edit_message.addEventListener('click', AddUpdateTools);
    message_tools.append(edit_message);

    function AddUpdateTools() {
      edit_message.removeEventListener('click', AddUpdateTools);
      let keys = {};
      const update_tools = _element('div', 'update-tools');

      const textarea = _element('textarea', 'edit-message-textarea');
      textarea.innerHTML = clean(JSON.parse(message.dataset.data).content);
      textarea.addEventListener('keydown', CheckKeys);
      textarea.addEventListener('keyup', (e) => {
        CheckKeys(e);
        textarea.style.height = '';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
      update_tools.append(textarea);

      const update_message_buttons = _element('div', 'update-message-buttons');
      
      const perform_update_button = _element('button', 'update-message-button');
      perform_update_button.innerText = 'save';
      perform_update_button.addEventListener('click', () => {
        UpdateMessage(textarea.value, key);
        update_tools.remove();
        edit_message.addEventListener('click', AddUpdateTools);
        message_content.style.display = 'block';
      });
      update_message_buttons.append(Object.assign(_element('p', ''), {innerText:'Press enter to '}));
      update_message_buttons.append(perform_update_button);

      const cancel_update_button = _element('button', 'cancel-update-button');
      cancel_update_button.innerText = 'cancel';
      cancel_update_button.addEventListener('click', () => {
        update_tools.remove();
        edit_message.addEventListener('click', AddUpdateTools);
        message_content.style.display = 'block';
      });
      update_message_buttons.append(Object.assign(_element('p', ''), {innerHTML:' &#x2022; escape to '}));
      update_message_buttons.append(cancel_update_button);
      update_tools.append(update_message_buttons);

      function CheckKeys(e) {
        keys[e.key] = e.type === 'keydown';
        if(keys.Enter && !keys.Shift) {
          UpdateMessage(textarea.value, key);
          update_tools.remove();
          edit_message.addEventListener('click', AddUpdateTools);
          message_content.style.display = 'block';
        } else if(keys.Escape && !keys.Shift) {
          update_tools.remove();
          edit_message.addEventListener('click', AddUpdateTools);
          message_content.style.display = 'block';
        }
      }

      message_content.style.display = 'none';
      message_content.insertAdjacentElement('afterend', update_tools);
      textarea.style.height = '';
      textarea.style.height = textarea.scrollHeight + 'px';
      message.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }

    // Delete message
    let delete_message = _element('button', 'delete-message');
    delete_message.addEventListener('click', () => {
      if(confirm('Delete message?'))
        set(ref(database, 'test_chat/' + key), null);
    });
    message_tools.append(delete_message);

    message.append(message_tools);
  }

  message.append(message_pocket);
  message.append(message_text);
  
  return message;
}

function _element(type, className) {
  let element = document.createElement(type);
  element.className = className;
  return element;
}

function clean(html) {
  return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const bolds = /(?!.*\\[^\s]).*(\*\*(.*?)\*\*)/gm;
const italics = /(?!.*\\[^\s]).*(\*(.*?)\*)/gm;
const underlines = /(?!.*\\[^\s]).*(__(.*?)__)/gm;
const strikethroughs = /(?!.*\\[^\s]).*(~~(.*?)~~)/gm;
function markdown(content) {
  return content.replace(bolds, '<b>$2</b>').replace(italics, '<i>$2</i>').replace(underlines, '<u>$2</u>').replace(strikethroughs, '<s>$2</s>').replace(/\\/g, '');
}

Date.prototype.date = function () {
  return ((this.getDate() < 10)?'0':'') + this.getDate() +'/'+(((this.getMonth()+1) < 10)?'0':'') + (this.getMonth()+1) +'/'+ this.getFullYear();
}
Date.prototype.time = function () {
  return ((this.getHours() < 10)?'0':'') + this.getHours() +':'+ ((this.getMinutes() < 10)?'0':'') + this.getMinutes() +':'+ ((this.getSeconds() < 10)?'0':'') + this.getSeconds();
}