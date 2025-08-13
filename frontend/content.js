console.log("LeetCode AI Mentor content script loaded!");

// --- 1. UI Elements ---

const fab = document.createElement('button');
fab.id = 'mentor-fab';
fab.innerHTML = '💡';
document.body.appendChild(fab);

//chat window
const chatWindow = document.createElement('div');
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

// global var to store the problem slug
let currentProblemSlug = ''; 

const sendBtn = chatWindow.querySelector('#mentor-send-btn'); 
const input = chatWindow.querySelector('#mentor-input'); 
const closeBtn = chatWindow.querySelector('#mentor-close-btn');
const typingIndicator = chatWindow.querySelector('#typing-indicator');

sendBtn.addEventListener('click', handleSendMessage);
input.addEventListener('keyup', (event) =>{
  if(event.key === 'Enter'){
    handleSendMessage(); 
  }
}); 

closeBtn.addEventListener('click', () => {
  chatWindow.classList.add('slide-out');
  setTimeout(() => {
    chatWindow.style.display = 'none';
    chatWindow.classList.remove('slide-out');
  }, 300);
});

fab.addEventListener('click', () => {
  const isHidden = chatWindow.style.display === 'none' || chatWindow.style.display === '';
  
  if (isHidden) {
    chatWindow.style.display = 'flex';
    chatWindow.classList.add('slide-in');
    fab.classList.add('fab-active');
    
    const pathParts = window.location.pathname.split('/');
    const newProblemSlug = pathParts[2];
   
    if (newProblemSlug && 
        (newProblemSlug !== currentProblemSlug || 
         !chatWindow.querySelector('.problem-info'))) {
      
      currentProblemSlug = newProblemSlug;
      fetchProblemDataFromBackend();
    } else if (newProblemSlug) {
      // Update current slug even if not fetching (in case user navigated back)
      currentProblemSlug = newProblemSlug;
    }
  } else {
    chatWindow.classList.add('slide-out');
    fab.classList.remove('fab-active');
    setTimeout(() => {
      chatWindow.style.display = 'none';
      chatWindow.classList.remove('slide-out');
    }, 300);
  }
});

function addMessage(text, sender, isThinking = false){
  const chatBody = document.querySelector(".chat-body"); 
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
  
  // Add message with animation
  messageDiv.style.opacity = '0';
  messageDiv.style.transform = 'translateY(20px)';
  chatBody.appendChild(messageDiv);
  
  // Trigger animation
  requestAnimationFrame(() => {
    messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    messageDiv.style.opacity = '1';
    messageDiv.style.transform = 'translateY(0)';
  });
  
  chatBody.scrollTop = chatBody.scrollHeight; 
}

async function handleSendMessage(){
  const messageText = input.value.trim(); 
  if(messageText=='' || !currentProblemSlug) return; 

  sendBtn.classList.add('sending');
  
  addMessage(messageText, 'user');
  input.value = ''; 

  typingIndicator.style.display = 'flex';
  
  setTimeout(async () => {
    try{
      const response = await fetch('http://127.0.0.1:8000/api/chat',{
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body : JSON.stringify({slug: currentProblemSlug, message: messageText})
      }); 

      // Hide typing indicator
      typingIndicator.style.display = 'none';
      sendBtn.classList.remove('sending');

      if(!response.ok){
        const errorData = await response.json(); 
        throw new Error(errorData.detail || 'An unknown error occurred'); 
      }

      const data = await response.json(); 
      addMessage(data.response, 'ai'); 

    } catch (error) {
      typingIndicator.style.display = 'none';
      sendBtn.classList.remove('sending');
      addMessage(`Sorry, an error occurred: ${error.message}`, 'ai');
      console.error("Error communicating with AI mentor:", error);
    }
  }, 500);
}

async function fetchProblemDataFromBackend(){
    console.log("preparing to fetch data from the backend.."); 

    // url path 
    const pathParts = window.location.pathname.split('/'); 
    const problemSlug = pathParts[2]; 

    if(!problemSlug) {
        console.error("could not find the problem slug in the URL"); 
        return; 
    }

    //post request to the backend 
    try {
        const response = await fetch('http://127.0.0.1:8000/api/problem-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body : JSON.stringify({slug: problemSlug}),
        }); 

        if(!response.ok){
            const errorData = await response.json(); 
            // to check if it is a paid problem 
            if(response.status == 402){
              const chatBody = chatWindow.querySelector('.chat-body')
              const warningDiv = document.createElement('div');
              warningDiv.className = 'warning-message fade-in';
              warningDiv.innerHTML = `
                <div class="warning-icon">⚠️</div>
                <p>I can only help with free problems at the moment</p>
              `;
              chatBody.appendChild(warningDiv);
              return;
            }
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json(); 
        console.log("--Data received from the backend--"); 

        const chatBody = chatWindow.querySelector('.chat-body');
        const problemInfoDiv = document.createElement('div');
        problemInfoDiv.className = 'problem-info fade-in';
        
        const difficultyColor = {
          'Easy': '#00b8a3',
          'Medium': '#ffa116', 
          'Hard': '#ff375f'
        };
        
        problemInfoDiv.innerHTML = `
          <div class="problem-header">
            <h3>${data.title}</h3>
            <span class="difficulty-badge" style="background-color: ${difficultyColor[data.difficulty] || '#666'}">
              ${data.difficulty}
            </span>
          </div>
          <div class="tags-section">
          <button class="tags-toggle-btn"> 🏷️ Show Tags</button>
            <div class="problem-tags hidden">
              ${data.topicTags.map(tag => `<span class="tag">${tag.name}</span>`).join('')}
            </div>
          </div>  
        `;
        
        chatBody.appendChild(problemInfoDiv);
        const tagButton = problemInfoDiv.querySelector(".tags-toggle-btn"); 
        const tagDiv = problemInfoDiv.querySelector(".problem-tags"); 
        // show tags on clicking the tag button 
        tagButton.addEventListener('click',() => {
          const wasVisible = tagDiv.classList.contains('visible');
  
          tagDiv.classList.replace(wasVisible ? 'visible' : 'hidden', wasVisible ? 'hidden' : 'visible');
          tagButton.textContent = `🏷️ ${wasVisible ? 'Show' : 'Hide'} Tags`;
        }); 
        chatBody.scrollTop = chatBody.scrollHeight;
        
    } catch(error) {
        console.log("error fetching data from the backend"); 
        const chatBody = chatWindow.querySelector('.chat-body');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message fade-in';
        errorDiv.innerHTML = `
          <div class="error-icon">❌</div>
          <p>Error: ${error.message}</p>
        `;
        chatBody.appendChild(errorDiv);
    }
}