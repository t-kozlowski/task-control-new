// src/app/api/proxy/[...slug]/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Ten endpoint działa jako uniwersalny pośrednik (proxy) do Twojego backendu w Pythonie.
// Każde zapytanie do /api/proxy/sciezka zostanie przekazane do PYTHON_BACKEND_URL/sciezka.
async function handler(request: Request, { params }: { params: { slug: string[] } }) {
  const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;

  if (!pythonBackendUrl) {
    return NextResponse.json(
      { message: 'PYTHON_BACKEND_URL is not configured in the .env file.' },
      { status: 500 }
    );
  }

  try {
    const path = params.slug.join('/');
    const targetUrl = `${pythonBackendUrl}/${path}`;
    
    // Przekazujemy zapytanie do serwera w Pythonie, włącznie z metodą, nagłówkami i ciałem.
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: request.method !== 'GET' && request.body ? request.body : undefined,
      duplex: 'half',
    } as RequestInit);

    if (!response.ok) {
      const errorText = await response.text();
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

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Error proxying to Python backend:', error);
    return NextResponse.json(
      { message: 'Failed to connect to the Python backend.', error: error.message },
      { status: 502 } // 502 Bad Gateway
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE };