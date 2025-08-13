// scripts/api.js
window.MentorAPI = (function() {
  
  async function fetchProblemDataFromBackend(slug) {
    console.log("Preparing to fetch data from the backend...");
    if (!slug) {
      console.error("Could not find the problem slug in the URL");
      return null;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/problem-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 402) {
          return { error: 'paid_problem', message: errorData.detail || 'This is a paid problem.' };
        }
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("--Data received from the backend--");
      return data;
    } catch (error) {
      console.error("Error fetching data from backend:", error);
      return { error: 'network', message: error.message };
    }
  }

  async function getAiHint(slug, message) {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, message })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'An unknown error occurred');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      throw error;
    }
  }

  // Public API
  return {
    fetchProblemDataFromBackend,
    getAiHint
  };
})();