# python_api_example/server.py
import os
import base64
import uuid
import json
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
        temp_filename = f"{uuid.uuid4()}.webm"
        temp_filepath = os.path.join(TEMP_DIR, temp_filename)
        
        with open(temp_filepath, 'wb') as f:
            f.write(audio_data)

        # Wyślij plik do API OpenAI Whisper w celu transkrypcji
        with open(temp_filepath, 'rb') as audio_file:
            transcription_response = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
        
        os.remove(temp_filepath)
        return jsonify({"transcript": transcription_response})

    except Exception as e:
        print(f"Error during transcription: {e}")
        if 'temp_filepath' in locals() and os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/redact_notes', methods=['POST'])
def redact_notes_endpoint():
    """
    Endpoint do redagowania notatek przy użyciu modelu językowego OpenAI.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    notes = data.get('notes')

    if not notes:
        return jsonify({"error": "Missing 'notes' in request body"}), 400

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Jesteś asystentem AI, który specjalizuje się w tworzeniu profesjonalnych notatek ze spotkań. Twoim zadaniem jest przekształcenie surowych, nieformalnych notatek w zwięzłe i dobrze zorganizowane podsumowanie."},
                {"role": "user", "content": f"Zredaguj następujące notatki: \n\n{notes}"}
            ]
        )
        
        redacted_summary = completion.choices[0].message.content
        return jsonify({"redactedSummary": redacted_summary})

    except Exception as e:
        print(f"Error during note redaction: {e}")
        return jsonify({"error": f"An error occurred during note redaction: {str(e)}"}), 500

@app.route('/project_summary', methods=['POST'])
def project_summary():
    """
    Generuje strategiczne podsumowanie projektu na podstawie zadań i dyrektyw.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    tasks = data.get('tasks')
    directives = data.get('directives')

    if not tasks:
        return jsonify({"error": "Missing 'tasks' in request body"}), 400
    
    prompt_content = f"""
    Jesteś głównym analitykiem strategicznym AI w projekcie. Twoim zadaniem jest dostarczenie zwięzłego, ale wnikliwego podsumowania dla zarządu.

    Przeanalizuj poniższą listę zadań oraz dyrektywy strategiczne.

    Dane wejściowe:
    - Zadania: {json.dumps(tasks)}
    - Dyrektywy: {json.dumps(directives)}

    Twoje zadania:
    1. Wygeneruj Podsumowanie (summary): Stwórz 2-3 zdaniowe podsumowanie ogólnego stanu projektu.
    2. Zidentyfikuj Ryzyka (risks): Wskaż 2-3 najważniejsze ryzyka.
    3. Zaproponuj Rekomendacje (recommendations): Podaj 2-3 konkretne, możliwe do wdrożenia rekomendacje.

    Odpowiedź zwróć w formacie JSON z kluczami: "summary", "risks", "recommendations".
    """

    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Zwracasz odpowiedzi w formacie JSON."},
                {"role": "user", "content": prompt_content}
            ],
            response_format={"type": "json_object"}
        )
        response_data = json.loads(completion.choices[0].message.content)
        return jsonify(response_data)

    except Exception as e:
        print(f"Error during project summary: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route('/ai_notification', methods=['POST'])
def ai_notification():
    """
    Generuje powiadomienie AI na podstawie zadań i dyrektywy.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    tasks = data.get('tasks')
    directive = data.get('directive')

    if not tasks:
        return jsonify({"error": "Missing 'tasks' in request body"}), 400

    prompt_content = f"""
    Jesteś strategicznym asystentem AI. Przeanalizuj listę zadań i dyrektywę.
    
    Zadania: {json.dumps(tasks)}
    Dyrektywa: {directive}
    
    Wygeneruj powiadomienie (1-2 zdania) i skategoryzuj je jako 'risk', 'positive', lub 'suggestion'.
    Jeśli masz pomysł na zupełnie NOWE zadanie inspirowane dyrektywą, dodaj je w polu 'newTaskSuggestion' z polami 'name' i 'description'.

    Odpowiedź zwróć w formacie JSON z kluczami: "notification", "type", "newTaskSuggestion" (opcjonalnie).
    """

    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Zwracasz odpowiedzi w formacie JSON."},
                {"role": "user", "content": prompt_content}
            ],
            response_format={"type": "json_object"}
        )
        response_data = json.loads(completion.choices[0].message.content)
        return jsonify(response_data)

    except Exception as e:
        print(f"Error during AI notification: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/suggest_task_description', methods=['POST'])
def suggest_task_description():
    """
    Sugeruje opis zadania na podstawie jego nazwy.
    """
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400
    
    data = request.get_json()
    task_name = data.get('taskName')

    if not task_name:
        return jsonify({"error": "Missing 'taskName' in request body"}), 400

    prompt_content = f"""
    Jesteś ekspertem w zarządzaniu projektami. Przekształć nazwę zadania w szczegółowy, profesjonalny opis.
    Nazwa zadania: "{task_name}"
    
    Odpowiedź zwróć w formacie JSON z kluczem: "suggestedDescription".
    """

    try:
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Zwracasz odpowiedzi w formacie JSON."},
                {"role": "user", "content": prompt_content}
            ],
            response_format={"type": "json_object"}
        )
        response_data = json.loads(completion.choices[0].message.content)
        return jsonify(response_data)

    except Exception as e:
        print(f"Error during task description suggestion: {e}")
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route('/suggest_burndown_values', methods=['POST'])
def suggest_burndown_values():
    """
    Sugeruje wartości dla wykresu spalania.
    """
    # Ta funkcja wymagałaby bardziej złożonej logiki,
    # np. analizy dat w zadaniach, więc na razie zwraca mockowe dane.
    # W pełnej implementacji tutaj znalazłby się kod analizujący daty z 'allTasks'.
    mock_response = {
      "suggestedActual": 15,
      "suggestedIdeal": 12,
      "reasoning": "Sugerowane wartości na podstawie mockowego endpointu w Pythonie."
    }
    return jsonify(mock_response)

@app.route('/meeting_prep', methods=['POST'])
def meeting_prep():
    """
    Generuje przygotowanie do spotkania.
    """
    # Podobnie jak wyżej, to jest przykład, który można rozbudować.
    mock_response = {
        "overallSentiment": "neutral",
        "sentimentReasoning": "Przykładowy sentyment z serwera Pythona.",
        "discussionPoints": ["Omówienie statusu zadania X", "Dyskusja nad blokadami w zadaniu Y"],
        "questionsToAsk": ["Jakie są główne przeszkody?", "Czy potrzebujecie dodatkowych zasobów?"],
        "talkingPoints": ["Gratulacje dla zespołu za ukończenie sprintu!"]
    }
    return jsonify(mock_response)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
