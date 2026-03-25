// Portfolio & Chat App Logic
// Requires Firebase config in firebase-config.js

// DOM Elements
const darkToggle = document.getElementById('darkToggle');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const toggleChat = document.getElementById('toggleChat');
const chatSection = document.getElementById('chatSection');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const replyInfo = document.getElementById('replyInfo');
const replyToMsg = document.getElementById('replyToMsg');
const cancelReply = document.getElementById('cancelReply');
const projectsGrid = document.getElementById('projectsGrid');

let currentReplyId = null;
let unsubscribeChats = null;

// Dark Mode Toggle
darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  darkToggle.textContent = isDark ? '☀️' : '🌙';
  localStorage.setItem('darkMode', isDark);
});

// Load dark mode
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark');
  darkToggle.textContent = '☀️';
}

// Load Projects
async function loadProjects() {
  try {
    const response = await fetch('../projects.json');
    const projects = await response.json();
    projectsGrid.innerHTML = projects.map(project => `
      <div class="project-card bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border">
        <img src="${project.image}" alt="${project.name}" class="w-full h-48 object-cover rounded-lg mb-4">
        <h3 class="text-2xl font-bold mb-2">${project.name}</h3>
        <p class="text-gray-600 dark:text-gray-300 mb-4">${project.description}</p>
        <p class="text-sm text-blue-600 mb-4 font-medium">Tech: ${project.technologies.join(', ')}</p>
        <div class="flex gap-4">
          <a href="${project.github}" target="_blank" class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">GitHub</a>
          <a href="${project.live}" target="_blank" class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Live Demo</a>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading projects:', error);
    projectsGrid.innerHTML = '<p class="col-span-full text-center text-gray-500">Projects loading...</p>';
  }
}

// Auth Listeners
auth.onAuthStateChanged((user) => {
  console.log('Auth state changed:', user ? 'Logged in' : 'Logged out');
}, (error) => {
  console.error('Auth listener error:', error);
  alert('Auth error: ' + error.message);
});
  if (user) {
    userInfo.textContent = user.displayName || user.email;
    userInfo.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    loadChat();
  } else {
    userInfo.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    if (unsubscribeChats) unsubscribeChats();
    chatSection.classList.add('hidden');
    toggleChat.textContent = 'Open Chat Room';
    messagesContainer.innerHTML = '';
  }
});

loginBtn.addEventListener('click', async () => {
  try {
  const provider = new firebase.auth.GoogleAuthProvider();
  // For GitHub: const provider = new firebase.auth.GithubAuthProvider();
  // Enable GitHub in Firebase Console > Auth > Sign-in method > GitHub
    auth.signInWithPopup(provider);
  } catch (error) {
    console.error('Login error:', error);
    alert(`Login gagal: ${error.message}. Cek console dan Firebase config.`);
  }
});

logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// Chat Toggle
toggleChat.addEventListener('click', () => {
  if (!auth.currentUser) {
    alert('Please login to use chat!');
    return;
  }
  chatSection.classList.toggle('hidden');
  toggleChat.textContent = chatSection.classList.contains('hidden') ? 'Open Chat Room' : 'Close Chat Room';
});

// Chat Functions
function loadChat() {
  if (unsubscribeChats) unsubscribeChats();
  unsubscribeChats = chatCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot((snapshot) => {
    messagesContainer.innerHTML = '';
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.className = `message p-4 rounded-lg ${msg.replyTo ? 'reply-message bg-blue-50 dark:bg-blue-950' : 'bg-white dark:bg-gray-700 shadow-sm'}`;
      div.innerHTML = `
        <div class="flex items-start gap-3 mb-1">
          <img src="${msg.photoURL || '/default-avatar.png'}" alt="avatar" class="w-10 h-10 rounded-full">
          <div>
            <strong>${msg.userName}</strong>
            <span class="text-xs text-gray-500 ml-2">${new Date(msg.timestamp.toDate()).toLocaleString()}</span>
          </div>
        </div>
        <p>${msg.text}</p>
        ${msg.replyTo ? `<button onclick="replyTo('${doc.id}')" class="mt-2 text-sm text-blue-600 hover:underline">Reply</button>` : ''}
      `;
      messagesContainer.appendChild(div);
    });
    messagesContainer.scrollTop = 0; // Newest first
  });
}

window.replyTo = (msgId, text = '') => {
  currentReplyId = msgId;
  // Fetch parent msg for display
  chatCollection.doc(msgId).get().then(doc => {
    if (doc.exists) {
      const parent = doc.data();
      replyToMsg.textContent = parent.text.substring(0, 50) + '...';
    }
  });
  replyInfo.classList.remove('hidden');
  messageInput.placeholder = 'Reply...';
  messageInput.focus();
};

cancelReply.addEventListener('click', () => {
  currentReplyId = null;
  replyInfo.classList.add('hidden');
  messageInput.placeholder = 'Type a message...';
});

messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

sendBtn.addEventListener('click', sendMessage);

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !auth.currentUser) return;

  const user = auth.currentUser;
  const msgData = {
    text,
    userId: user.uid,
    userName: user.displayName || user.email,
    photoURL: user.photoURL || '',
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    replyTo: currentReplyId || null
  };

  chatCollection.add(msgData).then(() => {
    messageInput.value = '';
    currentReplyId = null;
    replyInfo.classList.add('hidden');
    messageInput.placeholder = 'Type a message...';
  }).catch(console.error);
}

// Skills Visualizer
class SkillsVisualizer {
    constructor() {
        this.skillItems = document.querySelectorAll('.skill-item');
        this.init();
    }

    init() {
        this.observeScroll();
        this.addHoverListeners();
    }

    observeScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, { threshold: 0.1 });

        this.skillItems.forEach(item => observer.observe(item));
    }

    addHoverListeners() {
        this.skillItems.forEach(item => {
            const tooltip = item.querySelector('.tooltip');
            const skillPercent = item.dataset.skill;
            const skillName = item.dataset.name;
            const progressEl = tooltip.querySelector('.skill-progress');
            const percentEl = tooltip.querySelector('.skill-percent');

            let animationRunning = false;

            item.addEventListener('mouseenter', () => {
                if (animationRunning) return;
                
                animationRunning = true;
                percentEl.textContent = '0%';
                progressEl.style.width = '0%';

                this.animateCounter(percentEl, skillPercent);
                this.animateProgressBar(progressEl, skillPercent);
            });

            item.addEventListener('mouseleave', () => {
                animationRunning = false;
                setTimeout(() => {
                    percentEl.textContent = '0%';
                    progressEl.style.width = '0%';
                }, 500);
            });
        });
    }

    animateCounter(element, target) {
        const duration = 1500;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + '%';
        }, 16);
    }

    animateProgressBar(element, target) {
        setTimeout(() => {
            element.style.width = target + '%';
        }, 200);
    }
}

// Init
loadProjects();
new SkillsVisualizer();
