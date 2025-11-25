/**
 * PLATFORM FEATURES TOOLS FOR MCP SERVER
 *
 * Comprehensive tools for social impact features:
 * 1. Copyright Protection (3 tools)
 * 2. Accessibility (6 tools)
 * 3. Sustainability & Carbon Tracking (7 tools)
 * 4. Learning & Skills Development (11 tools)
 * 5. Open Research Data (8 tools)
 * 6. Touring Platform (30+ tools) ✨ NEW
 *
 * Total: 65+ comprehensive tools
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
  },

  // ===================================================================
  // 6. TOURING PLATFORM TOOLS (30+ tools) ✨ NEW
  // ===================================================================
  {
    name: "create_tour",
    description: "Create a new tour. AI-powered touring management platform for artists. Includes tour name, artist name, dates, budget, currency, and status. Automatically sets up tour structure for dates, crew, guest lists, and financial tracking.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Tour name (e.g., 'Summer 2024 World Tour')"
        },
        artist_name: {
          type: "string",
          description: "Artist name"
        },
        start_date: {
          type: "string",
          format: "date",
          description: "Tour start date (YYYY-MM-DD)"
        },
        end_date: {
          type: "string",
          format: "date",
          description: "Tour end date (YYYY-MM-DD)"
        },
        description: {
          type: "string",
          description: "Tour description"
        },
        budget: {
          type: "number",
          description: "Tour budget amount"
        },
        currency: {
          type: "string",
          enum: ["GBP", "USD", "EUR", "NGN", "CAD", "AUD", "JPY", "CNY", "ZAR"],
          description: "Currency code (default: GBP)"
        },
        tour_type: {
          type: "string",
          enum: ["headline", "support", "festival", "club"],
          description: "Type of tour"
        },
        status: {
          type: "string",
          enum: ["planning", "active", "completed", "cancelled"],
          description: "Tour status (default: planning)"
        }
      },
      required: ["name", "artist_name"]
    }
  },
  {
    name: "list_tours",
    description: "List all tours for the authenticated user. Returns tour details including dates, status, budget, and statistics.",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["planning", "active", "completed", "cancelled", "all"],
          description: "Filter by status (default: all)"
        },
        limit: {
          type: "number",
          description: "Maximum number of tours to return (default: 50)"
        }
      }
    }
  },
  {
    name: "get_tour_details",
    description: "Get detailed information about a specific tour. Returns tour info, dates, crew, financial summary, and statistics.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        }
      },
      required: ["tour_id"]
    }
  },
  {
    name: "add_tour_date",
    description: "Add a tour date to an existing tour. Includes venue, city, country, show times, capacity, and status.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        },
        date: {
          type: "string",
          format: "date",
          description: "Show date (YYYY-MM-DD)"
        },
        city: {
          type: "string",
          description: "City name"
        },
        country: {
          type: "string",
          description: "Country name or ISO code"
        },
        venue_id: {
          type: "string",
          description: "Optional: UUID of venue from database"
        },
        show_time: {
          type: "string",
          description: "Show time (HH:MM format)"
        },
        doors_time: {
          type: "string",
          description: "Doors open time (HH:MM format)"
        },
        capacity: {
          type: "number",
          description: "Venue capacity"
        },
        status: {
          type: "string",
          enum: ["confirmed", "hold", "pending", "cancelled"],
          description: "Date status (default: pending)"
        }
      },
      required: ["tour_id", "date", "city", "country"]
    }
  },
  {
    name: "add_crew_member",
    description: "Add a crew member to a tour. Includes name, role, contact info, dietary restrictions, and permissions.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        },
        name: {
          type: "string",
          description: "Crew member name"
        },
        role: {
          type: "string",
          description: "Role (e.g., 'Tour Manager', 'Sound Engineer', 'Guitar Tech')"
        },
        email: {
          type: "string",
          format: "email",
          description: "Email address"
        },
        phone: {
          type: "string",
          description: "Phone number"
        },
        dietary_restrictions: {
          type: "string",
          description: "Dietary restrictions or preferences"
        },
        permissions: {
          type: "string",
          enum: ["admin", "manager", "crew", "view_only"],
          description: "Access permissions (default: crew)"
        }
      },
      required: ["tour_id", "name", "role"]
    }
  },
  {
    name: "search_venues",
    description: "Search venues database. Find venues by name, city, country, capacity, or venue type. Returns matching venues with details.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (name, city, or country)"
        },
        city: {
          type: "string",
          description: "Filter by city"
        },
        country: {
          type: "string",
          description: "Filter by country"
        },
        min_capacity: {
          type: "number",
          description: "Minimum capacity"
        },
        max_capacity: {
          type: "number",
          description: "Maximum capacity"
        },
        venue_type: {
          type: "string",
          enum: ["arena", "theater", "club", "festival", "outdoor"],
          description: "Filter by venue type"
        },
        limit: {
          type: "number",
          description: "Maximum results (default: 20)"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "add_guest_to_tour_date",
    description: "Add a guest to a tour date's guest list. Includes guest name, email, plus-ones, pass type, and notes.",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        },
        guest_name: {
          type: "string",
          description: "Guest name"
        },
        guest_email: {
          type: "string",
          format: "email",
          description: "Guest email"
        },
        guest_phone: {
          type: "string",
          description: "Guest phone number"
        },
        plus_ones: {
          type: "number",
          description: "Number of plus-ones (default: 0)"
        },
        pass_type: {
          type: "string",
          enum: ["VIP", "Guest", "Comp", "Photo", "Working", "Artist", "Press"],
          description: "Pass type"
        },
        notes: {
          type: "string",
          description: "Additional notes"
        }
      },
      required: ["tour_date_id", "guest_name"]
    }
  },
  {
    name: "approve_guest",
    description: "Approve or decline a guest on a tour date guest list. Updates guest status and sends notification.",
    inputSchema: {
      type: "object",
      properties: {
        guest_id: {
          type: "string",
          description: "UUID of the guest list entry"
        },
        status: {
          type: "string",
          enum: ["approved", "declined"],
          description: "Approval status"
        },
        notes: {
          type: "string",
          description: "Optional: Notes about approval/decline"
        }
      },
      required: ["guest_id", "status"]
    }
  },
  {
    name: "add_itinerary_item",
    description: "Add an itinerary item to a tour date. Includes time, location, description, and item type (show, travel, hotel, rehearsal, meeting, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        },
        title: {
          type: "string",
          description: "Item title"
        },
        start_time: {
          type: "string",
          format: "date-time",
          description: "Start time (ISO 8601)"
        },
        end_time: {
          type: "string",
          format: "date-time",
          description: "Optional: End time (ISO 8601)"
        },
        location: {
          type: "string",
          description: "Location"
        },
        item_type: {
          type: "string",
          enum: ["show", "travel", "hotel", "rehearsal", "meeting", "promo", "day_off", "load_in", "soundcheck", "other"],
          description: "Type of itinerary item"
        },
        description: {
          type: "string",
          description: "Item description"
        }
      },
      required: ["tour_date_id", "title", "start_time"]
    }
  },
  {
    name: "add_hotel_booking",
    description: "Add a hotel booking for a tour date. Includes hotel name, address, check-in/out dates, confirmation number, and rate.",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        },
        name: {
          type: "string",
          description: "Hotel name"
        },
        address: {
          type: "string",
          description: "Hotel address"
        },
        city: {
          type: "string",
          description: "City"
        },
        check_in: {
          type: "string",
          format: "date",
          description: "Check-in date (YYYY-MM-DD)"
        },
        check_out: {
          type: "string",
          format: "date",
          description: "Check-out date (YYYY-MM-DD)"
        },
        confirmation_number: {
          type: "string",
          description: "Booking confirmation number"
        },
        rate: {
          type: "number",
          description: "Room rate"
        },
        notes: {
          type: "string",
          description: "Additional notes"
        }
      },
      required: ["tour_date_id", "name", "check_in", "check_out"]
    }
  },
  {
    name: "add_travel_item",
    description: "Add a travel item for a tour date. Supports air, ground, rail, and sea travel. Includes departure/arrival locations, times, flight numbers, and confirmation numbers.",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        },
        travel_type: {
          type: "string",
          enum: ["air", "ground", "rail", "sea"],
          description: "Type of travel"
        },
        departure_location: {
          type: "string",
          description: "Departure location"
        },
        arrival_location: {
          type: "string",
          description: "Arrival location"
        },
        departure_time: {
          type: "string",
          format: "date-time",
          description: "Departure time (ISO 8601)"
        },
        arrival_time: {
          type: "string",
          format: "date-time",
          description: "Arrival time (ISO 8601)"
        },
        airline: {
          type: "string",
          description: "Airline name (for air travel)"
        },
        flight_number: {
          type: "string",
          description: "Flight number (for air travel)"
        },
        confirmation_number: {
          type: "string",
          description: "Booking confirmation number"
        },
        cost: {
          type: "number",
          description: "Travel cost"
        }
      },
      required: ["tour_date_id", "travel_type", "departure_location", "arrival_location"]
    }
  },
  {
    name: "add_expense",
    description: "Add an expense to a tour. Includes category, amount, description, vendor, date, and receipt URL.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        },
        tour_date_id: {
          type: "string",
          description: "Optional: UUID of specific tour date"
        },
        category: {
          type: "string",
          enum: ["travel", "hotel", "food", "fuel", "equipment", "misc"],
          description: "Expense category"
        },
        amount: {
          type: "number",
          description: "Expense amount"
        },
        description: {
          type: "string",
          description: "Expense description"
        },
        vendor: {
          type: "string",
          description: "Vendor name"
        },
        date: {
          type: "string",
          format: "date",
          description: "Expense date (YYYY-MM-DD)"
        },
        receipt_url: {
          type: "string",
          description: "Optional: URL to receipt image/document"
        },
        payment_method: {
          type: "string",
          enum: ["cash", "card", "revolut", "bank_transfer", "other"],
          description: "Payment method"
        }
      },
      required: ["tour_id", "category", "amount", "description", "date"]
    }
  },
  {
    name: "add_revenue",
    description: "Add revenue for a tour date. Includes source (tickets, merch, meet_greet, guarantee), amount, description, and received date.",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        },
        source: {
          type: "string",
          enum: ["tickets", "merch", "meet_greet", "guarantee", "other"],
          description: "Revenue source"
        },
        amount: {
          type: "number",
          description: "Revenue amount"
        },
        description: {
          type: "string",
          description: "Revenue description"
        },
        received_at: {
          type: "string",
          format: "date",
          description: "Date received (YYYY-MM-DD)"
        },
        payment_method: {
          type: "string",
          enum: ["cash", "card", "revolut", "bank_transfer", "other"],
          description: "Payment method"
        }
      },
      required: ["tour_date_id", "source", "amount"]
    }
  },
  {
    name: "get_tour_financials",
    description: "Get comprehensive financial summary for a tour. Returns total expenses, total revenue, net profit, profit margin, and breakdown by category.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        }
      },
      required: ["tour_id"]
    }
  },
  {
    name: "optimize_tour_route",
    description: "AI-powered route optimization for tour dates. Optimizes tour route to minimize distance, time, and cost. Returns optimized route order, savings (distance, time, cost), and recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        },
        optimization_type: {
          type: "string",
          enum: ["distance", "time", "cost"],
          description: "Optimization priority (default: distance)"
        }
      },
      required: ["tour_id"]
    }
  },
  {
    name: "generate_day_sheet",
    description: "Generate PDF day sheet for a tour date. Includes itinerary, crew, guest list, set list, venue details, and show times. Returns HTML for PDF generation.",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        }
      },
      required: ["tour_date_id"]
    }
  },
  {
    name: "generate_financial_report",
    description: "Generate financial report for a tour. Returns PDF or CSV format with expenses, revenue, P&L breakdown, and category analysis.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        },
        format: {
          type: "string",
          enum: ["html", "json", "csv"],
          description: "Report format (default: html)"
        }
      },
      required: ["tour_id"]
    }
  },
  {
    name: "export_tour_calendar",
    description: "Export tour dates as iCal calendar file. Compatible with Google Calendar, Apple Calendar, and Outlook. Returns iCal file content.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour (exports all dates)"
        },
        tour_date_id: {
          type: "string",
          description: "Optional: UUID of single tour date"
        }
      },
      required: []
    }
  },
  {
    name: "track_flight",
    description: "Track flight status using FlightAware integration. Returns real-time flight information including departure/arrival times, gates, terminals, and status.",
    inputSchema: {
      type: "object",
      properties: {
        flight_number: {
          type: "string",
          description: "Flight number (e.g., 'AA123')"
        },
        travel_item_id: {
          type: "string",
          description: "Optional: UUID of travel item (uses flight_number from item)"
        }
      },
      required: []
    }
  },
  {
    name: "create_tour_from_ticket_link",
    description: "Create a tour from a ticket/event link (Eventbrite, Ticketmaster, etc.). Apollo AI parses event information, asks for missing data, and creates complete tour with date. Supports conversational tour creation.",
    inputSchema: {
      type: "object",
      properties: {
        ticket_url: {
          type: "string",
          description: "Ticket/event URL (Eventbrite, Ticketmaster, Bandsintown, Songkick, etc.)"
        },
        tour_name: {
          type: "string",
          description: "Optional: Custom tour name"
        },
        description: {
          type: "string",
          description: "Optional: Tour description"
        },
        budget: {
          type: "number",
          description: "Optional: Tour budget"
        }
      },
      required: ["ticket_url"]
    }
  },
  {
    name: "create_tour_from_multiple_tickets",
    description: "Create a tour from multiple ticket links. Apollo AI handles multiple events, asks for missing data, and creates a single tour with multiple dates. Automatic date sorting.",
    inputSchema: {
      type: "object",
      properties: {
        ticket_urls: {
          type: "array",
          items: { type: "string" },
          description: "Array of ticket/event URLs"
        },
        tour_name: {
          type: "string",
          description: "Optional: Custom tour name"
        },
        description: {
          type: "string",
          description: "Optional: Tour description"
        },
        budget: {
          type: "number",
          description: "Optional: Tour budget"
        }
      },
      required: ["ticket_urls"]
    }
  },
  {
    name: "get_tour_suggestions",
    description: "Get AI-powered suggestions for tours. Includes tour name suggestions, crew recommendations based on venue size, budget estimates, and venue matching.",
    inputSchema: {
      type: "object",
      properties: {
        suggestion_type: {
          type: "string",
          enum: ["tour_name", "crew", "budget", "venue"],
          description: "Type of suggestion needed"
        },
        artist_name: {
          type: "string",
          description: "Artist name (for tour name suggestions)"
        },
        cities: {
          type: "array",
          items: { type: "string" },
          description: "City names (for tour name suggestions)"
        },
        year: {
          type: "number",
          description: "Year (for tour name suggestions)"
        },
        venue_capacity: {
          type: "number",
          description: "Venue capacity (for crew suggestions)"
        },
        tour_dates: {
          type: "number",
          description: "Number of tour dates (for budget estimates)"
        },
        crew_count: {
          type: "number",
          description: "Number of crew members (for budget estimates)"
        }
      },
      required: ["suggestion_type"]
    }
  },
  {
    name: "find_matching_venues",
    description: "AI-powered venue matching. Finds venues matching criteria (city, country, capacity, venue type, budget). Returns scored matches with recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "City name"
        },
        country: {
          type: "string",
          description: "Country name or ISO code"
        },
        capacity: {
          type: "number",
          description: "Desired capacity"
        },
        venue_type: {
          type: "string",
          enum: ["arena", "theater", "club", "festival", "outdoor"],
          description: "Preferred venue type"
        },
        budget: {
          type: "number",
          description: "Budget range"
        },
        date: {
          type: "string",
          format: "date",
          description: "Show date (for availability checking)"
        }
      },
      required: ["city", "country"]
    }
  },
  {
    name: "add_song_to_tour",
    description: "Add a song to a tour's song library. Songs can then be used in set lists for tour dates.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        },
        title: {
          type: "string",
          description: "Song title"
        },
        artist: {
          type: "string",
          description: "Artist name"
        },
        duration: {
          type: "number",
          description: "Duration in seconds"
        },
        bpm: {
          type: "number",
          description: "BPM (beats per minute)"
        },
        key: {
          type: "string",
          description: "Musical key"
        },
        tech_notes: {
          type: "string",
          description: "Technical notes for crew"
        }
      },
      required: ["tour_id", "title"]
    }
  },
  {
    name: "update_setlist",
    description: "Update set list for a tour date. Includes songs in order, breaks, and notes. Supports drag-and-drop reordering.",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        },
        songs: {
          type: "array",
          items: {
            type: "object",
            properties: {
              song_id: { type: "string" },
              position: { type: "number" },
              is_break: { type: "boolean" },
              break_duration: { type: "number" },
              notes: { type: "string" }
            }
          },
          description: "Array of songs with positions"
        }
      },
      required: ["tour_date_id", "songs"]
    }
  },
  {
    name: "get_tour_analytics",
    description: "Get analytics and insights for a tour. Returns attendance predictions, revenue forecasts, risk scores, and AI recommendations.",
    inputSchema: {
      type: "object",
      properties: {
        tour_id: {
          type: "string",
          description: "UUID of the tour"
        }
      },
      required: ["tour_id"]
    }
  },
  {
    name: "sync_eventbrite_event",
    description: "Sync tour date with Eventbrite event. Creates or updates Eventbrite event, syncs ticket sales, and updates tour date with event data.",
    inputSchema: {
      type: "object",
      properties: {
        tour_date_id: {
          type: "string",
          description: "UUID of the tour date"
        },
        eventbrite_event_id: {
          type: "string",
          description: "Optional: Existing Eventbrite event ID"
        },
        create_new: {
          type: "boolean",
          description: "Create new Eventbrite event if not exists (default: false)"
        }
      },
      required: ["tour_date_id"]
    }
  }
];
