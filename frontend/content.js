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
    fetchProblemDataFromBackend(); 
  }
});



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