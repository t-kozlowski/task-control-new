
// src/app/api/ask-python/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handler(request: Request) {
  // Adres Twojego serwera Flask jest wpisany na stałe.
  // To jest najprostszy możliwy sposób.
  const flaskBackendUrl = 'http://127.0.0.1:5000/generate_summary';

  try {
    // Przekazujemy zapytanie do serwera w Pythonie.
    // Na razie jest to proste zapytanie GET, bez przekazywania ciała (body).
    const response = await fetch(flaskBackendUrl, {
      method: 'GET', // Możesz zmienić na 'POST', jeśli Twój Flask tego wymaga
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Jeśli serwer Pythona zwróci błąd, przekaż go dalej.
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: 'Błąd odpowiedzi z serwera Python', details: errorText },
        { status: response.status }
      );
    }

    // Jeśli wszystko jest w porządku, pobierz dane JSON i zwróć je do frontendu.
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    // Ten błąd wystąpi, jeśli serwer Pythona jest wyłączony lub wystąpił problem z siecią.
    console.error('Błąd połączenia z serwerem Python:', error);
    return NextResponse.json(
      { message: 'Nie udało się połączyć z backendem w Pythonie. Upewnij się, że jest uruchomiony.' },
      { status: 502 } // 502 Bad Gateway - standardowy błąd dla problemów z proxy
    );
  }
}

export { handler as GET, handler as POST };
