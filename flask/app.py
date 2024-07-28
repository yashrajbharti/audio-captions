from flask import Flask, render_template, request, jsonify
import moviepy.editor as mp
import speech_recognition as sr
from pydub import AudioSegment
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def transcribe_audio(file_path):
    recognizer = sr.Recognizer()
    audio = AudioSegment.from_file(file_path)
    wav_path = file_path.replace('.mp4', '.wav')
    audio.export(wav_path, format='wav')

    with sr.AudioFile(wav_path) as source:
        audio_data = recognizer.record(source)
    try:
        text = recognizer.recognize_google(audio_data)
        return text
    except sr.UnknownValueError:
        return "Could not understand audio"
    except sr.RequestError as e:
        return f"Could not request results; {e}"

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'})
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'})

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(file_path)

        text = transcribe_audio(file_path)

        os.remove(file_path)

        return jsonify({'transcription': text})

    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
