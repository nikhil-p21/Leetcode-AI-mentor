import os 
import requests 
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

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

@app.post("/api/problem-data")
async def get_problem_data(problem: ProblemSlug):
    """
    Receives a problem slug from the frontend, fetches detailed data 
    from LeetCode's API, and returns it.
    """

    print(f"Recieved request for the slug: {problem.slug}")

    problem_details = fetch_leetcode_problem_data(problem.slug)

    if problem_details:
        return problem_details
    else:
        raise HTTPException(status_code=404, detail="Problem data could not be retrieved")
