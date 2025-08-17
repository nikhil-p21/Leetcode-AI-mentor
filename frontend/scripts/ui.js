// scripts/ui.js
window.MentorUI = (function () {
  // Private variables
  let chatWindow, fab, sendBtn, input, closeBtn, typingIndicator;

  function init() {
    createFAB();
    createChatWindow();
    initializeElements();
  }

  function createFAB() {
    fab = document.createElement("div");
    fab.id = "mentor-fab";
    fab.innerHTML = `
      <div class="fab-content">
        <div class="robot-face">
          <div class="robot-eyes">
            <div class="eye left-eye">
              <div class="pupil"></div>
            </div>
            <div class="eye right-eye">
              <div class="pupil"></div>
            </div>
          </div>
          <div class="robot-mouth"></div>
        </div>
        <div class="help-text">
          <span class="help-message">Need help?</span>
        </div>
      </div>
    `;
    document.body.appendChild(fab);

    // Add click functionality
    fab.style.cursor = "pointer";

    // Add special hover effects
    fab.addEventListener("mouseenter", () => {
      fab.style.animation = "none";
      const robotFace = fab.querySelector(".robot-face");
      robotFace.style.transform = "scale(1.1)";
    });

    fab.addEventListener("mouseleave", () => {
      fab.style.animation = "fabPulse 3s infinite ease-in-out";
      const robotFace = fab.querySelector(".robot-face");
      robotFace.style.transform = "scale(1)";
    });
  }

  function createChatWindow() {
    chatWindow = document.createElement("div");
    chatWindow.id = "mentor-chat-window";
    chatWindow.innerHTML = `
      <div class="chat-header">
        <div class="header-content">
          <div class="mentor-avatar">
            <div class="robot-face-small">
              <div class="robot-eyes-small">
                <div class="eye-small left-eye">
                  <div class="pupil-small"></div>
                </div>
                <div class="eye-small right-eye">
                  <div class="pupil-small"></div>
                </div>
              </div>
              <div class="robot-mouth-small"></div>
            </div>
          </div>
          <div class="header-text">
            <div class="mentor-title">CodeBuddy</div>
            <div class="mentor-subtitle">Your AI Coding Mentor</div>
          </div>
        </div>
        <button id="mentor-close-btn">×</button>
      </div>
      <div class="chat-body">
        <div class="ai-message fade-in">
          <div class="message-avatar">
            <div class="robot-face-tiny">
              <div class="robot-eyes-tiny">
                <div class="eye-tiny"><div class="pupil-tiny"></div></div>
                <div class="eye-tiny"><div class="pupil-tiny"></div></div>
              </div>
              <div class="robot-mouth-tiny"></div>
            </div>
          </div>
          <div class="message-content">
            <p>Hello! I'm CodeBuddy, your AI coding mentor. How can I help you solve this problem? </p>
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
    sendBtn = chatWindow.querySelector("#mentor-send-btn");
    input = chatWindow.querySelector("#mentor-input");
    closeBtn = chatWindow.querySelector("#mentor-close-btn");
    typingIndicator = chatWindow.querySelector("#typing-indicator");
  }

  function addMessage(text, sender, isThinking = false) {
    const chatBody = chatWindow.querySelector(".chat-body");
    const messageDiv = document.createElement("div");

    if (isThinking) {
      messageDiv.className = "ai-message thinking-message";
      messageDiv.innerHTML = `
        <div class="message-avatar">
          <div class="robot-face-tiny">
            <div class="robot-eyes-tiny">
              <div class="eye-tiny"><div class="pupil-tiny"></div></div>
              <div class="eye-tiny"><div class="pupil-tiny"></div></div>
            </div>
            <div class="robot-mouth-tiny"></div>
          </div>
        </div>
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
      messageDiv.className = sender === "user" ? "user-message" : "ai-message";
      if (sender === "user") {
        messageDiv.innerHTML = `
          <div class="message-content">
            <p>${text}</p>
          </div>
          <div class="message-avatar user-avatar">👤</div>
        `;
      } else {
        messageDiv.innerHTML = `
          <div class="message-avatar">
            <div class="robot-face-tiny">
              <div class="robot-eyes-tiny">
                <div class="eye-tiny"><div class="pupil-tiny"></div></div>
                <div class="eye-tiny"><div class="pupil-tiny"></div></div>
              </div>
              <div class="robot-mouth-tiny"></div>
            </div>
          </div>
          <div class="message-content">
            <p>${text}</p>
          </div>
        `;
      }
    }

    messageDiv.style.opacity = "0";
    messageDiv.style.transform = "translateY(20px)";
    chatBody.appendChild(messageDiv);

    requestAnimationFrame(() => {
      messageDiv.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      messageDiv.style.opacity = "1";
      messageDiv.style.transform = "translateY(0)";
    });

    chatBody.scrollTop = chatBody.scrollHeight;
  }



  function displayWarning(message) {
    const chatBody = chatWindow.querySelector(".chat-body");
    const warningDiv = document.createElement("div");
    warningDiv.className = "warning-message fade-in";
    warningDiv.innerHTML = `
      <div class="warning-icon">⚠️</div>
      <p>${message}</p>
    `;
    chatBody.appendChild(warningDiv);
  }

  function displayError(message) {
    const chatBody = chatWindow.querySelector(".chat-body");
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message fade-in";
    errorDiv.innerHTML = `
      <div class="error-icon">❌</div>
      <p>Error: ${message}</p>
    `;
    chatBody.appendChild(errorDiv);
  }

  // Update FAB text
  function updateFABText(text) {
    const helpTextElement = fab.querySelector(".help-message");
    helpTextElement.style.opacity = "0";
    setTimeout(() => {
      helpTextElement.textContent = text;
      helpTextElement.style.opacity = "1";
    }, 150);
  }

  // Getters for UI elements
  function getElements() {
    return { chatWindow, fab, sendBtn, input, closeBtn, typingIndicator };
  }

  // Public API
  return {
    init,
    addMessage,
    displayWarning,
    displayError,
    getElements,
    updateFABText,
  };
})();
