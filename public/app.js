async function fetchTranscript() {
  try {
    const response = await fetch("/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch transcript");
    }

    const data = await response.json();
    document.querySelector("p").textContent = data.transcript; // Display the srt content
  } catch (error) {
    console.error("Error fetching transcript:", error);
    document.querySelector("p").textContent = "Error fetching transcript.";
  }
}

fetchTranscript();
