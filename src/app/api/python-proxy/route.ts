
// src/app/api/python-proxy/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ten endpoint działa jako pośrednik (proxy) do Twojego backendu w Pythonie.
// Dzięki temu nie musisz wystawiać swojego serwera Pythona bezpośrednio do internetu
// i możesz bezpiecznie zarządzać komunikacją po stronie serwera Next.js.
export async function GET(request: Request) {
  // Pobieramy adres URL backendu Pythona ze zmiennych środowiskowych.
  // Pamiętaj, aby ustawić go w pliku .env!
  const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;

  if (!pythonBackendUrl) {
    return NextResponse.json(
      { message: 'PYTHON_BACKEND_URL is not configured in the .env file.' },
      { status: 500 }
    );
  }

  try {
    // Przekazujemy zapytanie do serwera w Pythonie.
    // W przyszłości możesz tutaj przekazywać dane z frontendu, np. w ciele zapytania POST.
    const response = await fetch(pythonBackendUrl, {
      method: 'GET', // Możesz zmienić na POST, jeśli potrzebujesz wysyłać dane
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify(body), // Przykładowe ciało zapytania POST
    });

    // Sprawdzamy, czy odpowiedź z Pythona jest poprawna.
    if (!response.ok) {
      const errorText = await response.text();
      // Próbujemy sparsować tekst błędu jako JSON, jeśli się nie uda, zwracamy tekst
      try {
        const errorJson = JSON.parse(errorText);
        return NextResponse.json(
          { message: 'Python backend returned an error', error: errorJson },
          { status: response.status }
        );
      } catch (e) {
         return NextResponse.json(
          { message: 'Python backend returned a non-JSON error', error: errorText },
          { status: response.status }
        );
      }
    }

    // Pobieramy odpowiedź JSON z serwera Pythona.
    const data = await response.json();

    // Odsyłamy odpowiedź z Pythona z powrotem do naszego frontendu.
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error proxying to Python backend:', error);
    return NextResponse.json(
      { message: 'Failed to connect to the Python backend.', error: error.message },
      { status: 502 } // 502 Bad Gateway to odpowiedni kod błędu dla problemów z proxy.
    );
  }
}
