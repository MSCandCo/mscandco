/**
 * PLATFORM FEATURES TOOLS FOR MCP SERVER
 *
 * Comprehensive tools for social impact features:
 * 1. Copyright Protection (3 tools)
 * 2. Accessibility (6 tools)
 * 3. Sustainability & Carbon Tracking (7 tools)
 * 4. Learning & Skills Development (11 tools)
 * 5. Open Research Data (8 tools)
 *
 * Total: 35 comprehensive tools
 */

export const PLATFORM_FEATURES_TOOLS = [
  // ===================================================================
  // 1. COPYRIGHT PROTECTION TOOLS (3 tools)
  // ===================================================================
  {
    name: "verify_copyright",
    description: "Initiate AI-powered copyright verification for a release. Automatically checks against major music catalogs (Spotify, Apple Music, YouTube, SoundExchange) for potential conflicts using audio fingerprinting and melody pattern matching. Protects artists from unintentional infringement.",
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
    description: "Get the current status of copyright verification for a release. Returns verification status, confidence scores, potential conflicts detected, matched works, and required actions.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        },
        verification_id: {
          type: "string",
          description: "Optional: Specific verification ID to check"
        }
      },
      required: ["release_id"]
    }
  },
  {
    name: "submit_copyright_clearance",
    description: "Submit license clearance documentation for a detected copyright issue. Used when covering songs, sampling, or interpolating existing works. Tracks clearance status and legal documentation.",
    inputSchema: {
      type: "object",
      properties: {
        verification_id: {
          type: "string",
          description: "UUID of the copyright verification"
        },
        release_id: {
          type: "string",
          description: "UUID of the release"
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
        original_work_isrc: {
          type: "string",
          description: "Optional: ISRC of original work"
        },
        license_details: {
          type: "object",
          description: "License information (type, reference number, territory, fees)"
        },
        documentation_urls: {
          type: "array",
          items: { type: "string" },
          description: "URLs to clearance documents"
        }
      },
      required: ["verification_id", "release_id", "clearance_type", "original_work_title", "original_work_artist"]
    }
  },

  // ===================================================================
  // 2. ACCESSIBILITY TOOLS (6 tools)
  // ===================================================================
  {
    name: "generate_accessibility_content",
    description: "Generate AI-powered accessibility content for releases. Supports audio descriptions, lyric transcriptions, translations (94 languages), and instrumental descriptions. Makes music accessible to people with disabilities and non-English speakers.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "UUID of the release"
        },
        content_types: {
          type: "array",
          items: {
            type: "string",
            enum: ["audio_description", "lyric_transcription", "lyric_translation", "sign_language_video", "instrumental_description", "mood_description"]
          },
          description: "Types of accessibility content to generate"
        },
        language_codes: {
          type: "array",
          items: { type: "string" },
          description: "ISO 639-1 language codes (en, es, fr, de, etc.)"
        },
        target_wcag_level: {
          type: "string",
          enum: ["A", "AA", "AAA"],
          description: "Target WCAG compliance level (default: AA)"
        }
      },
      required: ["release_id", "content_types", "language_codes"]
    }
  },
  {
    name: "get_accessibility_content",
    description: "List all accessibility content for a release. Returns transcriptions, translations, sign language videos, and generation status.",
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
    description: "Get WCAG accessibility compliance status for a release. Shows which accessibility features are present, current compliance level (A/AA/AAA), missing features, and recommendations.",
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
    description: "Request professional accessibility services (human sign language interpreter, professional translator, audio description narrator, braille notation). Connects with professional marketplace.",
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
        budget_range: {
          type: "string",
          enum: ["budget", "standard", "premium"],
          description: "Service budget tier"
        },
        notes: {
          type: "string",
          description: "Additional requirements or notes"
        }
      },
      required: ["release_id", "service_type"]
    }
  },
  {
    name: "get_accessibility_requests",
    description: "List all accessibility service requests. Shows status, assigned professionals, quotes, and delivery dates.",
    inputSchema: {
      type: "object",
      properties: {
        release_id: {
          type: "string",
          description: "Optional: Filter by specific release"
        },
        status: {
          type: "string",
          enum: ["pending", "quoted", "in_progress", "completed", "cancelled"],
          description: "Optional: Filter by status"
        }
      }
    }
  },
  {
    name: "update_accessibility_preferences",
    description: "Update user's accessibility preferences for content generation. Set default languages, WCAG levels, and auto-generation settings.",
    inputSchema: {
      type: "object",
      properties: {
        default_languages: {
          type: "array",
          items: { type: "string" },
          description: "Default language codes for auto-generation"
        },
        auto_generate_enabled: {
          type: "boolean",
          description: "Enable automatic accessibility content generation on release"
        },
        default_wcag_level: {
          type: "string",
          enum: ["A", "AA", "AAA"],
          description: "Default WCAG compliance level"
        },
        preferred_content_types: {
          type: "array",
          items: { type: "string" },
          description: "Which content types to auto-generate"
        }
      }
    }
  },

  // ===================================================================
  // 3. SUSTAINABILITY & CARBON TRACKING TOOLS (7 tools)
  // ===================================================================
  {
    name: "calculate_carbon_footprint",
    description: "Calculate the carbon footprint of music streaming for a release over a specified period. Uses DIMPACT 2024 industry methodology (0.055 kWh per stream × 0.233 kg CO2e/kWh). Shows per-stream carbon, total emissions, and equivalencies (trees, miles driven, phone charges).",
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
        },
        include_downloads: {
          type: "boolean",
          description: "Include download carbon impact (default: true)"
        }
      },
      required: ["release_id", "period_start", "period_end"]
    }
  },
  {
    name: "get_carbon_summary",
    description: "Get comprehensive carbon footprint summary for user. Shows total carbon across all releases, top emitting releases, offsets purchased, net impact, and carbon neutral status.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        },
        time_period: {
          type: "string",
          enum: ["all_time", "this_year", "last_year", "this_month", "last_month", "custom"],
          description: "Time period for summary"
        },
        custom_start: {
          type: "string",
          format: "date",
          description: "Custom period start (if time_period=custom)"
        },
        custom_end: {
          type: "string",
          format: "date",
          description: "Custom period end (if time_period=custom)"
        }
      }
    }
  },
  {
    name: "track_carbon_by_release",
    description: "Get detailed carbon tracking data for a specific release. Shows carbon per platform, trends over time, stream count, and offset status.",
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
    description: "Get user's sustainability profile including total carbon footprint, offsets purchased, commitment level (monitoring/offsetting/carbon_neutral/carbon_negative), achievements, and public commitments.",
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
    description: "Update sustainability commitment and auto-offset settings. Enable auto-offsetting with monthly budget. Set public visibility and commitment level.",
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
        },
        is_carbon_neutral_committed: {
          type: "boolean",
          description: "Public commitment to carbon neutrality"
        },
        public_profile: {
          type: "boolean",
          description: "Make sustainability profile public"
        }
      }
    }
  },
  {
    name: "purchase_carbon_offset",
    description: "Purchase carbon offsets for releases. Integrates with Greenspark, Ecologi, or Gold Standard providers. Receives certificate and transaction verification.",
    inputSchema: {
      type: "object",
      properties: {
        offset_amount_kg: {
          type: "number",
          description: "Amount of CO2 to offset in kilograms"
        },
        offset_provider: {
          type: "string",
          enum: ["greenspark", "ecologi", "goldstandard"],
          description: "Carbon offset provider"
        },
        release_id: {
          type: "string",
          description: "Optional: Specific release to offset"
        },
        project_type: {
          type: "string",
          enum: ["reforestation", "renewable_energy", "ocean_cleanup", "mixed"],
          description: "Type of offset project to support"
        }
      },
      required: ["offset_amount_kg", "offset_provider"]
    }
  },
  {
    name: "get_carbon_offset_history",
    description: "View all carbon offset transactions. Shows amounts, providers, projects supported, certificates, and verification status.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        },
        release_id: {
          type: "string",
          description: "Optional: Filter by specific release"
        }
      }
    }
  },

  // ===================================================================
  // 4. LEARNING & SKILLS DEVELOPMENT TOOLS (11 tools)
  // ===================================================================
  {
    name: "list_learning_modules",
    description: "Browse available learning modules for independent artists. Categories: music_production, distribution_basics, marketing_promotion, metadata_optimization, legal_rights, royalty_management, analytics_insights, brand_building, social_media, platform_specific. Filter by difficulty, certificate availability, and search keywords.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["music_production", "distribution_basics", "marketing_promotion", "metadata_optimization", "legal_rights", "royalty_management", "brand_building", "social_media", "analytics_insights", "platform_specific", "all"],
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
        },
        search_query: {
          type: "string",
          description: "Search in module titles and descriptions"
        },
        sort_by: {
          type: "string",
          enum: ["popular", "newest", "duration", "rating"],
          description: "Sort order (default: popular)"
        }
      }
    }
  },
  {
    name: "get_learning_module_details",
    description: "Get detailed information about a specific learning module. Shows syllabus, lessons, quizzes, duration, prerequisites, skills gained, and reviews.",
    inputSchema: {
      type: "object",
      properties: {
        module_id: {
          type: "string",
          description: "UUID of the learning module"
        }
      },
      required: ["module_id"]
    }
  },
  {
    name: "enroll_in_learning_module",
    description: "Enroll in a learning module. Tracks progress, time spent, and unlocks AI tutor support. Creates personalized learning path.",
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
        },
        send_reminders: {
          type: "boolean",
          description: "Enable email/notification reminders"
        }
      },
      required: ["module_id"]
    }
  },
  {
    name: "get_learning_progress",
    description: "Get user's learning progress across all enrolled modules. Shows completion percentages, certificates earned, time invested, current streaks, and next recommended lessons.",
    inputSchema: {
      type: "object",
      properties: {
        module_id: {
          type: "string",
          description: "Optional: Specific module (defaults to all enrolled)"
        },
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        }
      }
    }
  },
  {
    name: "update_lesson_progress",
    description: "Mark a lesson as completed and update module progress. Records time spent, completion status, and notes. Triggers certificate issuance if module is finished.",
    inputSchema: {
      type: "object",
      properties: {
        enrollment_id: {
          type: "string",
          description: "UUID of the enrollment"
        },
        lesson_id: {
          type: "string",
          description: "UUID of the lesson"
        },
        progress_percentage: {
          type: "number",
          minimum: 0,
          maximum: 100,
          description: "Lesson progress (0-100)"
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
      required: ["enrollment_id", "lesson_id", "progress_percentage"]
    }
  },
  {
    name: "chat_with_ai_tutor",
    description: "Start or continue conversation with AI tutor about a learning module. Powered by GPT-4. Provides personalized assistance, answers questions, gives feedback, and adapts to learning style. Maintains conversation context.",
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
        },
        include_context: {
          type: "boolean",
          description: "Include user's current progress and previous lessons (default: true)"
        }
      },
      required: ["module_id", "message"]
    }
  },
  {
    name: "get_ai_tutor_sessions",
    description: "View all AI tutor conversation sessions. Shows topics discussed, questions asked, and session summaries.",
    inputSchema: {
      type: "object",
      properties: {
        module_id: {
          type: "string",
          description: "Optional: Filter by specific module"
        }
      }
    }
  },
  {
    name: "take_quiz",
    description: "Start or submit a quiz for a learning module. Returns questions, records answers, scores quiz, and provides feedback. Passing score typically 80%.",
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
          description: "User's answers (for submission). Omit to just view questions."
        }
      },
      required: ["quiz_id"]
    }
  },
  {
    name: "get_certificates",
    description: "List all certificates earned by the user. Includes verification URLs, skills acquired, issue date, LinkedIn sharing links, and PDF download links.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        },
        certificate_id: {
          type: "string",
          description: "Optional: Get specific certificate details"
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
    description: "Generate downloadable PDF certificate for completed module. Includes blockchain verification hash, QR code for verification, and professional design.",
    inputSchema: {
      type: "object",
      properties: {
        certificate_id: {
          type: "string",
          description: "UUID of the certificate"
        },
        include_linkedin_badge: {
          type: "boolean",
          description: "Include LinkedIn certification badge data"
        }
      },
      required: ["certificate_id"]
    }
  },
  {
    name: "get_skill_profile",
    description: "Get AI-assessed skill profile. Shows current skill levels across categories, identified gaps, strengths, learning style assessment, and personalized module recommendations based on goals.",
    inputSchema: {
      type: "object",
      properties: {
        user_id: {
          type: "string",
          description: "Optional: User ID (defaults to current user)"
        },
        include_recommendations: {
          type: "boolean",
          description: "Include AI-recommended modules (default: true)"
        }
      }
    }
  },

  // ===================================================================
  // 5. OPEN RESEARCH DATA TOOLS (8 tools)
  // ===================================================================
  {
    name: "query_open_data_metrics",
    description: "Query anonymized industry metrics and streaming trends. Available to public for research. Shows streaming volumes, genre trends, geographic distribution, and platform breakdown. All data is anonymized and aggregated.",
    inputSchema: {
      type: "object",
      properties: {
        metric_category: {
          type: "string",
          enum: ["streaming", "revenue", "geographic", "genre", "platform", "demographic"],
          description: "Category of metrics to query"
        },
        period_type: {
          type: "string",
          enum: ["daily", "weekly", "monthly", "quarterly", "yearly"],
          description: "Time period granularity"
        },
        period_start: {
          type: "string",
          format: "date",
          description: "Start date (YYYY-MM-DD)"
        },
        period_end: {
          type: "string",
          format: "date",
          description: "End date (YYYY-MM-DD)"
        },
        region: {
          type: "string",
          description: "Optional: Filter by region (ISO 3166-1 country code or region: north_america, europe, asia, africa, oceania, latin_america)"
        },
        genre: {
          type: "string",
          description: "Optional: Filter by music genre"
        },
        limit: {
          type: "number",
          description: "Maximum number of data points (default: 100, max: 1000)"
        }
      },
      required: ["metric_category", "period_type", "period_start", "period_end"]
    }
  },
  {
    name: "list_research_datasets",
    description: "Browse available research datasets for download. Includes streaming trends, genre performance, anonymized revenue data, market analysis. Free for registered researchers. Shows dataset size, format, update frequency, and access requirements.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["streaming_trends", "genre_analytics", "revenue_insights", "geographic_data", "platform_metrics", "artist_demographics", "all"],
          description: "Filter by dataset category"
        },
        access_level: {
          type: "string",
          enum: ["public", "registered_users", "researchers_only", "all"],
          description: "Filter by required access level"
        },
        dataset_format: {
          type: "string",
          enum: ["csv", "json", "parquet", "all"],
          description: "Preferred file format"
        },
        min_size_mb: {
          type: "number",
          description: "Minimum dataset size in MB"
        },
        max_size_mb: {
          type: "number",
          description: "Maximum dataset size in MB"
        }
      }
    }
  },
  {
    name: "get_dataset_details",
    description: "Get detailed information about a specific research dataset. Shows schema, sample data, documentation, citation information, and download instructions.",
    inputSchema: {
      type: "object",
      properties: {
        dataset_id: {
          type: "string",
          description: "UUID of the dataset"
        }
      },
      required: ["dataset_id"]
    }
  },
  {
    name: "download_research_dataset",
    description: "Download a research dataset. Requires appropriate access level. Returns download URL with expiry time.",
    inputSchema: {
      type: "object",
      properties: {
        dataset_id: {
          type: "string",
          description: "UUID of the dataset"
        },
        format: {
          type: "string",
          enum: ["csv", "json", "parquet"],
          description: "Download format (if multiple available)"
        }
      },
      required: ["dataset_id"]
    }
  },
  {
    name: "request_dataset_access",
    description: "Request access to a restricted research dataset. Required for researcher-only datasets. Reviewed by data governance team.",
    inputSchema: {
      type: "object",
      properties: {
        dataset_id: {
          type: "string",
          description: "UUID of the dataset"
        },
        researcher_name: {
          type: "string",
          description: "Full name of researcher"
        },
        institution_name: {
          type: "string",
          description: "Research institution or university name"
        },
        institution_email: {
          type: "string",
          format: "email",
          description: "Institutional email address"
        },
        research_purpose: {
          type: "string",
          description: "Detailed description of research purpose"
        },
        intended_use: {
          type: "string",
          description: "How the data will be used (publication, thesis, analysis, etc.)"
        },
        expected_publication: {
          type: "string",
          description: "Expected publication venue or timeline"
        }
      },
      required: ["dataset_id", "researcher_name", "institution_name", "research_purpose", "intended_use"]
    }
  },
  {
    name: "create_open_data_api_key",
    description: "Generate API key for programmatic access to open data endpoints. Free tier: 10,000 requests/month. Standard tier: 100,000 requests/month. Researcher tier: 1,000,000 requests/month. Returns API key, secret, and documentation URL.",
    inputSchema: {
      type: "object",
      properties: {
        key_name: {
          type: "string",
          description: "Descriptive name for the API key"
        },
        access_level: {
          type: "string",
          enum: ["free", "standard", "researcher", "commercial"],
          description: "API access tier"
        },
        intended_use: {
          type: "string",
          description: "Description of how API will be used"
        }
      },
      required: ["key_name", "access_level"]
    }
  },
  {
    name: "get_open_data_api_keys",
    description: "List all API keys for open data access. Shows key names, access levels, creation dates, last used, request counts, and quota remaining.",
    inputSchema: {
      type: "object",
      properties: {
        include_inactive: {
          type: "boolean",
          description: "Include revoked/inactive keys (default: false)"
        }
      }
    }
  },
  {
    name: "get_open_data_api_usage",
    description: "View detailed API usage statistics for open data access keys. Shows request counts by endpoint, rate limits, quota remaining, top queries, and usage graphs.",
    inputSchema: {
      type: "object",
      properties: {
        api_key_id: {
          type: "string",
          description: "Optional: Specific API key (defaults to all user keys)"
        },
        time_period: {
          type: "string",
          enum: ["today", "this_week", "this_month", "last_30_days", "all_time"],
          description: "Time period for usage stats"
        }
      }
    }
  }
];
