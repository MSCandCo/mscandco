import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { session_id, message, module_id, lesson_id } = body;

  if (!message) {
    return NextResponse.json(
      { error: 'Missing required field: message' },
      { status: 400 }
    );
  }

  // Get or create session
  let currentSessionId = session_id;

  if (!currentSessionId) {
    const { data: newSession, error: sessionError } = await supabase
      .from('ai_tutor_sessions')
      .insert([{
        user_id: user.id,
        module_id,
        lesson_id,
        session_status: 'active'
      }])
      .select()
      .single();

    if (sessionError) {
      return NextResponse.json({ error: sessionError.message }, { status: 400 });
    }

    currentSessionId = newSession.id;
  }

  // In production, integrate with OpenAI GPT-4
  // For now, generate a helpful AI-like response
  const aiResponse = generateAIResponse(message);

  // Log the interaction
  const { error: logError } = await supabase
    .from('ai_tutor_sessions')
    .update({
      total_messages: supabase.rpc('increment', { column: 'total_messages' }),
      updated_at: new Date().toISOString()
    })
    .eq('id', currentSessionId);

  return NextResponse.json({
    success: true,
    session_id: currentSessionId,
    response: aiResponse,
    message: 'AI tutor response generated'
  });
}

function generateAIResponse(userMessage) {
  const message = userMessage.toLowerCase();

  // Simple pattern matching for common questions
  if (message.includes('copyright') || message.includes('rights')) {
    return "Copyright is crucial in music. Always ensure you have proper clearances for samples and covers. Use our AI verification tool to check for potential conflicts before distributing your music.";
  } else if (message.includes('distribute') || message.includes('release')) {
    return "To distribute your music, first ensure you have high-quality WAV files, proper metadata, and album artwork. Our platform handles distribution to all major DSPs including Spotify, Apple Music, and more.";
  } else if (message.includes('royalty') || message.includes('payment')) {
    return "Royalties are typically paid quarterly from streaming platforms. You can track your earnings in real-time on our analytics dashboard. We offer transparent reporting with no hidden fees.";
  } else if (message.includes('marketing') || message.includes('promote')) {
    return "Effective music marketing combines social media, playlist pitching, and email campaigns. Start building your audience early, engage consistently, and use data from our analytics to understand your fans.";
  } else {
    return "That's a great question! I'm here to help you with music distribution, copyright, marketing, and production. Could you provide more details about what you'd like to learn?";
  }
}

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const session_id = searchParams.get('session_id');

  let query = supabase
    .from('ai_tutor_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (session_id) {
    query = query.eq('id', session_id).single();
  } else {
    query = query.limit(20);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    sessions: session_id ? [data] : data,
    count: session_id ? 1 : data.length
  });
}
