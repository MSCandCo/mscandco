/**
 * GRANT FEATURES TOOLS FOR MCP SERVER
 *
 * 5 comprehensive grant-focused feature sets:
 * 1. AI Copyright Verification
 * 2. Sustainability & Carbon Tracking
 * 3. Accessibility Features
 * 4. Open Data Platform
 * 5. Skills Development & AI Tutoring
 */

export const GRANT_FEATURES_TOOLS = [
  // ===================================================================
  // 1. AI COPYRIGHT VERIFICATION TOOLS
  // ===================================================================
  {
    name: "verify_copyright",
    description: "Initiate AI-powered copyright verification for a release. Automatically checks against major music catalogs (Spotify, Apple Music, YouTube, SoundExchange) for potential conflicts using audio fingerprinting and melody pattern matching. Essential for grant applications demonstrating social responsibility and artist protection.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release to verify"
        },
        audio_file_url: {
          type: "string",
          description: "Optional: URL to audio file for advanced fingerprinting analysis"
        },
        lyrics_text: {
          type: "string",
          description: "Optional: Lyrics text for similarity checking"
        },
        composition_data: {
          type: "object",
          description: "Optional: Composition metadata (key, tempo, chord progressions)"
        }
      },
      required: ["release_id"]
    }
  },
  {
    name: "get_copyright_status",
    description: "Get the current status of copyright verification for a release. Returns verification status, confidence scores, potential conflicts detected, and required actions.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        }
      },
      required: ["release_id"]
    }
  },
  {
    name: "submit_copyright_clearance",
    description: "Submit license clearance documentation for a detected copyright issue. Used when covering songs, sampling, or interpolating existing works.",
    inputSchema: {
      type: "object",
      properties: {
        verification_id: {
          type: "string",
          description: "UUID of the copyright verification"
        },
        clearance_type: {
          type: "string",
          enum: ["sample", "cover", "interpolation", "composition", "mechanical"],
          description: "Type of clearance needed"
        },
        original_work_title: {
          type: "string",
          description: "Title of the original work"
        },
        original_work_artist: {
          type: "string",
          description: "Artist/composer of original work"
        },
        license_details: {
          type: "object",
          description: "License information (type, reference number, territory, fees)"
        }
      },
      required: ["verification_id", "clearance_type", "original_work_title", "original_work_artist"]
    }
  },

  // ===================================================================
  // 2. SUSTAINABILITY & CARBON TRACKING TOOLS
  // ===================================================================
  {
    name: "calculate_carbon_footprint",
    description: "Calculate the carbon footprint of music streaming for a release over a specified period. Uses DIMPACT 2024 industry methodology (0.055 kWh per stream, grid carbon intensity). Essential for ESG/climate tech grant narratives.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        },
        period_start: {
          type: "string",
          format: "date",
          description: "Start date for calculation (YYYY-MM-DD)"
        },
        period_end: {
          type: "string",
          format: "date",
          description: "End date for calculation (YYYY-MM-DD)"
        }
      },
      required: ["release_id", "period_start", "period_end"]
    }
  },
  {
    name: "get_carbon_data",
    description: "Retrieve carbon footprint data for a release. Returns total carbon emissions, per-stream metrics, platform breakdown, and offset status.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        }
      },
      required: ["release_id"]
    }
  },
  {
    name: "get_sustainability_profile",
    description: "Get user's sustainability profile including total carbon footprint, offsets purchased, commitment level (monitoring/offsetting/carbon_neutral), and achievements.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        }
      }
    }
  },
  {
    name: "update_sustainability_settings",
    description: "Update sustainability commitment and auto-offset settings. Enable auto-offsetting with monthly budget.",
    inputSchema: {
      type: "object",
      properties: {
        commitment_level: {
          type: "string",
          enum: ["none", "monitoring", "offsetting", "carbon_neutral", "carbon_negative"],
          description: "Sustainability commitment level"
        },
        auto_offset_enabled: {
          type: "boolean",
          description: "Enable automatic carbon offsetting"
        },
        offset_budget_monthly: {
          type: "number",
          description: "Monthly budget for carbon offsets (GBP)"
        },
        offset_provider: {
          type: "string",
          enum: ["greenspark", "ecologi", "goldstandard"],
          description: "Preferred carbon offset provider"
        }
      }
    }
  },
  {
    name: "purchase_carbon_offset",
    description: "Purchase carbon offsets for releases. Integrates with Greenspark, Ecologi, or Gold Standard providers.",
    inputSchema: {
      type: "object",
      properties: {
        amount_kg: {
          type: "number",
          description: "Amount of CO2 to offset in kilograms"
        },
        provider: {
          type: "string",
          enum: ["greenspark", "ecologi", "goldstandard"],
          description: "Carbon offset provider"
        },
        release_id: {
          type: "string",
          description: "Optional: Specific release to offset"
        }
      },
      required: ["amount_kg", "provider"]
    }
  },

  // ===================================================================
  // 3. ACCESSIBILITY FEATURES TOOLS
  // ===================================================================
  {
    name: "generate_accessibility_content",
    description: "Generate AI-powered accessibility content for releases. Supports audio descriptions, lyric transcriptions, translations (94 languages), and instrumental descriptions. Critical for EU grant compliance (WCAG).",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        },
        content_type: {
          type: "string",
          enum: ["audio_description", "lyric_transcription", "lyric_translation", "sign_language_video", "instrumental_description", "mood_description"],
          description: "Type of accessibility content to generate"
        },
        language_code: {
          type: "string",
          description: "ISO 639-1 language code (en, es, fr, de, etc.)"
        },
        target_wcag_level: {
          type: "string",
          enum: ["A", "AA", "AAA"],
          description: "Target WCAG compliance level (default: AA)"
        }
      },
      required: ["release_id", "content_type", "language_code"]
    }
  },
  {
    name: "get_accessibility_content",
    description: "List all accessibility content for a release. Returns transcriptions, translations, sign language videos, and WCAG compliance status.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        },
        content_type: {
          type: "string",
          description: "Optional: Filter by content type"
        },
        language_code: {
          type: "string",
          description: "Optional: Filter by language"
        }
      },
      required: ["release_id"]
    }
  },
  {
    name: "get_accessibility_compliance",
    description: "Get WCAG accessibility compliance status for a release. Shows which accessibility features are present and current compliance level (A/AA/AAA).",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        }
      },
      required: ["release_id"]
    }
  },
  {
    name: "request_accessibility_service",
    description: "Request professional accessibility services (human sign language interpreter, professional translator, audio description narrator).",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        },
        service_type: {
          type: "string",
          enum: ["sign_language_video", "professional_translation", "audio_description", "braille_notation"],
          description: "Type of professional service needed"
        },
        target_language: {
          type: "string",
          description: "Target language (for translations)"
        },
        deadline: {
          type: "string",
          format: "date",
          description: "Optional: Requested completion date"
        },
        notes: {
          type: "string",
          description: "Additional requirements or notes"
        }
      },
      required: ["release_id", "service_type"]
    }
  },

  // ===================================================================
  // 4. OPEN DATA PLATFORM TOOLS
  // ===================================================================
  {
    name: "query_open_data_metrics",
    description: "Query anonymized industry metrics and streaming trends. Available to public for research. Supports Horizon Europe open science requirements.",
    inputSchema: {
      type: "object",
      properties: {
        period_type: {
          type: "string",
          enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
          description: "Time period granularity"
        },
        period_start: {
          type: "string",
          format: "date",
          description: "Start date"
        },
        period_end: {
          type: "string",
          format: "date",
          description: "End date"
        },
        region: {
          type: "string",
          description: "Optional: Filter by region (north_america, europe, asia, etc.)"
        },
        genre: {
          type: "string",
          description: "Optional: Filter by music genre"
        }
      },
      required: ["period_type", "period_start", "period_end"]
    }
  },
  {
    name: "list_research_datasets",
    description: "Browse available research datasets for download. Includes streaming trends, genre performance, anonymized revenue data. Free for registered researchers.",
    inputSchema: {
      type: "object",
      properties: {
        access_level: {
          type: "string",
          enum: ["public", "registered_users", "researchers_only"],
          description: "Filter by required access level"
        },
        dataset_type: {
          type: "string",
          enum: ["csv", "json", "parquet"],
          description: "Preferred file format"
        }
      }
    }
  },
  {
    name: "request_dataset_access",
    description: "Request access to a restricted research dataset. Required for researcher-only datasets.",
    inputSchema: {
      type: "object",
      properties: {
        dataset_id: {
          type: "string",
          description: "UUID of the dataset"
        },
        institution: {
          type: "string",
          description: "Research institution name"
        },
        research_purpose: {
          type: "string",
          description: "Brief description of research purpose"
        },
        intended_use: {
          type: "string",
          description: "How the data will be used"
        }
      },
      required: ["dataset_id", "research_purpose", "intended_use"]
    }
  },
  {
    name: "create_open_data_api_key",
    description: "Generate API key for programmatic access to open data endpoints. Free tier: 100 requests/hour. Researcher tier: 1000 requests/hour.",
    inputSchema: {
      type: "object",
      properties: {
        key_name: {
          type: "string",
          description: "Descriptive name for the API key"
        },
        access_level: {
          type: "string",
          enum: ["free", "standard", "premium", "researcher"],
          description: "API access tier"
        }
      },
      required: ["key_name", "access_level"]
    }
  },
  {
    name: "get_open_data_api_usage",
    description: "View API usage statistics for open data access keys. Shows request counts, rate limits, and quota remaining.",
    inputSchema: {
      type: "object",
      properties: {
        api_key_id: {
          type: "string",
          description: "Optional: Specific API key (defaults to all user keys)"
        }
      }
    }
  },

  // ===================================================================
  // 5. SKILLS DEVELOPMENT & AI TUTORING TOOLS
  // ===================================================================
  {
    name: "list_learning_modules",
    description: "Browse available learning modules for independent artists. Categories: music_production, distribution_basics, marketing_promotion, metadata_optimization, legal_rights, royalty_management, analytics_insights. Supports UK government skills development priorities.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["music_production", "distribution_basics", "marketing_promotion", "metadata_optimization", "legal_rights", "royalty_management", "brand_building", "social_media", "analytics_insights", "platform_specific"],
          description: "Filter by category"
        },
        difficulty_level: {
          type: "string",
          enum: ["beginner", "intermediate", "advanced", "expert"],
          description: "Filter by difficulty"
        },
        has_certificate: {
          type: "boolean",
          description: "Only show modules that issue certificates"
        }
      }
    }
  },
  {
    name: "enroll_in_learning_module",
    description: "Enroll in a learning module. Tracks progress, time spent, and unlocks AI tutor support.",
    inputSchema: {
      type: "object",
      properties: {
        module_id: {
          type: "string",
          description: "UUID of the learning module"
        },
        learning_pace: {
          type: "string",
          enum: ["slow", "normal", "fast"],
          description: "Preferred learning pace"
        }
      },
      required: ["module_id"]
    }
  },
  {
    name: "get_learning_progress",
    description: "Get user's learning progress across all enrolled modules. Shows completion percentages, certificates earned, and time invested.",
    inputSchema: {
      type: "object",
      properties: {
        module_id: {
          type: "string",
          description: "Optional: Specific module (defaults to all enrolled)"
        }
      }
    }
  },
  {
    name: "update_lesson_completion",
    description: "Mark a lesson as completed and update module progress. Triggers certificate issuance if module is finished.",
    inputSchema: {
      type: "object",
      properties: {
        lesson_id: {
          type: "string",
          description: "UUID of the lesson"
        },
        time_spent_minutes: {
          type: "number",
          description: "Time spent on lesson"
        },
        notes: {
          type: "string",
          description: "Optional: User notes"
        }
      },
      required: ["lesson_id"]
    }
  },
  {
    name: "chat_with_ai_tutor",
    description: "Start or continue conversation with AI tutor about a learning module. Powered by GPT-4. Provides personalized assistance, answers questions, and gives feedback.",
    inputSchema: {
      type: "object",
      properties: {
        module_id: {
          type: "string",
          description: "UUID of the learning module context"
        },
        session_id: {
          type: "string",
          description: "Optional: Existing session ID to continue conversation"
        },
        message: {
          type: "string",
          description: "User's message/question for the AI tutor"
        }
      },
      required: ["module_id", "message"]
    }
  },
  {
    name: "take_quiz",
    description: "Start a quiz for a learning module. Returns questions and records answers for scoring.",
    inputSchema: {
      type: "object",
      properties: {
        quiz_id: {
          type: "string",
          description: "UUID of the quiz"
        },
        answers: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_id: { type: "string" },
              answer: { type: "string" }
            }
          },
          description: "User's answers (for submission)"
        }
      },
      required: ["quiz_id"]
    }
  },
  {
    name: "get_certificates",
    description: "List all certificates earned by the user. Includes verification URLs, skills acquired, and LinkedIn sharing links.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        },
        is_public: {
          type: "boolean",
          description: "Optional: Filter by public visibility"
        }
      }
    }
  },
  {
    name: "generate_certificate_pdf",
    description: "Generate downloadable PDF certificate for completed module. Includes blockchain verification hash.",
    inputSchema: {
      type: "object",
      properties: {
        certificate_id: {
          type: "string",
          description: "UUID of the certificate"
        }
      },
      required: ["certificate_id"]
    }
  },
  {
    name: "get_skill_profile",
    description: "Get AI-assessed skill profile. Shows current skill levels, gaps, strengths, learning style, and recommended modules.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        }
      }
    }
  },
  {
    name: "get_grant_features_stats",
    description: "Get comprehensive stats for all grant features. Shows usage metrics, impact data, and grant reporting KPIs. Admin/reporting tool.",
    inputSchema: {
      type: "object",
      properties: {
        feature_name: {
          type: "string",
          enum: ["AI Copyright Verification", "Carbon Footprint Tracking", "Accessibility Features", "Open Data Platform", "Skills Development"],
          description: "Optional: Filter by specific feature"
        }
      }
    }
  }
];
