import os 
import requests 
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")

app = FastAPI()

#allow all origins right now (dev)
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# class for problem slug
class ProblemSlug(BaseModel):
    slug:str

class ChatMessage(BaseModel):
    slug: str
    message: str

def fetch_leetcode_problem_data(title_slug:str):
    "fetches the problem data from Lc's graphql"

    session_cookie = os.getenv('LEETCODE_SESSION')

    if not session_cookie:
        raise HTTPException(status_code=500, detail="Leetcode session cookie not configured on the server")
    
    graphql_query = {
        "query": """
            query questionContent($titleSlug: String!) {
              question(titleSlug: $titleSlug) {
                content
                questionId
                title
                isPaidOnly
                difficulty
                hints
                similarQuestions
                topicTags {
                  name
                  slug
                }
              }
            }
        """,
        "variables": {"titleSlug": title_slug}
    }

    try:
        response = requests.post(
            'https://leetcode.com/graphql',
            json = graphql_query,
            headers = {'Cookie': f'LEETCODE_SESSION={session_cookie}'}
        )

        response.raise_for_status()
        
        data = response.json()
        if "errors" in data:
            raise HTTPException(status_code=404,detail=f"Problem '{title_slug}' not found or API error")
        
        return data['data']['question']
    
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503,detail=f"failed to communicate with leetcode API: {e}")
    

def get_gemini_response(prompt: str):
    "sends prompt to gemini-2.5-flash and gets the response"

    try:
        client = genai.Client(api_key=gemini_api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to initialize gemini client")

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction="You are an expert programming mentor for LeetCode with a solid background in DSA. Your name is 'CodeBuddy'. Your goal is to guide the user without ever giving away the final solution. Ask clarifying questions. If their approach is flawed, gently point them in a better direction. If their approach is correct, affirm it and ask them what the next step would be. Keep your responses concise and encouraging.",
                temperature=0.3,
                max_output_tokens=150
            )
        )
        return response.text
    except Exception as e:
        print(f"Error calling Gemini api: {e}")
        raise HTTPException(status_code=500, detail="Failed to get a response from the AI.")
    

@app.post("/api/problem-data")
async def get_problem_data(problem: ProblemSlug):
    """
    Receives a problem slug from the frontend, fetches detailed data 
    from LeetCode's API, and returns it.
    """

    print(f"Recieved request for the slug: {problem.slug}")

    problem_details = fetch_leetcode_problem_data(problem.slug)

    if problem_details:
        if problem_details.get('isPaidOnly') is True:
            raise HTTPException(status_code=402, detail="This is a premium LeetCode problem and cannot be analyzed.")
        return problem_details
    else:
        raise HTTPException(status_code=404, detail="Problem data could not be retrieved")

@app.post("/api/chat")
async def chat_with_gemini_mentor(message: ChatMessage):
    """
    Receives a user's message, combines it with problem data,
    and gets a hint from gemini.
    """

    print(f"recieved message for the problem '{message.slug}':'{message.message}'")

    problem_details = fetch_leetcode_problem_data(message.slug)

    if(problem_details.get('isPaidOnly')):
        raise HTTPException(status_code=402, detail="I can only help with free problems.")
    
    
    fin_prompt = f"""
    The user is working on this Leetocode problem : "{problem_details['title']}".
    Difficulty: {problem_details['difficulty']}.
    The problem asks: {problem_details['content'][:500]}...
    
    The user's current thought or question is "{message.message}"
    if the user is telling about his thought process , access his
    thought process and gently provide feedback if he is thinking 
    int the right direction or not, gently steer him towards right
    direction. 
    If the user is asking for a hint provide a Socratic, 
    helpful hint based on their question without giving away too much
    """

    ai_response = get_gemini_response(fin_prompt)

    return {"response": ai_response}
