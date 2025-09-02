document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to toggle participant list visibility
  function toggleParticipants(participantId) {
    const participantsList = document.getElementById(participantId);
    const arrow = document.getElementById(`arrow-${participantId}`);
    
    if (participantsList.style.display === "none") {
      participantsList.style.display = "block";
      arrow.textContent = "▼";
    } else {
      participantsList.style.display = "none";
      arrow.textContent = "▶";
    }
  }

  // Make toggleParticipants available globally for onclick handlers
  window.toggleParticipants = toggleParticipants;

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create collapsible participants list HTML with mailto links
        let participantsHTML = "";
        const participantId = `participants-${name.replace(/\s+/g, '-').toLowerCase()}`;
        
        if (details.participants && details.participants.length > 0) {
          participantsHTML = `
            <div style="margin-top: 10px;">
              <div class="participants-header" onclick="toggleParticipants('${participantId}')" style="cursor: pointer; display: flex; align-items: center; gap: 5px;">
                <span class="dropdown-arrow" id="arrow-${participantId}">▶</span>
                <strong>Participants (${details.participants.length}):</strong>
              </div>
              <div id="${participantId}" class="participants-list" style="display: none; margin-top: 8px;">
                <ul style="margin: 0 0 0 18px; padding: 0;">
                  ${details.participants.map(
                    (email) =>
                      `<li style="margin-bottom: 2px; color: #444;">
                        <a href="mailto:${email}" style="color: #1565c0; text-decoration: underline;">${email}</a>
                      </li>`
                  ).join("")}
                </ul>
              </div>
            </div>
          `;
        } else {
          participantsHTML = `
            <div style="margin-top: 10px;">
              <div class="participants-header" onclick="toggleParticipants('${participantId}')" style="cursor: pointer; display: flex; align-items: center; gap: 5px;">
                <span class="dropdown-arrow" id="arrow-${participantId}">▶</span>
                <strong>Participants (0):</strong>
              </div>
              <div id="${participantId}" class="participants-list" style="display: none; margin-top: 8px;">
                <span style="color: #888;">No participants yet</span>
              </div>
            </div>
          `;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
