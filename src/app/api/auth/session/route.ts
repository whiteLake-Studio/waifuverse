import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // For now, just return empty session since we're using localStorage
  // In production, you'd check server-side session/cookies
  return Response.json({
    user: null,
    success: false
  });
}