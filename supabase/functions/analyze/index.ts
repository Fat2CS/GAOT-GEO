import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalysisResult {
  score: number;
  label: string;
  breakdown: {
    criteria: string;
    score: number;
    issue: string;
  }[];
  problems: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { article } = await req.json();

    if (!article || article.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'invalid_input', message: 'Article text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'auth_required', message: 'Please sign in to analyze articles' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'auth_required', message: 'Please sign in to analyze articles' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'profile_not_found', message: 'User profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const resetDate = new Date(profile.reset_date);

    if (now > resetDate) {
      await supabase
        .from('profiles')
        .update({
          analyses_count: 0,
          rewrites_count: 0,
          reset_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', user.id);

      profile.analyses_count = 0;
    }

    if (profile.plan === 'free') {
      if (profile.analyses_count >= 5) {
        return new Response(
          JSON.stringify({ error: 'upgrade_required', message: 'Free plan limit reached. Upgrade to Pro for unlimited analyses.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentRequests } = await supabaseAdmin
        .from('ip_rate_limits')
        .select('id')
        .eq('ip_address', clientIp)
        .eq('endpoint', 'analyze')
        .gte('created_at', oneDayAgo);

      if (recentRequests && recentRequests.length >= 20) {
        return new Response(
          JSON.stringify({
            error: 'rate_limit',
            message: 'Too many requests from this IP. Please try again later or upgrade to Pro.'
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    await supabaseAdmin
      .from('ip_rate_limits')
      .insert({
        ip_address: clientIp,
        user_id: user.id,
        endpoint: 'analyze',
      });

    await supabase
      .from('profiles')
      .update({ analyses_count: profile.analyses_count + 1 })
      .eq('id', user.id);

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const analysisPrompt = `You are a GEO (Generative Engine Optimization) expert. Analyze the following article for AI search visibility on platforms like ChatGPT, Perplexity, and Gemini.

Score the article out of 100 based on these 5 criteria (20 points each):
1. Direct Answer: Does it provide a clear, concise answer in the first paragraph?
2. Structure: Is it well-structured with headers, bullet points, and FAQ sections?
3. Citations: Does it include sources, data, and citations that AI can reference?
4. Freshness: Does it mention recent dates, updates, or current information?
5. Clarity: Is it written clearly without fluff, directly answering questions?

Return a JSON object with this structure:
{
  "score": 34,
  "label": "Not AI-friendly" | "Needs work" | "AI-ready",
  "breakdown": [
    {"criteria": "Direct Answer", "score": 4, "issue": "No clear answer in first paragraph"},
    {"criteria": "Structure", "score": 8, "issue": "Missing headers and FAQ"},
    {"criteria": "Citations", "score": 2, "issue": "No sources or data"},
    {"criteria": "Freshness", "score": 10, "issue": "No recent dates"},
    {"criteria": "Clarity", "score": 10, "issue": "Too much fluff"}
  ],
  "problems": [
    "No direct answer in first paragraph",
    "Missing FAQ section",
    "No sources or citations"
  ]
}

The label should be:
- "Not AI-friendly" for scores 0-40
- "Needs work" for scores 41-70
- "AI-ready" for scores 71-100

Provide only the JSON response, no additional text.`;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: analysisPrompt,
        messages: [
          {
            role: 'user',
            content: `Analyze this article for GEO:\n\n${article}`,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.text();
      console.error('Anthropic API error:', errorData);
      throw new Error('Failed to analyze article with Claude API');
    }

    const anthropicData = await anthropicResponse.json();
    let analysisText = anthropicData.content[0].text;

    analysisText = analysisText.trim();
    if (analysisText.startsWith('```json')) {
      analysisText = analysisText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (analysisText.startsWith('```')) {
      analysisText = analysisText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const analysisResult: AnalysisResult = JSON.parse(analysisText.trim());

    return new Response(JSON.stringify(analysisResult), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in analyze function:', error);
    return new Response(
      JSON.stringify({ error: 'internal_error', message: error.message || 'Failed to analyze article' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
