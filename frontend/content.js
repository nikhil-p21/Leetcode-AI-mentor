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
    LeetCode AI Mentor
    <button id="mentor-close-btn">×</button> 
  </div>
  <div class="chat-body">
    <div class="ai-message">
      <p>Hello! How can I help you with this problem?</p>
    </div>
  </div>
  <div class="chat-input-area">
    <input type="text" id="mentor-input" placeholder="Ask for a hint...">
    <button id="mentor-send-btn">Send</button>
  </div>
`;
document.body.appendChild(chatWindow);

// global var to store the problem slug
let currentProblemSlug = ''; 

const sendBtn = chatWindow.querySelector('#mentor-send-btn'); 
const input = chatWindow.querySelector('#mentor-input'); 
const closeBtn = chatWindow.querySelector('#mentor-close-btn');

sendBtn.addEventListener('click', handleSendMessage);
input.addEventListener('keyup', (event) =>{
  if(event.key === 'Enter'){
    handleSendMessage(); 
  }
}); 

closeBtn.addEventListener('click', () => {
  chatWindow.style.display = 'none';
});


fab.addEventListener('click', () => {
  const isHidden = chatWindow.style.display === 'none' || chatWindow.style.display === '';
  chatWindow.style.display = isHidden ? 'flex' : 'none';

  if (isHidden) {
    const pathParts = window.location.pathname.split('/');
    currentProblemSlug = pathParts[2];
  }
});

function addMessage(text, sender){
  const chatBody = document.querySelector(".chat-body"); 
  const messageDiv = document.createElement('div'); 
  messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
  messageDiv.innerHTML = `<p>${text}</p>`;
  chatBody.appendChild(messageDiv); 
  chatBody.scrollTop = chatBody.scrollHeight; 
}

async function handleSendMessage(){
  const messageText = input.value.trim(); 
  if(messageText=='' || !currentProblemSlug)return; 

  addMessage(messageText, 'user');
  input.value = ''; 

  addMessage("Thinking...", 'ai-thinking');

  try{

    const response = await fetch('http://127.0.0.1:8000/api/chat',{
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body : JSON.stringify({slug: currentProblemSlug, message: messageText})
    }); 

    const thinkingMessage = document.querySelector('.ai-thinking'); 
    if(thinkingMessage)thinkingMessage.remove(); 

    if(!response.ok){
      const errorData = await response.json(); 
      throw new Error(errorData.detail || 'An unknown error occured'); 
    }

    const data = await response.json(); 
    addMessage(data.response, 'ai'); 

  }catch (error) {
    // removing the thinking message in case of an error too 
    const thinkingMessage = chatWindow.querySelector('.ai-thinking');
    if (thinkingMessage) thinkingMessage.remove();

    addMessage(`Sorry, an error occurred: ${error.message}`, 'ai');
    console.error("Error communicating with AI mentor:", error);
}


}


async function fetchProblemDataFromBackend(){

    console.log("preparing to fetch data from the backend.."); 

    // url path 
    const pathParts = window.location.pathname.split('/'); 
    const problemSlug = pathParts[2]; 

    if(!problemSlug)
    {
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
              chatBody.innerHTML+=`<p style="color: orange; font-weight: bold;">
                         I'm sorry I can only help with free problems at the moment
                    </p>`; 
                return;
            }
            throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
        }

        const data = await response.json(); 

        console.log("--Data received form the backend--"); 

        const chatBody = chatWindow.querySelector('.chat-body')
        chatBody.innerHTML += `
        <p style="margin-top: 15px; border-top: 1px solid #4a4a4a; padding-top: 10px; font-size: 0.8em;">
            <strong>Title:</strong> ${data.title} <br>
            <strong>Difficulty:</strong> ${data.difficulty} <br>
            <strong>Tags:</strong> ${data.topicTags.map(tag => tag.name).join(', ')}
        </p>
        `;

        
    }catch(error){
        console.log("error fetching data from the backend"); 
        const chatBody = chatWindow.querySelector('.chat-body'); 
        chatBody.innerHTML +=`<p style="color: red;">Error : ${error.message}</p>`; 
    }


}