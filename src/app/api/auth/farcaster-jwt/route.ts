import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { token, inviteCode } = await request.json();

    if (!token) {
      return Response.json({ error: 'No token provided' }, { status: 400 });
    }

    // Decode the JWT token and log for debugging
    const decoded = jwt.decode(token) as any;
    console.log('Decoded JWT:', decoded);
    
    if (!decoded) {
      return Response.json({ error: 'Failed to decode token' }, { status: 400 });
    }

    // Extract user data from the token - be flexible with the structure
    const user = {
      id: decoded.fid?.toString() || decoded.sub?.toString() || 'unknown',
      fid: decoded.fid || decoded.sub || Math.floor(Math.random() * 100000),
      username: decoded.username || decoded.preferred_username || decoded.name || `User${decoded.fid || decoded.sub || Math.floor(Math.random() * 1000)}`,
      profilePictureUrl: decoded.pfpUrl || decoded.picture || '',
      walletAddress: decoded.custodyAddress || decoded.wallet_address || undefined,
      inviteCode: inviteCode || undefined
    };

    console.log('Authenticated Farcaster user:', user);

    return Response.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error('Farcaster JWT auth error:', error);
    return Response.json({ 
      error: 'Authentication failed',
      success: false 
    }, { status: 500 });
  }
}