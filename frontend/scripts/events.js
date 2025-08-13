// scripts/events.js
window.MentorEvents = (function () {
  let currentProblemSlug = "";

  function init() {
    const { fab, sendBtn, input, closeBtn, typingIndicator, chatWindow } =
      window.MentorUI.getElements();

    // Send message on button click or Enter key
    sendBtn.addEventListener("click", handleSendMessage);
    input.addEventListener("keyup", (event) => {
      if (event.key === "Enter") handleSendMessage();
    });

    // Close chat window
    closeBtn.addEventListener("click", () => {
      chatWindow.classList.add("slide-out");
      setTimeout(() => {
        chatWindow.style.display = "none";
        chatWindow.classList.remove("slide-out");
      }, 300);
    });

    // FAB toggle
    fab.addEventListener("click", async () => {
      const isHidden =
        chatWindow.style.display === "none" || chatWindow.style.display === "";
      if (isHidden) {
        chatWindow.style.display = "flex";
        chatWindow.classList.add("slide-in");
        fab.classList.add("fab-active");

        const pathParts = window.location.pathname.split("/");
        const newProblemSlug = pathParts[2];

        if (
          newProblemSlug &&
          (newProblemSlug !== currentProblemSlug ||
            !chatWindow.querySelector(".problem-info"))
        ) {
          currentProblemSlug = newProblemSlug;
          const result = await window.MentorAPI.fetchProblemDataFromBackend(
            newProblemSlug
          );
          if (result && result.error === "paid_problem") {
            window.MentorUI.displayWarning(
              "I can only help with free problems at the moment"
            );
          } else if (result && !result.error) {
            window.MentorUI.displayProblemInfo(result);
          } else if (result?.error) {
            window.MentorUI.displayError(result.message);
          }
        } else if (newProblemSlug) {
          currentProblemSlug = newProblemSlug;
        }
      } else {
        chatWindow.classList.add("slide-out");
        fab.classList.remove("fab-active");
        setTimeout(() => {
          chatWindow.style.display = "none";
          chatWindow.classList.remove("slide-out");
        }, 300);
      }
    });
  }

  async function handleSendMessage() {
    const { input, sendBtn, typingIndicator } = window.MentorUI.getElements();
    const messageText = input.value.trim();

    if (!messageText || !currentProblemSlug) return;

    sendBtn.classList.add("sending");
    window.MentorUI.addMessage(messageText, "user");
    input.value = "";
    typingIndicator.style.display = "flex";

    // Simulate delay before API call
    setTimeout(async () => {
      try {
        const aiResponse = await window.MentorAPI.getAiHint(
          currentProblemSlug,
          messageText
        );
        typingIndicator.style.display = "none";
        sendBtn.classList.remove("sending");
        window.MentorUI.addMessage(aiResponse, "ai");
      } catch (error) {
        typingIndicator.style.display = "none";
        sendBtn.classList.remove("sending");
        window.MentorUI.addMessage(
          `Sorry, an error occurred: ${error.message}`,
          "ai"
        );
        console.error("Error communicating with AI mentor:", error);
      }
    }, 500);
  }

  function getCurrentProblemSlug() {
    return currentProblemSlug;
  }

  // Public API
  return {
    init,
    getCurrentProblemSlug,
  };
})();
