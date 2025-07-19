console.log("LeetCode AI Mentor content script loaded!");

// --- 1. UI Elements ---

const fab = document.createElement('button');
fab.id = 'mentor-fab';
fab.innerHTML = '💡';
document.body.appendChild(fab);

// Create the chat window
const chatWindow = document.createElement('div');
chatWindow.id = 'mentor-chat-window';
chatWindow.innerHTML = `
  <div class="chat-header">
    LeetCode AI Mentor
    <button id="mentor-close-btn">×</button> 
  </div>
  <div class="chat-body" style="padding: 10px; flex-grow: 1;">
    <p>Hello! How can I help you with this problem?</p>
  </div>
`;
document.body.appendChild(chatWindow);


const closeBtn = chatWindow.querySelector('#mentor-close-btn');

closeBtn.addEventListener('click', () => {
  chatWindow.style.display = 'none';
});


fab.addEventListener('click', () => {
  const isHidden = chatWindow.style.display === 'none' || chatWindow.style.display === '';
  chatWindow.style.display = isHidden ? 'flex' : 'none';

  if (isHidden) {
    scrapeProblemData();
  }
});



function scrapeProblemData() {
    console.log("Scraping problem data...");
  
    const titleSelector = '.text-title-large a';
    const descriptionSelector = '.prose'; 
    const tagsSelector = 'div[class^="mt-2 flex"] > a';
  
    const titleElement = document.querySelector(titleSelector);
    const problemTitle = titleElement ? titleElement.textContent.trim() : "Title not found";
  
    const descriptionElement = document.querySelector(descriptionSelector);
    const problemDescription = descriptionElement ? descriptionElement.innerText : "Description not found";
  
    const tagElements = document.querySelectorAll(tagsSelector);
    const problemTags = []; 
    
    tagElements.forEach(element => {
      problemTags.push(element.innerText); 
    });
  
    console.log("--- Scraped Data ---");
    console.log("Title:", problemTitle);
    console.log("Description:", problemDescription.substring(0, 400) + "...");
    console.log("Tags:", problemTags); 
  
    const chatBody = chatWindow.querySelector('.chat-body');
    chatBody.innerHTML += `<p style="margin-top: 15px; border-top: 1px solid #4a4a4a; padding-top: 10px; font-size: 0.8em;"><strong>Scraping:</strong> Found title for "${problemTitle}"</p>`;
  }