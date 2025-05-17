import crypto from 'crypto';

/**
 * Verify the signature from Google Cloud webhooks
 * @param signature The signature from the X-Goog-Signature header
 * @param timestamp The timestamp from the X-Goog-Channel-Token header
 * @param body The raw body of the request
 * @returns A boolean indicating if the signature is valid
 */
export async function verifyGoogleCloudSignature(
  signature: string,
  timestamp: string,
  body: string
): Promise<boolean> {
  try {
    // Get the secret from environment variables
    const secret = process.env.GOOGLE_WEBHOOK_SECRET;

    if (!secret) {
      console.error('GOOGLE_WEBHOOK_SECRET is not configured');
      return false;
    }

    // Create a string to sign
    const stringToSign = `${timestamp}${body}`;

    // Create the signature using HMAC SHA-256
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(stringToSign);
    const expectedSignature = hmac.digest('hex');

    // Compare the signatures
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    console.error('Error verifying Google Cloud signature:', error);
    return false;
  }
}
