import type { Attribute, Schema } from '@strapi/strapi';

export interface AdminApiToken extends Schema.CollectionType {
  collectionName: 'strapi_api_tokens';
  info: {
    description: '';
    displayName: 'Api Token';
    name: 'Api Token';
    pluralName: 'api-tokens';
    singularName: 'api-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::api-token',
      'oneToMany',
      'admin::api-token-permission'
    >;
    type: Attribute.Enumeration<['read-only', 'full-access', 'custom']> &
      Attribute.Required &
      Attribute.DefaultTo<'read-only'>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminApiTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_api_token_permissions';
  info: {
    description: '';
    displayName: 'API Token Permission';
    name: 'API Token Permission';
    pluralName: 'api-token-permissions';
    singularName: 'api-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::api-token-permission',
      'manyToOne',
      'admin::api-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::api-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminPermission extends Schema.CollectionType {
  collectionName: 'admin_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'Permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    actionParameters: Attribute.JSON & Attribute.DefaultTo<{}>;
    conditions: Attribute.JSON & Attribute.DefaultTo<[]>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    properties: Attribute.JSON & Attribute.DefaultTo<{}>;
    role: Attribute.Relation<'admin::permission', 'manyToOne', 'admin::role'>;
    subject: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminRole extends Schema.CollectionType {
  collectionName: 'admin_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'Role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::role',
      'oneToMany',
      'admin::permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::role', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    users: Attribute.Relation<'admin::role', 'manyToMany', 'admin::user'>;
  };
}

export interface AdminTransferToken extends Schema.CollectionType {
  collectionName: 'strapi_transfer_tokens';
  info: {
    description: '';
    displayName: 'Transfer Token';
    name: 'Transfer Token';
    pluralName: 'transfer-tokens';
    singularName: 'transfer-token';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    accessKey: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }> &
      Attribute.DefaultTo<''>;
    expiresAt: Attribute.DateTime;
    lastUsedAt: Attribute.DateTime;
    lifespan: Attribute.BigInteger;
    name: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    permissions: Attribute.Relation<
      'admin::transfer-token',
      'oneToMany',
      'admin::transfer-token-permission'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminTransferTokenPermission extends Schema.CollectionType {
  collectionName: 'strapi_transfer_token_permissions';
  info: {
    description: '';
    displayName: 'Transfer Token Permission';
    name: 'Transfer Token Permission';
    pluralName: 'transfer-token-permissions';
    singularName: 'transfer-token-permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    token: Attribute.Relation<
      'admin::transfer-token-permission',
      'manyToOne',
      'admin::transfer-token'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'admin::transfer-token-permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface AdminUser extends Schema.CollectionType {
  collectionName: 'admin_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'User';
    pluralName: 'users';
    singularName: 'user';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    blocked: Attribute.Boolean & Attribute.Private & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.Private &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    firstname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    isActive: Attribute.Boolean &
      Attribute.Private &
      Attribute.DefaultTo<false>;
    lastname: Attribute.String &
      Attribute.SetMinMaxLength<{
        minLength: 1;
      }>;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    preferedLanguage: Attribute.String;
    registrationToken: Attribute.String & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    roles: Attribute.Relation<'admin::user', 'manyToMany', 'admin::role'> &
      Attribute.Private;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'admin::user', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    username: Attribute.String;
  };
}

export interface ApiAiInsightAiInsight extends Schema.CollectionType {
  collectionName: 'ai_insight';
  info: {
    description: 'AI/ML generated insights and recommendations';
    displayName: 'AI Insights';
    pluralName: 'ai-insights';
    singularName: 'ai-insight';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actionItems: Attribute.JSON;
    artist: Attribute.Relation<
      'api::ai-insight.ai-insight',
      'manyToOne',
      'api::artist.artist'
    >;
    assignedTo: Attribute.Relation<
      'api::ai-insight.ai-insight',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    automatedActions: Attribute.JSON;
    confidence: Attribute.Decimal & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::ai-insight.ai-insight',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    data: Attribute.JSON;
    description: Attribute.Text;
    insightType: Attribute.Enumeration<
      [
        'performance',
        'collaboration',
        'market',
        'career',
        'audience',
        'revenue',
        'growth',
        'risk'
      ]
    >;
    lastUpdated: Attribute.DateTime;
    modelVersion: Attribute.String;
    predictedImpact: Attribute.Decimal & Attribute.DefaultTo<0>;
    priority: Attribute.Enumeration<['low', 'medium', 'high', 'critical']> &
      Attribute.DefaultTo<'medium'>;
    recommendations: Attribute.JSON;
    relatedInsights: Attribute.Relation<
      'api::ai-insight.ai-insight',
      'manyToMany',
      'api::ai-insight.ai-insight'
    >;
    status: Attribute.Enumeration<
      ['new', 'reviewed', 'implemented', 'dismissed']
    > &
      Attribute.DefaultTo<'new'>;
    tags: Attribute.JSON;
    timeframe: Attribute.Enumeration<
      ['immediate', 'short_term', 'medium_term', 'long_term']
    > &
      Attribute.DefaultTo<'short_term'>;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::ai-insight.ai-insight',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiArtistJourneyArtistJourney extends Schema.CollectionType {
  collectionName: 'artist_journeys';
  info: {
    description: 'Track artist journey from signup to success';
    displayName: 'Artist Journey';
    pluralName: 'artist-journeys';
    singularName: 'artist-journey';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    achievementBadges: Attribute.JSON;
    aiInsights: Attribute.JSON;
    artist: Attribute.Relation<
      'api::artist-journey.artist-journey',
      'oneToOne',
      'api::artist.artist'
    >;
    breakthroughDate: Attribute.DateTime;
    careerPath: Attribute.Enumeration<
      [
        'independent',
        'label_partnership',
        'distribution_only',
        'full_service',
        'hybrid'
      ]
    >;
    challenges: Attribute.JSON;
    completedMilestones: Attribute.JSON;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::artist-journey.artist-journey',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currentStage: Attribute.Enumeration<
      [
        'discovery',
        'signup',
        'onboarding',
        'first_upload',
        'first_release',
        'first_earnings',
        'growth',
        'breakthrough',
        'success',
        'legendary'
      ]
    >;
    developmentGoals: Attribute.JSON;
    firstEarningsDate: Attribute.DateTime;
    firstReleaseDate: Attribute.DateTime;
    firstUploadDate: Attribute.DateTime;
    mentor: Attribute.Relation<
      'api::artist-journey.artist-journey',
      'manyToOne',
      'api::artist.artist'
    >;
    mentorshipStatus: Attribute.Enumeration<
      ['none', 'assigned', 'active', 'completed']
    >;
    milestones: Attribute.JSON;
    nextMilestone: Attribute.String;
    onboardingProgress: Attribute.Decimal & Attribute.DefaultTo<0>;
    profileCompletion: Attribute.Decimal & Attribute.DefaultTo<0>;
    recommendations: Attribute.JSON;
    stageHistory: Attribute.JSON;
    stageProgress: Attribute.Decimal & Attribute.DefaultTo<0>;
    successMetrics: Attribute.JSON;
    supportNeeded: Attribute.JSON;
    timeInCurrentStage: Attribute.Integer & Attribute.DefaultTo<0>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::artist-journey.artist-journey',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiArtistPerformanceArtistPerformance
  extends Schema.CollectionType {
  collectionName: 'artist_performances';
  info: {
    description: 'Real-time artist performance tracking and analytics';
    displayName: 'Artist Performance';
    pluralName: 'artist-performances';
    singularName: 'artist-performance';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    aiScore: Attribute.Decimal & Attribute.DefaultTo<0>;
    artist: Attribute.Relation<
      'api::artist-performance.artist-performance',
      'manyToOne',
      'api::artist.artist'
    >;
    audienceMetrics: Attribute.JSON;
    brandPartnershipPotential: Attribute.Decimal & Attribute.DefaultTo<0>;
    careerStage: Attribute.Enumeration<
      ['emerging', 'developing', 'established', 'breakthrough', 'legendary']
    >;
    collaborationOpportunities: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::artist-performance.artist-performance',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    earnings: Attribute.Decimal & Attribute.DefaultTo<0>;
    endDate: Attribute.Date;
    engagement: Attribute.Decimal & Attribute.DefaultTo<0>;
    geographicBreakdown: Attribute.JSON;
    growthRate: Attribute.Decimal & Attribute.DefaultTo<0>;
    marketFit: Attribute.Decimal & Attribute.DefaultTo<0>;
    nextMilestone: Attribute.String;
    period: Attribute.Enumeration<
      ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    >;
    platformBreakdown: Attribute.JSON;
    potentialScore: Attribute.Decimal & Attribute.DefaultTo<0>;
    recommendations: Attribute.JSON;
    startDate: Attribute.Date;
    streams: Attribute.BigInteger & Attribute.DefaultTo<0>;
    syncLicensingOpportunities: Attribute.Integer & Attribute.DefaultTo<0>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::artist-performance.artist-performance',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiArtistArtist extends Schema.CollectionType {
  collectionName: 'artists';
  info: {
    description: 'Artist profiles for distribution and publishing';
    displayName: 'Artist';
    pluralName: 'artists';
    singularName: 'artist';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    achievementBadges: Attribute.JSON;
    acquisitionDate: Attribute.DateTime;
    acquisitionSource: Attribute.Enumeration<
      [
        'organic',
        'referral',
        'social_media',
        'advertising',
        'partnership',
        'event',
        'ai_discovery'
      ]
    > &
      Attribute.DefaultTo<'organic'>;
    aiInsights: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::ai-insights.ai-insights'
    >;
    aiScore: Attribute.Decimal & Attribute.DefaultTo<0>;
    artistType: Attribute.Enumeration<
      [
        'solo_artist',
        'band_group',
        'dj',
        'duo',
        'orchestra',
        'ensemble',
        'collective'
      ]
    > &
      Attribute.Required;
    audienceDemographics: Attribute.JSON;
    automatedTriggers: Attribute.JSON;
    careerStage: Attribute.Enumeration<
      ['emerging', 'developing', 'established', 'breakthrough', 'legendary']
    > &
      Attribute.DefaultTo<'emerging'>;
    codeGroupIntegrations: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::code-group-integration.code-group-integration'
    >;
    collaborationPreferences: Attribute.JSON;
    collaborations: Attribute.Relation<
      'api::artist.artist',
      'manyToMany',
      'api::collaboration.collaboration'
    >;
    communications: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::communication.communication'
    >;
    contractStatus: Attribute.Enumeration<
      ['pending', 'signed', 'active', 'expired', 'renewal', 'inactive']
    > &
      Attribute.DefaultTo<'pending'>;
    cover: Attribute.Media<'images'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::artist.artist',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    creations: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::creation.creation'
    >;
    customBranding: Attribute.JSON;
    dateSigned: Attribute.Date;
    developmentGoals: Attribute.JSON;
    email: Attribute.Email & Attribute.Required;
    engagementRate: Attribute.Decimal & Attribute.DefaultTo<0>;
    firstName: Attribute.String & Attribute.Required;
    furtherInformation: Attribute.Text;
    genre: Attribute.Relation<
      'api::artist.artist',
      'manyToMany',
      'api::genre.genre'
    >;
    growthRate: Attribute.Decimal & Attribute.DefaultTo<0>;
    initiatedCollaborations: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::collaboration.collaboration'
    >;
    journey: Attribute.Relation<
      'api::artist.artist',
      'oneToOne',
      'api::artist-journey.artist-journey'
    >;
    lastName: Attribute.String & Attribute.Required;
    lyrics: Attribute.Relation<
      'api::artist.artist',
      'manyToMany',
      'api::lyric.lyric'
    >;
    manager: Attribute.Component<'artist.manager-info'>;
    marketFit: Attribute.Decimal & Attribute.DefaultTo<0>;
    mentees: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::artist.artist'
    >;
    mentor: Attribute.Relation<
      'api::artist.artist',
      'manyToOne',
      'api::artist.artist'
    >;
    mentorshipStatus: Attribute.Enumeration<
      ['none', 'seeking', 'assigned', 'active', 'completed']
    > &
      Attribute.DefaultTo<'none'>;
    name: Attribute.String & Attribute.Required;
    onboardingCompleted: Attribute.Boolean & Attribute.DefaultTo<false>;
    performances: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::artist-performance.artist-performance'
    >;
    phoneNumber: Attribute.String;
    potentialScore: Attribute.Decimal & Attribute.DefaultTo<0>;
    profileCompletion: Attribute.Decimal & Attribute.DefaultTo<0>;
    profilePhoto: Attribute.Media<'images'>;
    projects: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::project.project'
    >;
    recommendations: Attribute.JSON;
    referralCode: Attribute.String;
    referralNetworks: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::referral-network.referral-network'
    >;
    referrals: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::artist.artist'
    >;
    referredBy: Attribute.Relation<
      'api::artist.artist',
      'oneToMany',
      'api::referral-network.referral-network'
    >;
    socialMediaHandles: Attribute.JSON;
    socialMediaMetrics: Attribute.JSON;
    songs: Attribute.Relation<
      'api::artist.artist',
      'manyToMany',
      'api::song.song'
    >;
    stageName: Attribute.String & Attribute.Required;
    stems: Attribute.Relation<
      'api::artist.artist',
      'manyToMany',
      'api::stem.stem'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::artist.artist',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::artist.artist',
      'oneToOne',
      'plugin::users-permissions.user'
    >;
    whiteLabelBrand: Attribute.String;
  };
}

export interface ApiCodeGroupIntegrationCodeGroupIntegration
  extends Schema.CollectionType {
  collectionName: 'code_group_integrations';
  info: {
    description: 'Code Group API integration framework';
    displayName: 'Code Group Integration';
    pluralName: 'code-group-integrations';
    singularName: 'code-group-integration';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    aiInsights: Attribute.JSON;
    analyticsMetrics: Attribute.JSON;
    apiKey: Attribute.String;
    artist: Attribute.Relation<
      'api::code-group-integration.code-group-integration',
      'manyToOne',
      'api::artist.artist'
    >;
    automatedActions: Attribute.JSON;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::code-group-integration.code-group-integration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    data: Attribute.JSON;
    distributionMetrics: Attribute.JSON;
    endpoint: Attribute.String;
    errorLog: Attribute.JSON;
    integrationType: Attribute.Enumeration<
      ['streaming', 'sync_licensing', 'publishing', 'distribution', 'analytics']
    > &
      Attribute.Required;
    lastSync: Attribute.DateTime;
    mockData: Attribute.JSON;
    notes: Attribute.Text;
    performanceMetrics: Attribute.JSON;
    publishingMetrics: Attribute.JSON;
    recommendations: Attribute.JSON;
    status: Attribute.Enumeration<
      ['pending', 'active', 'error', 'disconnected']
    > &
      Attribute.DefaultTo<'pending'>;
    streamingMetrics: Attribute.JSON;
    syncFrequency: Attribute.Enumeration<
      ['realtime', 'hourly', 'daily', 'weekly', 'monthly']
    > &
      Attribute.DefaultTo<'daily'>;
    syncLicensingMetrics: Attribute.JSON;
    tags: Attribute.JSON;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::code-group-integration.code-group-integration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiCollaborationCollaboration extends Schema.CollectionType {
  collectionName: 'collaborations';
  info: {
    description: 'Artist collaboration project management';
    displayName: 'Collaboration';
    pluralName: 'collaborations';
    singularName: 'collaboration';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    achievements: Attribute.JSON;
    aiScore: Attribute.Decimal & Attribute.DefaultTo<0>;
    automatedTriggers: Attribute.JSON;
    challenges: Attribute.JSON;
    communication: Attribute.JSON;
    contributions: Attribute.JSON;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::collaboration.collaboration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    creation: Attribute.Relation<
      'api::collaboration.collaboration',
      'manyToOne',
      'api::creation.creation'
    >;
    deadline: Attribute.Date;
    description: Attribute.Text;
    endDate: Attribute.Date;
    files: Attribute.Media<'files' | 'images' | 'audios' | 'videos', true>;
    initiator: Attribute.Relation<
      'api::collaboration.collaboration',
      'manyToOne',
      'api::artist.artist'
    >;
    marketOpportunity: Attribute.Decimal & Attribute.DefaultTo<0>;
    nextSteps: Attribute.JSON;
    notes: Attribute.RichText;
    participants: Attribute.Relation<
      'api::collaboration.collaboration',
      'manyToMany',
      'api::artist.artist'
    >;
    potentialImpact: Attribute.Decimal & Attribute.DefaultTo<0>;
    priority: Attribute.Enumeration<['low', 'medium', 'high', 'urgent']> &
      Attribute.DefaultTo<'medium'>;
    progress: Attribute.Decimal & Attribute.DefaultTo<0>;
    project: Attribute.Relation<
      'api::collaboration.collaboration',
      'manyToOne',
      'api::project.project'
    >;
    publishedAt: Attribute.DateTime;
    recommendations: Attribute.JSON;
    revenueSharing: Attribute.JSON;
    roles: Attribute.JSON;
    startDate: Attribute.Date;
    status: Attribute.Enumeration<
      ['proposed', 'active', 'completed', 'cancelled']
    > &
      Attribute.DefaultTo<'proposed'>;
    tags: Attribute.JSON;
    title: Attribute.String & Attribute.Required;
    type: Attribute.Enumeration<
      [
        'feature',
        'remix',
        'production',
        'writing',
        'mixing',
        'mastering',
        'marketing',
        'distribution'
      ]
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::collaboration.collaboration',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    visibility: Attribute.Enumeration<['private', 'participants', 'public']> &
      Attribute.DefaultTo<'private'>;
  };
}

export interface ApiCommunicationCommunication extends Schema.CollectionType {
  collectionName: 'communications';
  info: {
    description: 'Multi-channel communication infrastructure';
    displayName: 'Communication';
    pluralName: 'communications';
    singularName: 'communication';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    aiOptimized: Attribute.Boolean & Attribute.DefaultTo<false>;
    automated: Attribute.Boolean & Attribute.DefaultTo<false>;
    brand: Attribute.Enumeration<['msc_co', 'yhwh_msc', 'audio_msc']> &
      Attribute.DefaultTo<'msc_co'>;
    channel: Attribute.Enumeration<
      ['email', 'sms', 'push', 'in_app', 'social_media', 'phone', 'video_call']
    > &
      Attribute.Required;
    content: Attribute.RichText;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::communication.communication',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    deliveredAt: Attribute.DateTime;
    engagement: Attribute.JSON;
    personalization: Attribute.JSON;
    priority: Attribute.Enumeration<['low', 'normal', 'high', 'urgent']> &
      Attribute.DefaultTo<'normal'>;
    readAt: Attribute.DateTime;
    recipient: Attribute.Relation<
      'api::communication.communication',
      'manyToOne',
      'api::artist.artist'
    >;
    response: Attribute.JSON;
    scheduledAt: Attribute.DateTime;
    sender: Attribute.Relation<
      'api::communication.communication',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    sentAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['draft', 'scheduled', 'sent', 'delivered', 'read', 'failed']
    > &
      Attribute.DefaultTo<'draft'>;
    subject: Attribute.String;
    tags: Attribute.JSON;
    template: Attribute.String;
    tracking: Attribute.JSON;
    trigger: Attribute.String;
    type: Attribute.Enumeration<
      [
        'welcome',
        'onboarding',
        'milestone',
        'recommendation',
        'alert',
        'promotion',
        'support',
        'collaboration'
      ]
    > &
      Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::communication.communication',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    variables: Attribute.JSON;
    whiteLabelBrand: Attribute.String;
  };
}

export interface ApiCreationCreation extends Schema.CollectionType {
  collectionName: 'creations';
  info: {
    description: 'Individual tracks/songs that make up a project';
    displayName: 'Creation';
    pluralName: 'creations';
    singularName: 'creation';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    additionalInstrumentation: Attribute.Text;
    additionalProduction: Attribute.Text;
    akaFka: Attribute.String;
    allMusic: Attribute.String;
    altTitle: Attribute.String;
    appleId: Attribute.String;
    arranger: Attribute.String;
    artist: Attribute.Relation<
      'api::creation.creation',
      'manyToOne',
      'api::artist.artist'
    >;
    artistEmail: Attribute.Email;
    artistName: Attribute.String;
    artistType: Attribute.String;
    ascapWorkNumber: Attribute.String;
    assistantProducer: Attribute.String;
    audioFile: Attribute.Media<'audios'>;
    audioFileName: Attribute.String;
    backgroundVocalists: Attribute.Text;
    barcode: Attribute.String;
    bass: Attribute.String;
    bmiWorkNumber: Attribute.String;
    bookingAgent: Attribute.String;
    bowi: Attribute.String;
    bpm: Attribute.Integer;
    caeIpi: Attribute.String;
    catalogueNo: Attribute.String;
    cLine: Attribute.String;
    companyName: Attribute.String;
    composer: Attribute.String;
    composerAuthor: Attribute.String;
    coProducer: Attribute.String;
    copyrightOwner: Attribute.String;
    copyrightYear: Attribute.Integer;
    coverFileName: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::creation.creation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    credits: Attribute.Text;
    designArtDirection: Attribute.String;
    digitalAssetsFolder: Attribute.String;
    discogs: Attribute.String;
    distributionCompany: Attribute.String;
    drums: Attribute.String;
    duration: Attribute.Integer;
    editing: Attribute.String;
    engineer: Attribute.String;
    exclusivity: Attribute.Enumeration<
      ['exclusive', 'non_exclusive', 'limited']
    > &
      Attribute.DefaultTo<'exclusive'>;
    executiveProducer: Attribute.String;
    featuringArtists: Attribute.Text;
    format: Attribute.Enumeration<
      ['digital', 'cd', 'vinyl', 'cassette', 'streaming']
    >;
    genius: Attribute.String;
    genre: Attribute.Relation<
      'api::creation.creation',
      'manyToMany',
      'api::genre.genre'
    >;
    guitars: Attribute.String;
    iceWorkKey: Attribute.String;
    imdb: Attribute.String;
    initials: Attribute.String;
    instagram: Attribute.String;
    internalNotes: Attribute.Text & Attribute.Private;
    isExplicit: Attribute.Boolean & Attribute.DefaultTo<false>;
    isInstrumental: Attribute.Boolean & Attribute.DefaultTo<false>;
    isni: Attribute.String;
    isrc: Attribute.String;
    iswc: Attribute.String;
    jaxsta: Attribute.String;
    key: Attribute.String;
    keyboards: Attribute.String;
    knowledgePanel: Attribute.String;
    label: Attribute.String;
    language: Attribute.String;
    legalNames: Attribute.Text;
    licenseDuration: Attribute.Enumeration<
      [
        'perpetual',
        'one_year_duration',
        'two_years_duration',
        'five_years_duration',
        'ten_years_duration',
        'custom'
      ]
    > &
      Attribute.DefaultTo<'perpetual'>;
    licenseEndDate: Attribute.Date;
    licenseStartDate: Attribute.Date;
    licenseType: Attribute.Enumeration<
      [
        'all_rights',
        'sync_only',
        'performance_only',
        'mechanical_only',
        'custom'
      ]
    > &
      Attribute.DefaultTo<'all_rights'>;
    luminate: Attribute.String;
    lyrics: Attribute.Text;
    management: Attribute.String;
    masteringDate: Attribute.Date;
    masteringEngineer: Attribute.String;
    masteringStudio: Attribute.String;
    mechanical: Attribute.String;
    mechanicalRights: Attribute.Text;
    mediabase: Attribute.String;
    metadataApproved: Attribute.Boolean & Attribute.DefaultTo<false>;
    mixDate: Attribute.Date;
    mixer: Attribute.String;
    mood: Attribute.Enumeration<
      [
        'energetic',
        'calm',
        'melancholic',
        'uplifting',
        'dark',
        'romantic',
        'aggressive',
        'peaceful',
        'mysterious',
        'joyful'
      ]
    >;
    musicbrainz: Attribute.String;
    notes: Attribute.Text;
    organ: Attribute.String;
    percussion: Attribute.String;
    performanceRights: Attribute.Text;
    phoneticPronunciation: Attribute.String;
    pLine: Attribute.String;
    preReleaseDate: Attribute.Date;
    preReleaseUrl: Attribute.String;
    pressContact: Attribute.String;
    previouslyReleased: Attribute.Boolean & Attribute.DefaultTo<false>;
    previousReleaseDate: Attribute.Date;
    primaryContactEmail: Attribute.Email;
    primaryContactNumber: Attribute.String;
    priority: Attribute.Enumeration<['low', 'medium', 'high', 'urgent']> &
      Attribute.DefaultTo<'medium'>;
    pro: Attribute.String;
    producer: Attribute.String;
    productTitle: Attribute.String;
    productType: Attribute.Enumeration<
      ['single', 'ep', 'album', 'compilation', 'soundtrack']
    >;
    programming: Attribute.String;
    project: Attribute.Relation<
      'api::creation.creation',
      'manyToOne',
      'api::project.project'
    >;
    publishedAt: Attribute.DateTime;
    publisherIpi: Attribute.String;
    publishing: Attribute.String;
    publishingAdmin: Attribute.String;
    publishingAdminIpi: Attribute.String;
    publishingRights: Attribute.Text;
    publishingType: Attribute.Enumeration<
      ['exclusive', 'co_publishing', 'administration', 'sub_publishing']
    >;
    recordingCountry: Attribute.String;
    recordingDate: Attribute.Date;
    recordingStudio: Attribute.String;
    releaseDate: Attribute.Date;
    releaseLabel: Attribute.String;
    releaseUrl: Attribute.String;
    restrictions: Attribute.Text;
    role: Attribute.String;
    secondaryContactNumber: Attribute.String;
    shazam: Attribute.String;
    socialMediaLink: Attribute.String;
    spotifyUri: Attribute.String;
    status: Attribute.Enumeration<
      ['draft', 'in_progress', 'completed', 'approved', 'rejected', 'archived']
    > &
      Attribute.DefaultTo<'draft'>;
    strings: Attribute.String;
    stylised: Attribute.String;
    subGenre: Attribute.String;
    submittedToStores: Attribute.Boolean & Attribute.DefaultTo<false>;
    subPublisher: Attribute.String;
    syncRights: Attribute.Text;
    tags: Attribute.JSON;
    tempo: Attribute.Enumeration<
      ['very_slow', 'slow', 'medium', 'fast', 'very_fast']
    >;
    territory: Attribute.JSON;
    tiktok: Attribute.String;
    title: Attribute.String & Attribute.Required;
    tourDates: Attribute.String;
    trackNumber: Attribute.Integer &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    trackPosition: Attribute.String;
    tunecode: Attribute.String;
    upc: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::creation.creation',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    usageNotes: Attribute.Text;
    version: Attribute.String;
    vocals: Attribute.Enumeration<
      [
        'none',
        'male',
        'female',
        'duet',
        'group',
        'choir',
        'harmony',
        'rap',
        'spoken_word'
      ]
    >;
    vocalType: Attribute.Enumeration<
      ['lead', 'backing', 'harmony', 'choir', 'none']
    >;
    waveformData: Attribute.JSON;
    website: Attribute.String;
    wikipedia: Attribute.String;
    youtube: Attribute.String;
    youtubeMusic: Attribute.String;
  };
}

export interface ApiDownloadHistoryDownloadHistory
  extends Schema.CollectionType {
  collectionName: 'download_histories';
  info: {
    description: 'Track user downloads for analytics and history';
    displayName: 'Download History';
    pluralName: 'download-histories';
    singularName: 'download-history';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    contentId: Attribute.Integer & Attribute.Required;
    contentTitle: Attribute.String & Attribute.Required;
    contentType: Attribute.Enumeration<['song', 'stem', 'lyric']> &
      Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::download-history.download-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    creditsSpent: Attribute.Integer & Attribute.Required;
    downloadDate: Attribute.DateTime & Attribute.Required;
    ipAddress: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::download-history.download-history',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::download-history.download-history',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    userAgent: Attribute.Text;
  };
}

export interface ApiGenreGenre extends Schema.CollectionType {
  collectionName: 'genres';
  info: {
    description: '';
    displayName: 'Genre';
    pluralName: 'genres';
    singularName: 'genre';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    artists: Attribute.Relation<
      'api::genre.genre',
      'manyToMany',
      'api::artist.artist'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::genre.genre',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    creations: Attribute.Relation<
      'api::genre.genre',
      'manyToMany',
      'api::creation.creation'
    >;
    lyrics: Attribute.Relation<
      'api::genre.genre',
      'manyToMany',
      'api::lyric.lyric'
    >;
    playlists: Attribute.Relation<
      'api::genre.genre',
      'manyToMany',
      'api::playlist.playlist'
    >;
    projects: Attribute.Relation<
      'api::genre.genre',
      'manyToMany',
      'api::project.project'
    >;
    songs: Attribute.Relation<
      'api::genre.genre',
      'manyToMany',
      'api::song.song'
    >;
    stem: Attribute.Relation<'api::genre.genre', 'manyToOne', 'api::stem.stem'>;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::genre.genre',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiLyricLyric extends Schema.CollectionType {
  collectionName: 'lyrics';
  info: {
    description: '';
    displayName: 'Lyric';
    pluralName: 'lyrics';
    singularName: 'lyric';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::lyric.lyric',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    genres: Attribute.Relation<
      'api::lyric.lyric',
      'manyToMany',
      'api::genre.genre'
    >;
    publishedAt: Attribute.DateTime;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::lyric.lyric',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    verses: Attribute.Component<'lyric.verse', true>;
    writers: Attribute.Relation<
      'api::lyric.lyric',
      'manyToMany',
      'api::artist.artist'
    >;
  };
}

export interface ApiMonthlyStatementMonthlyStatement
  extends Schema.CollectionType {
  collectionName: 'monthly_statements';
  info: {
    description: 'Monthly earnings statements for artists';
    displayName: 'Monthly Statement';
    pluralName: 'monthly-statements';
    singularName: 'monthly-statement';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::monthly-statement.monthly-statement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    currency: Attribute.Enumeration<['GBP', 'USD', 'EUR', 'CAD', 'AUD']> &
      Attribute.DefaultTo<'GBP'>;
    downloadStats: Attribute.JSON;
    generated: Attribute.Boolean & Attribute.DefaultTo<false>;
    geographicBreakdown: Attribute.JSON;
    growthPercentage: Attribute.Decimal;
    licensingRevenue: Attribute.Decimal & Attribute.DefaultTo<0>;
    mechanicalRevenue: Attribute.Decimal & Attribute.DefaultTo<0>;
    month: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      >;
    notes: Attribute.Text;
    performanceRevenue: Attribute.Decimal & Attribute.DefaultTo<0>;
    platformBreakdown: Attribute.JSON;
    publishingRevenue: Attribute.Decimal & Attribute.DefaultTo<0>;
    sent: Attribute.Boolean & Attribute.DefaultTo<false>;
    sentDate: Attribute.DateTime;
    statementDate: Attribute.DateTime & Attribute.Required;
    streamingStats: Attribute.JSON;
    syncRevenue: Attribute.Decimal & Attribute.DefaultTo<0>;
    topPerformingTracks: Attribute.JSON;
    topPlatforms: Attribute.JSON;
    totalDownloads: Attribute.Integer & Attribute.DefaultTo<0>;
    totalEarnings: Attribute.Decimal & Attribute.Required;
    totalLicenses: Attribute.Integer & Attribute.DefaultTo<0>;
    totalStreams: Attribute.Integer & Attribute.DefaultTo<0>;
    trackBreakdown: Attribute.JSON;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::monthly-statement.monthly-statement',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    user: Attribute.Relation<
      'api::monthly-statement.monthly-statement',
      'manyToOne',
      'plugin::users-permissions.user'
    >;
    year: Attribute.Integer & Attribute.Required;
  };
}

export interface ApiPlaylistPlaylist extends Schema.CollectionType {
  collectionName: 'playlists';
  info: {
    description: '';
    displayName: 'Playlist';
    pluralName: 'playlists';
    singularName: 'playlist';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    cover: Attribute.Media<'images'> & Attribute.Required;
    coverBackground: Attribute.Media<'images'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::playlist.playlist',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    genres: Attribute.Relation<
      'api::playlist.playlist',
      'manyToMany',
      'api::genre.genre'
    >;
    publishedAt: Attribute.DateTime;
    songs: Attribute.Relation<
      'api::playlist.playlist',
      'manyToMany',
      'api::song.song'
    >;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::playlist.playlist',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiProjectProject extends Schema.CollectionType {
  collectionName: 'projects';
  info: {
    description: 'Music projects containing multiple tracks/creations';
    displayName: 'Project';
    pluralName: 'projects';
    singularName: 'project';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    actualReleaseDate: Attribute.Date;
    artist: Attribute.Relation<
      'api::project.project',
      'manyToOne',
      'api::artist.artist'
    >;
    artwork: Attribute.Media<'images'>;
    budget: Attribute.Decimal;
    coverImage: Attribute.Media<'images'>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::project.project',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    creations: Attribute.Relation<
      'api::project.project',
      'oneToMany',
      'api::creation.creation'
    >;
    credits: Attribute.Text;
    currency: Attribute.Enumeration<['GBP', 'USD', 'EUR', 'CAD', 'AUD']> &
      Attribute.DefaultTo<'GBP'>;
    exclusivity: Attribute.Enumeration<
      ['exclusive', 'non_exclusive', 'limited']
    > &
      Attribute.DefaultTo<'exclusive'>;
    expectedReleaseDate: Attribute.Date;
    feedback: Attribute.Text;
    genre: Attribute.Relation<
      'api::project.project',
      'manyToOne',
      'api::genre.genre'
    >;
    isExplicit: Attribute.Boolean & Attribute.DefaultTo<false>;
    language: Attribute.String;
    lastUpdated: Attribute.DateTime;
    licenseDuration: Attribute.Enumeration<
      [
        'perpetual',
        'one_year_duration',
        'two_years_duration',
        'five_years_duration',
        'ten_years_duration',
        'custom'
      ]
    > &
      Attribute.DefaultTo<'perpetual'>;
    licenseEndDate: Attribute.Date;
    licenseStartDate: Attribute.Date;
    licenseType: Attribute.Enumeration<
      [
        'all_rights',
        'sync_only',
        'performance_only',
        'mechanical_only',
        'custom'
      ]
    > &
      Attribute.DefaultTo<'all_rights'>;
    marketingPlan: Attribute.Text;
    mechanicalRights: Attribute.Text;
    mood: Attribute.Enumeration<
      [
        'energetic',
        'calm',
        'melancholic',
        'uplifting',
        'dark',
        'romantic',
        'aggressive',
        'peaceful',
        'mysterious',
        'joyful'
      ]
    >;
    musicFiles: Attribute.Media<'audios', true>;
    performanceRights: Attribute.Text;
    priority: Attribute.Enumeration<['low', 'medium', 'high', 'urgent']> &
      Attribute.DefaultTo<'medium'>;
    projectName: Attribute.String & Attribute.Required;
    publishedAt: Attribute.DateTime;
    publishingNotes: Attribute.Text;
    publishingRights: Attribute.Text;
    releaseDate: Attribute.Date;
    releaseType: Attribute.Enumeration<
      [
        'single',
        'ep',
        'album',
        'mixtape',
        'compilation',
        'live_album',
        'remix_album',
        'soundtrack'
      ]
    > &
      Attribute.Required;
    restrictions: Attribute.Text;
    status: Attribute.Enumeration<
      [
        'draft',
        'in_progress',
        'under_review',
        'approved',
        'scheduled',
        'released',
        'cancelled'
      ]
    > &
      Attribute.Required &
      Attribute.DefaultTo<'draft'>;
    submissionDate: Attribute.Date;
    syncRights: Attribute.Text;
    tags: Attribute.JSON;
    tempo: Attribute.Enumeration<
      ['very_slow', 'slow', 'medium', 'fast', 'very_fast']
    >;
    territory: Attribute.JSON;
    totalDuration: Attribute.Integer;
    trackCount: Attribute.Integer;
    trackListing: Attribute.Component<'project.track-listing', true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::project.project',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    usageNotes: Attribute.Text;
  };
}

export interface ApiReferralNetworkReferralNetwork
  extends Schema.CollectionType {
  collectionName: 'referral_networks';
  info: {
    description: 'Referral and networking system foundation';
    displayName: 'Referral Network';
    pluralName: 'referral-networks';
    singularName: 'referral-network';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    aiInsights: Attribute.JSON;
    collaborationOpportunities: Attribute.Integer & Attribute.DefaultTo<0>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::referral-network.referral-network',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    firstEarningsDate: Attribute.DateTime;
    firstReleaseDate: Attribute.DateTime;
    firstUploadDate: Attribute.DateTime;
    influenceScore: Attribute.Decimal & Attribute.DefaultTo<0>;
    networkGrowth: Attribute.Decimal & Attribute.DefaultTo<0>;
    networkLevel: Attribute.Enumeration<
      ['direct', 'second_degree', 'third_degree']
    > &
      Attribute.DefaultTo<'direct'>;
    networkPath: Attribute.JSON;
    notes: Attribute.Text;
    onboardingCompleted: Attribute.Boolean & Attribute.DefaultTo<false>;
    recommendations: Attribute.JSON;
    referralCode: Attribute.String & Attribute.Required;
    referralDate: Attribute.DateTime;
    referredArtist: Attribute.Relation<
      'api::referral-network.referral-network',
      'manyToOne',
      'api::artist.artist'
    >;
    referrer: Attribute.Relation<
      'api::referral-network.referral-network',
      'manyToOne',
      'api::artist.artist'
    >;
    rewardAmount: Attribute.Decimal & Attribute.DefaultTo<0>;
    rewardStatus: Attribute.Enumeration<
      ['pending', 'earned', 'paid', 'expired']
    > &
      Attribute.DefaultTo<'pending'>;
    rewardType: Attribute.Enumeration<
      ['commission', 'bonus', 'credit', 'featured_placement', 'mentorship']
    > &
      Attribute.DefaultTo<'commission'>;
    signupDate: Attribute.DateTime;
    source: Attribute.Enumeration<
      [
        'direct',
        'social_media',
        'email',
        'website',
        'event',
        'partnership',
        'ai_discovery'
      ]
    > &
      Attribute.Required;
    status: Attribute.Enumeration<
      ['pending', 'active', 'completed', 'expired', 'cancelled']
    > &
      Attribute.DefaultTo<'pending'>;
    tags: Attribute.JSON;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::referral-network.referral-network',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface ApiSongSong extends Schema.CollectionType {
  collectionName: 'songs';
  info: {
    description: '';
    displayName: 'Song';
    pluralName: 'songs';
    singularName: 'song';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    bpm: Attribute.Integer;
    cover: Attribute.Media<'images'> & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::song.song', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    credit: Attribute.Integer & Attribute.Required;
    genres: Attribute.Relation<
      'api::song.song',
      'manyToMany',
      'api::genre.genre'
    >;
    length: Attribute.Integer;
    majorKeys: Attribute.JSON &
      Attribute.CustomField<
        'plugin::multi-select.multi-select',
        ['A', 'Ab', 'B', 'Bb', 'C', 'D', 'Db', 'E', 'Eb', 'F', 'F#', 'G']
      >;
    mediaPreview: Attribute.Media<'audios'> & Attribute.Required;
    mediaPreviewPeaks: Attribute.JSON;
    minorKeys: Attribute.JSON &
      Attribute.CustomField<
        'plugin::multi-select.multi-select',
        ['A', 'Ab', 'B', 'Bb', 'C', 'D', 'Db', 'E', 'Eb', 'F', 'F#', 'G']
      >;
    playlists: Attribute.Relation<
      'api::song.song',
      'manyToMany',
      'api::playlist.playlist'
    >;
    publishedAt: Attribute.DateTime;
    singers: Attribute.Relation<
      'api::song.song',
      'manyToMany',
      'api::artist.artist'
    >;
    title: Attribute.String & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::song.song', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    vocals: Attribute.JSON &
      Attribute.CustomField<
        'plugin::multi-select.multi-select',
        [
          'Ambient',
          'Choir',
          'Duet',
          'Female',
          'Group',
          'Harmony',
          'Male',
          'Oohs & Ahhs',
          'Shouts'
        ]
      >;
  };
}

export interface ApiStemStem extends Schema.CollectionType {
  collectionName: 'stems';
  info: {
    description: '';
    displayName: 'Stem';
    pluralName: 'stems';
    singularName: 'stem';
  };
  options: {
    draftAndPublish: true;
  };
  attributes: {
    artists: Attribute.Relation<
      'api::stem.stem',
      'manyToMany',
      'api::artist.artist'
    >;
    bpm: Attribute.Integer;
    cover: Attribute.Media<'images'> & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<'api::stem.stem', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    credit: Attribute.Integer & Attribute.Required & Attribute.DefaultTo<1>;
    fullPreview: Attribute.Media<'audios'> & Attribute.Required;
    fullPreviewPeaks: Attribute.JSON;
    genres: Attribute.Relation<
      'api::stem.stem',
      'oneToMany',
      'api::genre.genre'
    >;
    image: Attribute.Media<'images'> & Attribute.Required;
    key: Attribute.String;
    length: Attribute.Integer;
    publishedAt: Attribute.DateTime;
    title: Attribute.String & Attribute.Required;
    tracks: Attribute.Component<'stems.track', true>;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<'api::stem.stem', 'oneToOne', 'admin::user'> &
      Attribute.Private;
    vocals: Attribute.Enumeration<
      [
        'Ambient',
        'Choir',
        'Duet',
        'Female',
        'Group',
        'Harmony',
        'Male',
        'Oohs & Ahhs',
        'Shouts'
      ]
    >;
  };
}

export interface ApiWorkflowTriggerWorkflowTrigger
  extends Schema.CollectionType {
  collectionName: 'workflow_triggers';
  info: {
    description: 'Automated workflow triggers for onboarding and artist development';
    displayName: 'Workflow Trigger';
    pluralName: 'workflow-triggers';
    singularName: 'workflow-trigger';
  };
  options: {
    draftAndPublish: false;
  };
  attributes: {
    actions: Attribute.JSON & Attribute.Required;
    aiOptimized: Attribute.Boolean & Attribute.DefaultTo<false>;
    brand: Attribute.Enumeration<['msc_co', 'yhwh_msc', 'audio_msc', 'all']> &
      Attribute.DefaultTo<'msc_co'>;
    conditions: Attribute.JSON;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'api::workflow-trigger.workflow-trigger',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.Text;
    errorLog: Attribute.JSON;
    event: Attribute.Enumeration<
      [
        'artist_signup',
        'profile_completion',
        'first_upload',
        'first_release',
        'first_earnings',
        'milestone_reached',
        'collaboration_request',
        'performance_drop',
        'growth_spike',
        'engagement_change'
      ]
    > &
      Attribute.Required;
    executionCount: Attribute.Integer & Attribute.DefaultTo<0>;
    executionHistory: Attribute.JSON;
    lastExecuted: Attribute.DateTime;
    name: Attribute.String & Attribute.Required;
    nextExecution: Attribute.DateTime;
    personalization: Attribute.JSON;
    priority: Attribute.Enumeration<['low', 'normal', 'high', 'critical']> &
      Attribute.DefaultTo<'normal'>;
    schedule: Attribute.JSON;
    status: Attribute.Enumeration<['active', 'inactive', 'draft', 'testing']> &
      Attribute.DefaultTo<'draft'>;
    successMetrics: Attribute.JSON;
    successRate: Attribute.Decimal & Attribute.DefaultTo<0>;
    tags: Attribute.JSON;
    targetAudience: Attribute.Enumeration<
      [
        'all_artists',
        'new_artists',
        'emerging_artists',
        'established_artists',
        'specific_artists',
        'ai_selected'
      ]
    > &
      Attribute.DefaultTo<'all_artists'>;
    triggerType: Attribute.Enumeration<
      ['event', 'schedule', 'condition', 'manual', 'ai_driven']
    > &
      Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'api::workflow-trigger.workflow-trigger',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    whiteLabelBrand: Attribute.String;
  };
}

export interface PluginContentReleasesRelease extends Schema.CollectionType {
  collectionName: 'strapi_releases';
  info: {
    displayName: 'Release';
    pluralName: 'releases';
    singularName: 'release';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    actions: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToMany',
      'plugin::content-releases.release-action'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String & Attribute.Required;
    releasedAt: Attribute.DateTime;
    scheduledAt: Attribute.DateTime;
    status: Attribute.Enumeration<
      ['ready', 'blocked', 'failed', 'done', 'empty']
    > &
      Attribute.Required;
    timezone: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginContentReleasesReleaseAction
  extends Schema.CollectionType {
  collectionName: 'strapi_release_actions';
  info: {
    displayName: 'Release Action';
    pluralName: 'release-actions';
    singularName: 'release-action';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    contentType: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    entry: Attribute.Relation<
      'plugin::content-releases.release-action',
      'morphToOne'
    >;
    isEntryValid: Attribute.Boolean;
    locale: Attribute.String;
    release: Attribute.Relation<
      'plugin::content-releases.release-action',
      'manyToOne',
      'plugin::content-releases.release'
    >;
    type: Attribute.Enumeration<['publish', 'unpublish']> & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::content-releases.release-action',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginI18NLocale extends Schema.CollectionType {
  collectionName: 'i18n_locale';
  info: {
    collectionName: 'locales';
    description: '';
    displayName: 'Locale';
    pluralName: 'locales';
    singularName: 'locale';
  };
  options: {
    draftAndPublish: false;
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    code: Attribute.String & Attribute.Unique;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    name: Attribute.String &
      Attribute.SetMinMax<
        {
          max: 50;
          min: 1;
        },
        number
      >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::i18n.locale',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUploadFile extends Schema.CollectionType {
  collectionName: 'files';
  info: {
    description: '';
    displayName: 'File';
    pluralName: 'files';
    singularName: 'file';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    alternativeText: Attribute.String;
    caption: Attribute.String;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    ext: Attribute.String;
    folder: Attribute.Relation<
      'plugin::upload.file',
      'manyToOne',
      'plugin::upload.folder'
    > &
      Attribute.Private;
    folderPath: Attribute.String &
      Attribute.Required &
      Attribute.Private &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    formats: Attribute.JSON;
    hash: Attribute.String & Attribute.Required;
    height: Attribute.Integer;
    mime: Attribute.String & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    previewUrl: Attribute.String;
    provider: Attribute.String & Attribute.Required;
    provider_metadata: Attribute.JSON;
    related: Attribute.Relation<'plugin::upload.file', 'morphToMany'>;
    size: Attribute.Decimal & Attribute.Required;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.file',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    url: Attribute.String & Attribute.Required;
    width: Attribute.Integer;
  };
}

export interface PluginUploadFolder extends Schema.CollectionType {
  collectionName: 'upload_folders';
  info: {
    displayName: 'Folder';
    pluralName: 'folders';
    singularName: 'folder';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    children: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.folder'
    >;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    files: Attribute.Relation<
      'plugin::upload.folder',
      'oneToMany',
      'plugin::upload.file'
    >;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    parent: Attribute.Relation<
      'plugin::upload.folder',
      'manyToOne',
      'plugin::upload.folder'
    >;
    path: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
    pathId: Attribute.Integer & Attribute.Required & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::upload.folder',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsPermission
  extends Schema.CollectionType {
  collectionName: 'up_permissions';
  info: {
    description: '';
    displayName: 'Permission';
    name: 'permission';
    pluralName: 'permissions';
    singularName: 'permission';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    action: Attribute.String & Attribute.Required;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.permission',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.permission',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
  };
}

export interface PluginUsersPermissionsRole extends Schema.CollectionType {
  collectionName: 'up_roles';
  info: {
    description: '';
    displayName: 'Role';
    name: 'role';
    pluralName: 'roles';
    singularName: 'role';
  };
  pluginOptions: {
    'content-manager': {
      visible: false;
    };
    'content-type-builder': {
      visible: false;
    };
  };
  attributes: {
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    description: Attribute.String;
    name: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    permissions: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.permission'
    >;
    type: Attribute.String & Attribute.Unique;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    users: Attribute.Relation<
      'plugin::users-permissions.role',
      'oneToMany',
      'plugin::users-permissions.user'
    >;
  };
}

export interface PluginUsersPermissionsUser extends Schema.CollectionType {
  collectionName: 'up_users';
  info: {
    description: '';
    displayName: 'User';
    name: 'user';
    pluralName: 'users';
    singularName: 'user';
  };
  options: {
    draftAndPublish: false;
    timestamps: true;
  };
  attributes: {
    artist: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'api::artist.artist'
    >;
    bio: Attribute.Text;
    blocked: Attribute.Boolean & Attribute.DefaultTo<false>;
    company: Attribute.String;
    confirmationToken: Attribute.String & Attribute.Private;
    confirmed: Attribute.Boolean & Attribute.DefaultTo<false>;
    createdAt: Attribute.DateTime;
    createdBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    credit: Attribute.Integer;
    downloadHistories: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::download-history.download-history'
    >;
    email: Attribute.Email &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    emailVerificationCode: Attribute.String & Attribute.Private;
    emailVerificationExpires: Attribute.DateTime;
    emailVerified: Attribute.Boolean & Attribute.DefaultTo<false>;
    firstName: Attribute.String & Attribute.Required;
    jobTitle: Attribute.String;
    lastName: Attribute.String;
    mobileNumber: Attribute.String;
    mobileVerificationCode: Attribute.String & Attribute.Private;
    mobileVerificationExpires: Attribute.DateTime;
    mobileVerified: Attribute.Boolean & Attribute.DefaultTo<false>;
    monthlyStatements: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToMany',
      'api::monthly-statement.monthly-statement'
    >;
    password: Attribute.Password &
      Attribute.Private &
      Attribute.SetMinMaxLength<{
        minLength: 6;
      }>;
    planActive: Attribute.Boolean;
    planId: Attribute.String;
    productId: Attribute.String;
    profileComplete: Attribute.Boolean & Attribute.DefaultTo<false>;
    profileImage: Attribute.Media<'images'>;
    provider: Attribute.String;
    recoveryCodes: Attribute.JSON & Attribute.Private;
    resetPasswordToken: Attribute.String & Attribute.Private;
    role: Attribute.Relation<
      'plugin::users-permissions.user',
      'manyToOne',
      'plugin::users-permissions.role'
    >;
    stripeCustomerId: Attribute.String;
    subscriptionId: Attribute.String;
    updatedAt: Attribute.DateTime;
    updatedBy: Attribute.Relation<
      'plugin::users-permissions.user',
      'oneToOne',
      'admin::user'
    > &
      Attribute.Private;
    username: Attribute.String &
      Attribute.Required &
      Attribute.Unique &
      Attribute.SetMinMaxLength<{
        minLength: 3;
      }>;
    website: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface ContentTypes {
      'admin::api-token': AdminApiToken;
      'admin::api-token-permission': AdminApiTokenPermission;
      'admin::permission': AdminPermission;
      'admin::role': AdminRole;
      'admin::transfer-token': AdminTransferToken;
      'admin::transfer-token-permission': AdminTransferTokenPermission;
      'admin::user': AdminUser;
      'api::ai-insight.ai-insight': ApiAiInsightAiInsight;
      'api::artist-journey.artist-journey': ApiArtistJourneyArtistJourney;
      'api::artist-performance.artist-performance': ApiArtistPerformanceArtistPerformance;
      'api::artist.artist': ApiArtistArtist;
      'api::code-group-integration.code-group-integration': ApiCodeGroupIntegrationCodeGroupIntegration;
      'api::collaboration.collaboration': ApiCollaborationCollaboration;
      'api::communication.communication': ApiCommunicationCommunication;
      'api::creation.creation': ApiCreationCreation;
      'api::download-history.download-history': ApiDownloadHistoryDownloadHistory;
      'api::genre.genre': ApiGenreGenre;
      'api::lyric.lyric': ApiLyricLyric;
      'api::monthly-statement.monthly-statement': ApiMonthlyStatementMonthlyStatement;
      'api::playlist.playlist': ApiPlaylistPlaylist;
      'api::project.project': ApiProjectProject;
      'api::referral-network.referral-network': ApiReferralNetworkReferralNetwork;
      'api::song.song': ApiSongSong;
      'api::stem.stem': ApiStemStem;
      'api::workflow-trigger.workflow-trigger': ApiWorkflowTriggerWorkflowTrigger;
      'plugin::content-releases.release': PluginContentReleasesRelease;
      'plugin::content-releases.release-action': PluginContentReleasesReleaseAction;
      'plugin::i18n.locale': PluginI18NLocale;
      'plugin::upload.file': PluginUploadFile;
      'plugin::upload.folder': PluginUploadFolder;
      'plugin::users-permissions.permission': PluginUsersPermissionsPermission;
      'plugin::users-permissions.role': PluginUsersPermissionsRole;
      'plugin::users-permissions.user': PluginUsersPermissionsUser;
    }
  }
}
