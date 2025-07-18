
// src/app/api/test/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // This is a simple test endpoint.
    // It returns a static JSON response to verify that the API routing is working.
    const data = {
      message: "Wbudowane API w Next.js działa!",
      timestamp: new Date().toISOString(),
      status: "OK",
    };

    return NextResponse.json(data);
  } catch (error: any) {
    // Basic error handling for the test endpoint
    return NextResponse.json(
      { message: 'Wystąpił błąd w testowym API', error: error.message },
      { status: 500 }
    );
  }
}
