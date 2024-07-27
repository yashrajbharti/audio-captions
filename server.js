import express from "express";
import whisper from "node-whisper";

const app = express();
app.use(express.static("public"));
app.use(express.json());

app.post("/transcribe", async (req, res) => {
  try {
    const audioPath = "./audio/Television.wav";
    const transcript = await whisper(audioPath);
    res.json({ transcript });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something broke!");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
