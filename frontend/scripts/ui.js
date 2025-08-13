// scripts/ui.js
window.MentorUI = (function() {
  // Private variables
  let chatWindow, fab, sendBtn, input, closeBtn, typingIndicator;

  function init() {
    createFAB();
    createChatWindow();
    initializeElements();
  }

  function createFAB() {
    fab = document.createElement('button');
    fab.id = 'mentor-fab';
    fab.innerHTML = '💡';
    document.body.appendChild(fab);
  }

  function createChatWindow() {
    chatWindow = document.createElement('div');
    chatWindow.id = 'mentor-chat-window';
    chatWindow.innerHTML = `
      <div class="chat-header">
        <div class="header-content">
          <div class="mentor-avatar">🤖</div>
          <div class="header-text">
            <div class="mentor-title">CodeBuddy</div>
            <div class="mentor-subtitle">AI Mentor</div>
          </div>
        </div>
        <button id="mentor-close-btn">×</button>
      </div>
      <div class="chat-body">
        <div class="ai-message fade-in">
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p>Hello! I'm CodeBuddy, your AI mentor. How can I help you with this problem?</p>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <div class="input-wrapper">
          <input type="text" id="mentor-input" placeholder="Ask for a hint or share your approach...">
          <button id="mentor-send-btn">
            <span class="send-icon">➤</span>
          </button>
        </div>
        <div class="typing-indicator" id="typing-indicator">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span class="typing-text">CodeBuddy is thinking...</span>
        </div>
      </div>
    `;
    document.body.appendChild(chatWindow);
  }

  function initializeElements() {
    sendBtn = chatWindow.querySelector('#mentor-send-btn');
    input = chatWindow.querySelector('#mentor-input');
    closeBtn = chatWindow.querySelector('#mentor-close-btn');
    typingIndicator = chatWindow.querySelector('#typing-indicator');
  }

  function addMessage(text, sender, isThinking = false) {
    const chatBody = chatWindow.querySelector(".chat-body");
    const messageDiv = document.createElement('div');

    if (isThinking) {
      messageDiv.className = 'ai-message thinking-message';
      messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
          <div class="thinking-animation">
            <div class="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p>Analyzing your approach...</p>
          </div>
        </div>
      `;
    } else {
      messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
      if (sender === 'user') {
        messageDiv.innerHTML = `
          <div class="message-content">
            <p>${text}</p>
          </div>
          <div class="message-avatar user-avatar">👤</div>
        `;
      } else {
        messageDiv.innerHTML = `
          <div class="message-avatar">🤖</div>
          <div class="message-content">
            <p>${text}</p>
          </div>
        `;
      }
    }

    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(20px)';
    chatBody.appendChild(messageDiv);

    requestAnimationFrame(() => {
      messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      messageDiv.style.opacity = '1';
      messageDiv.style.transform = 'translateY(0)';
    });

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function displayProblemInfo(data) {
    const chatBody = chatWindow.querySelector('.chat-body');
    const difficultyColor = {
      'Easy': '#00b8a3',
      'Medium': '#ffa116',
      'Hard': '#ff375f'
    };

    const problemInfoDiv = document.createElement('div');
    problemInfoDiv.className = 'problem-info fade-in';
    problemInfoDiv.innerHTML = `
      <div class="problem-header">
        <h3>${data.title}</h3>
        <span class="difficulty-badge" style="background-color: ${difficultyColor[data.difficulty] || '#666'}">
          ${data.difficulty}
        </span>
      </div>
      <div class="tags-section">
        <button class="tags-toggle-btn">🏷️ Show Tags</button>
        <div class="problem-tags hidden">
          ${data.topicTags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
        </div>
      </div>
    `;

    chatBody.appendChild(problemInfoDiv);

    const tagButton = problemInfoDiv.querySelector(".tags-toggle-btn");
    const tagDiv = problemInfoDiv.querySelector(".problem-tags");

    tagButton.addEventListener('click', () => {
      const wasVisible = tagDiv.classList.contains('visible');
      tagDiv.classList.replace(wasVisible ? 'visible' : 'hidden', wasVisible ? 'hidden' : 'visible');
      tagButton.textContent = `🏷️ ${wasVisible ? 'Show' : 'Hide'} Tags`;
    });

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function displayWarning(message) {
    const chatBody = chatWindow.querySelector('.chat-body');
    const warningDiv = document.createElement('div');
    warningDiv.className = 'warning-message fade-in';
    warningDiv.innerHTML = `
      <div class="warning-icon">⚠️</div>
      <p>${message}</p>
    `;
    chatBody.appendChild(warningDiv);
  }

  function displayError(message) {
    const chatBody = chatWindow.querySelector('.chat-body');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message fade-in';
    errorDiv.innerHTML = `
      <div class="error-icon">❌</div>
      <p>Error: ${message}</p>
    `;
    chatBody.appendChild(errorDiv);
  }

  // Getters for UI elements
  function getElements() {
    return { chatWindow, fab, sendBtn, input, closeBtn, typingIndicator };
  }

  // Public API
  return {
    init,
    addMessage,
    displayProblemInfo,
    displayWarning,
    displayError,
    getElements
  };
})();