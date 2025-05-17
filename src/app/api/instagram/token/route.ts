import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get the Instagram access token from environment variable
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({ error: 'Instagram access token not configured' }, { status: 500 });
    }

    // Check if user is authenticated to protect token for admin-only views
    // For public pages, we won't need this check
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   );
    // }

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error fetching Instagram token:', error);
    return NextResponse.json({ error: 'Failed to fetch Instagram token' }, { status: 500 });
  }
}
