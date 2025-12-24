/**
 * Apollo SUPER GENIUS Intelligence - OpenAI Client Configuration
 * Revolutionary AI system with ML prediction, omniscient analysis, and autonomous capabilities
 */

import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const APOLLO_CONFIG = {
  model: 'gpt-4o', // The most powerful model - SUPER GENIUS intelligence with advanced function calling
  temperature: 0.7, // Optimized for genius-level creativity with consistent reasoning
  max_tokens: 3000, // Increased for complex multi-step SUPER GENIUS reasoning
  presence_penalty: 0.1, // Encourage diverse omniscient thinking
};

// For data extraction and analysis, use the mini model
export const APOLLO_MINI_CONFIG = {
  model: 'gpt-4o-mini', // Fast and cheap for simple tasks
  temperature: 0.1,
  max_tokens: 500,
};

export const APOLLO_VOICE_CONFIG = {
  tts_model: 'tts-1',
  voice: 'nova', // Friendly, professional female voice
  speed: 1.0,
};

