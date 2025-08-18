import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle Farcaster webhooks
    console.log('Farcaster webhook received:', body);
    
    // You can handle different webhook events here
    // For example: user interactions, notifications, etc.
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 });
  }
}

export async function GET() {
  // Health check for the webhook
  return NextResponse.json({ status: 'ok' });
}