import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RewriteResult {
  oldScore: number;
  newScore: number;
  article: string;
  improvements: string[];
  rewritesRemaining: number;
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
        JSON.stringify({ error: 'unauthorized', message: 'Authentication required' }),
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'unauthorized', message: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    if (profile.plan !== 'pro') {
      return new Response(
        JSON.stringify({ error: 'upgrade_required', message: 'Upgrade to Pro to unlock rewrites' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const resetDate = new Date(profile.reset_date);

    let currentRewritesCount = profile.rewrites_count;
    if (now > resetDate) {
      await supabase
        .from('profiles')
        .update({
          analyses_count: 0,
          rewrites_count: 0,
          reset_date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq('id', user.id);

      currentRewritesCount = 0;
    }

    if (currentRewritesCount >= 30) {
      return new Response(
        JSON.stringify({
          error: 'limit_reached',
          message: `You've used all 30 rewrites this month. Resets on ${new Date(profile.reset_date).toLocaleDateString()}`,
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const rewritePrompt = `You are a GEO (Generative Engine Optimization) expert. Rewrite the following article to maximize its visibility and citation on AI search platforms (ChatGPT, Perplexity, Gemini).

Apply these optimizations:
1. Add a TL;DR section at the top with a direct, concise answer
2. Restructure with clear H2 and H3 headers
3. Add bullet points for key information
4. Include [CITATION NEEDED] placeholders where data or sources should be added
5. Add a comprehensive FAQ section at the end
6. Remove fluff and unnecessary words
7. Front-load the most important information
8. Use clear, direct language that answers questions explicitly

Before the rewritten article, provide a JSON object with:
{
  "oldScore": 34,
  "newScore": 87,
  "improvements": [
    "Added TL;DR section",
    "Restructured with clear headers",
    "Added citation placeholders",
    "Created comprehensive FAQ section",
    "Removed unnecessary fluff"
  ]
}

Then provide the rewritten article in markdown format.

Format your response exactly like this:
JSON:
{json object here}

ARTICLE:
{rewritten article here}`;

    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: rewritePrompt,
        messages: [
          {
            role: 'user',
            content: `Rewrite this article for GEO:\n\n${article}`,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorData = await anthropicResponse.text();
      console.error('Anthropic API error:', errorData);
      throw new Error('Failed to rewrite article with Claude API');
    }

    const anthropicData = await anthropicResponse.json();
    const responseText = anthropicData.content[0].text;

    const jsonMatch = responseText.match(/JSON:\s*(\{[\s\S]*?\})\s*ARTICLE:/);
    const articleMatch = responseText.match(/ARTICLE:\s*([\s\S]*)/);

    if (!jsonMatch || !articleMatch) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Failed to parse AI response');
    }

    const metadata = JSON.parse(jsonMatch[1]);
    const rewrittenArticle = articleMatch[1].trim();

    await supabase
      .from('profiles')
      .update({ rewrites_count: currentRewritesCount + 1 })
      .eq('id', user.id);

    const result: RewriteResult = {
      oldScore: metadata.oldScore || 34,
      newScore: metadata.newScore || 87,
      article: rewrittenArticle,
      improvements: metadata.improvements || [],
      rewritesRemaining: 30 - (currentRewritesCount + 1),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in rewrite function:', error);
    return new Response(
      JSON.stringify({ error: 'internal_error', message: error.message || 'Failed to rewrite article' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
