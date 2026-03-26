// Portfolio & Chat App Logic
// Requires Firebase config in firebase-config.js

// DOM Elements
const darkToggle = document.getElementById('darkToggle');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const projectsGrid = document.getElementById('projectsGrid');




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
    const response = await fetch('./projects.json');
    const projects = await response.json();
    projectsGrid.innerHTML = projects.map(project => `
      <div class="project-card">
        <img src="${project.image}" alt="${project.name}" class="project-image">
        <div class="project-content">
          <h3 class="project-title">${project.name}</h3>
          <p class="project-description">${project.description}</p>
          <div class="project-tech">
            ${project.technologies.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
          </div>
          <div class="project-buttons">
            <a href="${project.github}" target="_blank" class="btn btn-secondary">GitHub</a>
            <a href="${project.live}" target="_blank" class="btn btn-primary">Live Demo</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading projects:', error);
    projectsGrid.innerHTML = '<p class="text-center text-gray-500 py-8">Projects data not found. Check projects.json exists.</p>';
  }
}

// Projects load on init
loadProjects();

loginBtn.addEventListener('click', async () => {
  const provider = prompt('Pilih login: google atau github') === 'github' 
    ? new firebase.auth.GithubAuthProvider() 
    : new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (error) {
    console.error('Login error:', error);
    alert(`Login gagal: ${error.message}\nPastikan Google/GitHub enabled di Firebase Console > Auth > Sign-in method`);
  }
});

logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// Chat Toggle
toggleChat.addEventListener('click', toggleChatVisibility);

// Chat Functions
function loadChat() {
  if (unsubscribeChats) unsubscribeChats();
  unsubscribeChats = chatCollection.orderBy('timestamp', 'desc').limit(50).onSnapshot((snapshot) => {
    messagesContainer.innerHTML = '';
    const fragments = [];
    snapshot.forEach((doc) => {
      const msg = doc.data();
      const div = document.createElement('div');
      div.className = `message p-4 rounded-lg mb-3 ${msg.replyTo ? 'reply-message bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-500' : 'bg-white dark:bg-gray-700 shadow-sm'}`;
      div.innerHTML = `
        <div class="flex items-start gap-3 mb-1">
          <img src="${msg.photoURL || 'https://via.placeholder.com/40?text=👤'}" alt="avatar" class="w-10 h-10 rounded-full object-cover">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <strong class="truncate">${msg.userName}</strong>
              <span class="text-xs text-gray-500">${new Date(msg.timestamp.toDate()).toLocaleString()}</span>
            </div>
            <p class="break-words">${msg.text}</p>
          </div>
        </div>
        ${msg.replyTo ? `<button onclick="replyTo('${doc.id}')" class="mt-2 text-sm text-blue-600 hover:underline font-medium">↳ Reply</button>` : ''}
      `;
      fragments.unshift(div); // Prepend for newest first
    });
    fragments.forEach(div => messagesContainer.appendChild(div));
    messagesContainer.scrollTop = 0;
  });
}

function toggleChatVisibility() {
  if (!auth.currentUser) {
    alert('Silakan login untuk menggunakan chat!');
    return;
  }
  chatSection.classList.toggle('hidden');
  toggleChat.textContent = chatSection.classList.contains('hidden') ? '💬 Open Chat Room' : '❌ Close Chat Room';
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
