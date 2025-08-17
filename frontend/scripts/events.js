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
      fab.classList.remove("fab-active");

      // Update FAB text when chat closes via close button
      window.MentorUI.updateFABText("Need help?");

      // Reset FAB animation
      fab.style.animation = "fabPulse 3s infinite ease-in-out";

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

        // Update FAB text when chat opens
        window.MentorUI.updateFABText("Let's solve this!");

        // Add bounce animation to FAB
        fab.style.animation = "fabBounce 0.6s ease-out";
        setTimeout(() => {
          fab.style.animation = "fabPulse 3s infinite ease-in-out";
        }, 600);

        // Get current problem slug for API calls
        const pathParts = window.location.pathname.split("/");
        const newProblemSlug = pathParts[2];

        if (newProblemSlug) {
          currentProblemSlug = newProblemSlug;
        }
      } else {
        chatWindow.classList.add("slide-out");
        fab.classList.remove("fab-active");

        // Update FAB text when chat closes
        window.MentorUI.updateFABText("Need help?");

        // Reset FAB animation when closing
        fab.style.animation = "fabPulse 3s infinite ease-in-out";

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
