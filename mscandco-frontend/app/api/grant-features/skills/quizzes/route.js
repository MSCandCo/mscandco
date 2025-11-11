import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);

  const lesson_id = searchParams.get('lesson_id');
  const module_id = searchParams.get('module_id');

  let query = supabase
    .from('learning_quizzes')
    .select('*');

  if (lesson_id) {
    query = query.eq('lesson_id', lesson_id);
  }

  if (module_id) {
    query = query.eq('module_id', module_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    quizzes: data,
    count: data.length
  });
}

export async function POST(request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { quiz_id, answers } = body;

  if (!quiz_id || !answers) {
    return NextResponse.json(
      { error: 'Missing required fields: quiz_id, answers' },
      { status: 400 }
    );
  }

  // Get quiz details
  const { data: quiz, error: quizError } = await supabase
    .from('learning_quizzes')
    .select('*, correct_answers')
    .eq('id', quiz_id)
    .single();

  if (quizError) {
    return NextResponse.json({ error: quizError.message }, { status: 400 });
  }

  // Calculate score
  const correctAnswers = quiz.correct_answers || {};
  let correctCount = 0;
  const totalQuestions = Object.keys(correctAnswers).length;

  for (const [questionId, userAnswer] of Object.entries(answers)) {
    if (correctAnswers[questionId] === userAnswer) {
      correctCount++;
    }
  }

  const scorePercentage = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const isPassing = scorePercentage >= (quiz.passing_score || 70);

  // Save attempt
  const { data: attempt, error: attemptError } = await supabase
    .from('quiz_attempts')
    .insert([{
      user_id: user.id,
      quiz_id,
      score_percentage: scorePercentage,
      answers_submitted: answers,
      is_passing: isPassing,
      attempt_number: 1 // Will be calculated properly in production
    }])
    .select()
    .single();

  if (attemptError) {
    return NextResponse.json({ error: attemptError.message }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    attempt,
    score: scorePercentage,
    correct_answers: correctCount,
    total_questions: totalQuestions,
    is_passing: isPassing,
    message: isPassing ? 'Congratulations! You passed the quiz.' : 'Keep practicing! You can retake the quiz.'
  });
}
