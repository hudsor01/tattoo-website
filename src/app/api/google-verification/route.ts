// Alternative Google Search Console verification via meta tag
export async function GET() {
  return new Response('google-site-verification: YOUR_VERIFICATION_CODE', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}