// src/app/api/proxy/[...slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handler(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const slug = pathname.replace('/api/proxy', '');
  
  const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;
  if (!pythonBackendUrl) {
    return NextResponse.json(
      { error: 'PYTHON_BACKEND_URL is not defined in the environment variables.' },
      { status: 500 }
    );
  }

  const targetUrl = `${pythonBackendUrl}${slug}${search}`;
  
  try {
    const pythonResponse = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers.get('Content-Type') || 'application/json',
      },
      body: req.method !== 'GET' ? req.body : undefined,
      // @ts-ignore
      duplex: 'half', // Required for streaming request bodies
    });

    // Create a new response to stream the body back to the client
    const responseHeaders = new Headers(pythonResponse.headers);
    responseHeaders.set('Content-Type', pythonResponse.headers.get('Content-Type') || 'application/json');

    return new NextResponse(pythonResponse.body, {
      status: pythonResponse.status,
      statusText: pythonResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json(
      { error: 'Error connecting to the Python backend.' },
      { status: 502 } // Bad Gateway
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
