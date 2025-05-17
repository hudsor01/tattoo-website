import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface SpamCheckRequest {
  text: string;
  type: 'contact' | 'booking' | 'message';
  ip?: string;
  email?: string;
}

// Define response interface
interface SpamDetectionResult {
  isSpam: boolean;
  score: number;
  reason: string;
}

// Define error response interface
interface ErrorResponse {
  error: string;
}

serve(async (req: Request) => {
  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } },
    );

    // Get request data
    const { text, type, ip, email } = (await req.json()) as SpamCheckRequest;

    if (!text || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' } as ErrorResponse),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400,
        },
      );
    }

    // Check for common spam patterns
    const spamDetected = await detectSpam(supabaseClient, text, type, ip, email);

    // Log the check
    await supabaseClient.from('SpamCheckLog').insert({
      text_sample: text.substring(0, 100),
      type,
      ip_address: ip,
      email,
      is_spam: spamDetected.isSpam,
      spam_score: spamDetected.score,
      reason: spamDetected.reason,
    });

    return new Response(
      JSON.stringify({
        isSpam: spamDetected.isSpam,
        score: spamDetected.score,
        reason: spamDetected.reason,
      } as SpamDetectionResult),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage } as ErrorResponse), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Function to detect spam
async function detectSpam(
  supabase: ReturnType<typeof createClient>,
  text: string,
  type: string,
  ip?: string,
  email?: string,
) {
  let score = 0;
  const reason = [];

  // Check for common spam keywords
  const spamKeywords = [
    'viagra',
    'cialis',
    'casino',
    'lottery',
    'prize',
    'winner',
    'free money',
    'make money fast',
    'bitcoin investment',
    'enlarge',
    'weight loss',
    'buy now',
    'cheap',
  ];

  const textLower = text.toLowerCase();

  for (const keyword of spamKeywords) {
    if (textLower.includes(keyword)) {
      score += 20;
      reason.push(`Contains spam keyword: ${keyword}`);
    }
  }

  // Check for excessive URLs
  const urlCount = (textLower.match(/https?:\/\//g) || []).length;
  if (urlCount > 3) {
    score += urlCount * 10;
    reason.push(`Contains ${urlCount} URLs`);
  }

  // Check IP address reputation if provided
  if (ip) {
    // Check if IP has been flagged before
    const { data: ipHistory, error } = await supabase
      .from('SpamCheckLog')
      .select('is_spam')
      .eq('ip_address', ip)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && ipHistory.length > 0) {
      const spamCount: number = ipHistory.filter((h: { is_spam: boolean }) => h.is_spam).length;
      if (spamCount >= 3) {
        score += 30;
        reason.push('IP address previously flagged multiple times');
      }
    }
  }

  // Check email reputation if provided
  if (email) {
    // Check if the email has been flagged before
    const { data: emailHistory, error } = await supabase
      .from('SpamCheckLog')
      .select('is_spam')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!error && emailHistory.length > 0) {
      const spamCount: number = emailHistory.filter((h: { is_spam: boolean }) => h.is_spam).length;
      if (spamCount >= 2) {
        score += 25;
        reason.push('Email previously flagged multiple times');
      }
    }

    // Check for disposable email domains
    const disposableDomains = [
      'mailinator.com',
      'guerrillamail.com',
      'tempmail.com',
      'temp-mail.org',
      'disposablemail.com',
      'trashmail.com',
      'yopmail.com',
      'getnada.com',
    ];

    if (email.includes('@')) {
      const emailDomain = email.split('@')[1];
      if (emailDomain && disposableDomains.includes(emailDomain)) {
        score += 40;
        reason.push('Disposable email domain detected');
      }
    }
  }

  // Type-specific checks
  if (type === 'contact' && text.length < 15) {
    score += 15;
    reason.push('Suspiciously short contact message');
  }

  if (type === 'booking' && textLower.includes('tattoo') === false) {
    score += 10;
    reason.push("Booking doesn't mention tattoo");
  }

  // Return result
  return {
    isSpam: score >= 50,
    score,
    reason: reason.join('; '),
  };
}
