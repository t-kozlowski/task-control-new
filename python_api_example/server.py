# python_api_example/server.py
import os
import base64
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Wczytaj zmienne środowiskowe z pliku .env
load_dotenv()

app = Flask(__name__)
# Włącz CORS, aby umożliwić zapytania z Twojej aplikacji Next.js
CORS(app)

# Sprawdź, czy klucz API OpenAI jest ustawiony
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("Nie znaleziono klucza OPENAI_API_KEY w zmiennych środowiskowych.")

client = OpenAI(api_key=api_key)

# Utwórz tymczasowy katalog do przechowywania plików audio
TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

@app.route('/transcribe_audio', methods=['POST'])
def transcribe_audio():
    """
    Endpoint do transkrypcji pliku audio przy użyciu API OpenAI Whisper.
    Oczekuje danych w formacie JSON z kluczem 'audioDataUri'.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    audio_data_uri = data.get('audioDataUri')

    if not audio_data_uri:
        return jsonify({"error": "Missing audioDataUri in request body"}), 400

    try:
        # Dekoduj dane audio z formatu Data URI
        header, encoded = audio_data_uri.split(',', 1)
        audio_data = base64.b64decode(encoded)
        
        # Zapisz plik audio tymczasowo na serwerze
        # OpenAI potrzebuje dostępu do pliku, a nie surowych bajtów w tym przypadku
        temp_filename = f"{uuid.uuid4()}.webm"
        temp_filepath = os.path.join(TEMP_DIR, temp_filename)
        
        with open(temp_filepath, 'wb') as f:
            f.write(audio_data)

        # Wyślij plik do API OpenAI Whisper w celu transkrypcji
        with open(temp_filepath, 'rb') as audio_file:
            transcription = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text" # Możesz zmienić na 'json', 'verbose_json' itp.
            )
        
        # Usuń tymczasowy plik po przetworzeniu
        os.remove(temp_filepath)
            
        # Zwróć wynik transkrypcji
        return jsonify({"transcript": transcription})

    except Exception as e:
        print(f"Error during transcription: {e}")
        # Usuń tymczasowy plik w razie błędu
        if 'temp_filepath' in locals() and os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/ai_help', methods=['GET'])
def get_ai_help():
    """
    Przykładowy endpoint, który może być użyty do generowania podpowiedzi AI.
    """
    # Tutaj możesz dodać logikę do generowania podpowiedzi
    # np. na podstawie danych z bazy, innych API itp.
    # W tym przykładzie zwracamy statyczną odpowiedź.
    
    mock_response = {
        "message": (
            "#### Sentyment Projektu: Pozytywny ####\\n"
            "**Uzasadnienie:** Większość kluczowych zadań jest w toku, a ostatnie punkty akcji zostały zamknięte.\\n\\n"
            "#### Proponowana Agenda: ####\\n"
            "- Omówienie statusu zadania **'Integracja z API płatności'** - czy potrzebne jest wsparcie?\\n"
            "- Potwierdzenie terminów dla sprintu #3.\\n\n"
            "#### Pytania do Zadania: ####\\n"
            "- **Do Ani (UX):** Czy mamy już finalne makiety dla nowego profilu użytkownika?\\n"
            "- **Do Bartka (Backend):** Jakie są największe wyzwania związane z refaktoryzacją modułu X?\\n\n"
            "#### Pozytywy do Podkreślenia: ####\\n"
            "- Gratulacje dla zespołu za ukończenie wdrożenia na środowisko testowe przed terminem!\\n"
        )
    }
    return jsonify(mock_response)


if __name__ == '__main__':
    # Uruchom serwer na porcie 5000, dostępny w sieci lokalnej
    app.run(host='0.0.0.0', port=5000, debug=True)
