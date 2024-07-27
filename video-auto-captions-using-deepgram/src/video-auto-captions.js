// video-auto-captions.js

class VideoAutoCaptions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.render();
  }

  connectedCallback() {
    this.videoElement = this.shadowRoot.querySelector("video");
    this.captionsElement = this.shadowRoot.querySelector(".captions");

    this.videoElement.addEventListener("play", this.onVideoPlay.bind(this));
  }

  static get observedAttributes() {
    return ["src"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "src" && oldValue !== newValue) {
      // Ensure the video element is initialized
      if (this.videoElement) {
        this.videoElement.src = newValue;
      } else {
        // Wait for the component to be fully connected and elements initialized
        this.connectedCallback();
        this.videoElement.src = newValue;
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
        <style>
          .container {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          video {
            max-width: 100%;
          }
          .captions {
            margin-top: 10px;
            width: 100%;
            text-align: center;
            font-size: 16px;
            color: #000;
            background-color: #fff;
            padding: 5px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
        </style>
        <div class="container">
          <video controls crossorigin="anonymous"></video>
          <div class="captions"></div>
        </div>
      `;
  }

  async onVideoPlay(event) {
    event.preventDefault(); // Prevent the video from playing immediately

    // Extract audio and then play video
    const audioBlob = await this.extractAudioBlob(this.videoElement);
    const transcript = await this.transcribeAudio(audioBlob);
    this.displayCaptions(transcript);

    // Start playing the video
    this.videoElement.play();
  }

  extractAudioBlob(videoElement) {
    return new Promise((resolve, reject) => {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(videoElement);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);
      source.connect(audioContext.destination);

      const mediaRecorder = new MediaRecorder(destination.stream);
      let chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        resolve(audioBlob);
      };

      mediaRecorder.onerror = reject;

      mediaRecorder.start();
      videoElement.play();
      videoElement.onended = () => {
        mediaRecorder.stop();
      };
    });
  }

  async transcribeAudio(audioBlob) {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioFile = new Uint8Array(arrayBuffer);

    const response = await window.deepgram.transcription.preRecorded(
      { buffer: audioFile, mimetype: "audio/wav" },
      { punctuate: true }
    );

    const transcript = response.results.channels[0].alternatives[0].transcript;
    return transcript;
  }

  displayCaptions(transcript) {
    this.captionsElement.textContent = transcript;
  }
}

customElements.define("video-auto-captions", VideoAutoCaptions);
