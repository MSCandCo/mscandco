import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get user from session
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's role and permissions
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, label_admin_id, company_admin_id, default_label_admin_id')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const {
      // Basic Release Information
      projectName,
      artistName,
      releaseTitle,
      releaseType,
      primaryGenre,
      secondaryGenres,
      language,
      releaseDate,
      originalReleaseDate,
      
      // Catalog & Identification
      catalogueNo,
      barcode,
      upc,
      isrc,
      tunecode,
      iceWorkKey,
      iswc,
      bowi,
      
      // Publishing Information
      composer,
      lyricist,
      publisher,
      publisherSplit,
      publishingType,
      pro,
      caeIpi,
      
      // Audio Information
      duration,
      bpm,
      songKey,
      explicit,
      
      // Production Credits
      producer,
      coproducer,
      executiveProducer,
      mixingEngineer,
      masteringEngineer,
      recordingEngineer,
      assistantProducer,
      additionalProduction,
      engineer,
      editing,
      
      // Studio Information
      recordingStudio,
      masteringStudio,
      recordingLocation,
      
      // Instrumentation
      keyboards,
      programming,
      bass,
      drums,
      guitars,
      organ,
      percussion,
      strings,
      additionalInstrumentation,
      
      // Creative Information
      designArtDirection,
      artworkPhotographer,
      artworkDesigner,
      
      // Professional Contacts
      management,
      bookingAgent,
      pressContact,
      labelContact,
      
      // Online Presence & Marketing
      website,
      socialMedia,
      
      // Distribution & Platforms
      distributionPlatforms,
      excludedTerritories,
      distributionStartDate,
      distributionEndDate,
      digitalReleaseDate,
      physicalReleaseDate,
      
      // Rights & Licensing
      masterOwner,
      publishingOwner,
      copyrightHolder,
      copyrightYear,
      recordingYear,
      publishingYear,
      
      // Commercial Information
      suggestedRetailPrice,
      wholesalePrice,
      digitalPrice,
      
      // Additional Metadata
      mood,
      tempo,
      instruments,
      vocals,
      songwriters,
      
      // Marketing & Promotion
      marketingPlan,
      targetAudience,
      campaignBudget,
      promotionalAssets,
      
      // Legal & Business
      splitSheets,
      contracts,
      clearances,
      
      // Release Notes & Internal
      releaseNotes,
      internalNotes,
      specialInstructions,
      
      // Workflow specific fields
      status,
      workflowStep,
      artistCanEdit,
      
      // Revenue split
      artistPercentage,
      labelPercentage,
      companyPercentage,
      distributionPartnerPercentage,
      useCustomSplit,
      
      // Update fields
      releaseId
    } = req.body;

    // Determine workflow routing based on user role and relationships
    let routingData = {
      has_label_admin: false,
      label_admin_id: null,
      company_admin_id: null,
      distribution_partner_id: null
    };

    // Set up hierarchical routing
    if (userProfile.label_admin_id) {
      routingData.has_label_admin = true;
      routingData.label_admin_id = userProfile.label_admin_id;
    } else if (userProfile.default_label_admin_id) {
      routingData.has_label_admin = true;
      routingData.label_admin_id = userProfile.default_label_admin_id;
    }

    if (userProfile.company_admin_id) {
      routingData.company_admin_id = userProfile.company_admin_id;
    }

    // Get distribution partner (could be configured at company level)
    // For now, we'll use a default distribution partner
    const { data: distributionPartner } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'distribution_partner')
      .limit(1)
      .single();

    if (distributionPartner) {
      routingData.distribution_partner_id = distributionPartner.id;
    }

    // Determine workflow step and artist edit permissions
    let currentWorkflowStep = workflowStep || 'artist_creation';
    let currentArtistCanEdit = true;

    if (status === 'submitted') {
      currentWorkflowStep = 'label_review';
      currentArtistCanEdit = false;
    } else if (status === 'in_review') {
      currentWorkflowStep = 'distribution_review';
      currentArtistCanEdit = false;
    } else if (status === 'completed' || status === 'live') {
      currentWorkflowStep = 'completed';
      currentArtistCanEdit = false;
    }

    // Prepare release data for database
    const releaseData = {
      // Basic Information
      project_name: projectName,
      artist_name: artistName,
      release_title: releaseTitle,
      release_type: releaseType,
      primary_genre: primaryGenre,
      secondary_genres: secondaryGenres || [],
      language: language || 'English',
      release_date: releaseDate,
      original_release_date: originalReleaseDate,
      
      // Catalog & Identification
      catalogue_no: catalogueNo,
      barcode: barcode,
      upc: upc,
      isrc: isrc,
      tunecode: tunecode,
      ice_work_key: iceWorkKey,
      iswc: iswc,
      bowi: bowi,
      
      // Publishing Information
      composer_author: composer,
      lyricist: lyricist,
      publisher: publisher,
      publisher_split: publisherSplit,
      publishing_type: publishingType,
      pro: pro,
      cae_ipi: caeIpi,
      
      // Audio Information
      duration: duration,
      bpm: bpm,
      song_key: songKey,
      explicit: explicit || false,
      
      // Production Credits
      producer: producer,
      coproducer: coproducer,
      executive_producer: executiveProducer,
      mixing_engineer: mixingEngineer,
      mastering_engineer: masteringEngineer,
      recording_engineer: recordingEngineer,
      assistant_producer: assistantProducer,
      additional_production: additionalProduction,
      engineer: engineer,
      editing: editing,
      
      // Studio Information
      recording_studio: recordingStudio,
      mastering_studio: masteringStudio,
      recording_location: recordingLocation,
      
      // Instrumentation
      keyboards: keyboards,
      programming: programming,
      bass: bass,
      drums: drums,
      guitars: guitars,
      organ: organ,
      percussion: percussion,
      strings: strings,
      additional_instrumentation: additionalInstrumentation,
      
      // Creative Information
      design_art_direction: designArtDirection,
      artwork_photographer: artworkPhotographer,
      artwork_designer: artworkDesigner,
      
      // Professional Contacts
      management: management,
      booking_agent: bookingAgent,
      press_contact: pressContact,
      label_contact: labelContact,
      
      // Online Presence
      website: website,
      social_media: socialMedia || {},
      
      // Distribution
      distribution_platforms: distributionPlatforms || [],
      excluded_territories: excludedTerritories || [],
      distribution_start_date: distributionStartDate,
      distribution_end_date: distributionEndDate,
      digital_release_date: digitalReleaseDate,
      physical_release_date: physicalReleaseDate,
      
      // Rights & Licensing
      master_owner: masterOwner,
      publishing_owner: publishingOwner,
      copyright_holder: copyrightHolder,
      copyright_year: copyrightYear || new Date().getFullYear(),
      recording_year: recordingYear || new Date().getFullYear(),
      publishing_year: publishingYear || new Date().getFullYear(),
      
      // Commercial Information
      suggested_retail_price: suggestedRetailPrice,
      wholesale_price: wholesalePrice,
      digital_price: digitalPrice,
      
      // Additional Metadata
      mood: mood,
      tempo: tempo,
      instruments: instruments || [],
      vocals: vocals,
      songwriters: songwriters || [],
      
      // Marketing & Promotion
      marketing_plan: marketingPlan,
      target_audience: targetAudience,
      campaign_budget: campaignBudget,
      promotional_assets: promotionalAssets || [],
      
      // Legal & Business
      split_sheets: splitSheets || [],
      contracts: contracts || [],
      clearances: clearances || [],
      
      // Release Notes
      release_notes: releaseNotes,
      internal_notes: internalNotes,
      special_instructions: specialInstructions,
      
      // Workflow fields
      status: status || 'draft',
      workflow_step: currentWorkflowStep,
      artist_can_edit: currentArtistCanEdit,
      
      // Revenue Split
      artist_percentage: artistPercentage || 70,
      label_percentage: labelPercentage || 20,
      company_percentage: companyPercentage || 10,
      distribution_partner_percentage: distributionPartnerPercentage || 10,
      use_custom_split: useCustomSplit || false,
      
      // Routing
      ...routingData,
      
      // Audit fields
      artist_id: user.id,
      last_auto_save: new Date().toISOString(),
      auto_save_enabled: true,
      updated_at: new Date().toISOString()
    };

    if (req.method === 'POST') {
      // Create new release
      releaseData.created_at = new Date().toISOString();
      
      const { data: newRelease, error: createError } = await supabase
        .from('releases')
        .insert(releaseData)
        .select()
        .single();

      if (createError) {
        console.error('Error creating release:', createError);
        return res.status(400).json({ error: createError.message });
      }

      return res.status(201).json({
        message: 'Release created successfully',
        release: newRelease
      });

    } else if (req.method === 'PUT') {
      // Update existing release
      if (!releaseId) {
        return res.status(400).json({ error: 'Release ID is required for updates' });
      }

      // Check if user has permission to edit this release
      const { data: existingRelease } = await supabase
        .from('releases')
        .select('artist_id, artist_can_edit, status')
        .eq('id', releaseId)
        .single();

      if (!existingRelease) {
        return res.status(404).json({ error: 'Release not found' });
      }

      // Permission check
      const canEdit = (
        existingRelease.artist_id === user.id && existingRelease.artist_can_edit
      ) || (
        userProfile.role === 'distribution_partner'
      ) || (
        userProfile.role === 'company_admin' || userProfile.role === 'super_admin'
      );

      if (!canEdit) {
        return res.status(403).json({ error: 'Not authorized to edit this release' });
      }

      const { data: updatedRelease, error: updateError } = await supabase
        .from('releases')
        .update(releaseData)
        .eq('id', releaseId)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating release:', updateError);
        return res.status(400).json({ error: updateError.message });
      }

      return res.status(200).json({
        message: 'Release updated successfully',
        release: updatedRelease
      });
    }

  } catch (error) {
    console.error('Error in release API:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}
