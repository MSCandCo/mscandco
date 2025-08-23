import { supabase } from '@/lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
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

    const {
      // Personal Information (Immutable after registration)
      firstName,
      lastName,
      phone,
      dateOfBirth,
      nationality,
      location,
      city,
      postalCode,
      
      // Business Information
      companyName,
      businessType,
      position,
      department,
      officeAddress,
      taxId,
      vatNumber,
      registrationNumber,
      foundedYear,
      timezone,
      
      // Label Information
      labelName,
      
      // Banking Information
      revolutAccountId,
      bankAccountName,
      bankAccountNumber,
      bankRoutingNumber,
      bankName,
      bankSwiftCode,
      bankIban,
      
      // Artist Information
      artistName,
      artistType,
      stageName,
      bio,
      socialMedia,
      musicPlatforms,
      primaryGenre,
      secondaryGenres,
      instruments,
      vocalType,
      yearsActive,
      recordLabel,
      publisher,
      
      // Social Media & Platforms
      website,
      instagram,
      facebook,
      twitter,
      youtube,
      tiktok,
      threads,
      appleMusic,
      spotify,
      soundcloud,
      bandcamp,
      deezer,
      amazonMusic,
      youtubeMusic,
      tidal,
      
      // Professional Information
      pressCoverage,
      awards,
      recognition,
      managerName,
      managerEmail,
      managerPhone,
      bookingAgent,
      publicist,
      
      // Profile Status
      immutableDataLocked,
      isBasicInfoSet,
      registrationDate,
      
      // Wallet & Subscription
      walletBalance,
      negativeBallowanceAllowed,
      walletCreditLimit,
      preferredPaymentMethod,
      autoPayFromWallet,
      
      // Revenue Split Configuration
      artistRevenuePercentage,
      labelRevenuePercentage,
      companyRevenuePercentage,
      customSplitEnabled
    } = req.body;

    // Check if immutable data is locked
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('immutable_data_locked')
      .eq('id', user.id)
      .single();

    // Prepare profile update data
    const profileUpdateData = {
      phone: phone,
      bio: bio,
      social_media: socialMedia,
      music_platforms: musicPlatforms,
      primary_genre: primaryGenre,
      secondary_genres: secondaryGenres,
      website: website,
      
      // Business Information
      company_name: companyName,
      business_type: businessType,
      position: position,
      department: department,
      office_address: officeAddress,
      tax_id: taxId,
      vat_number: vatNumber,
      registration_number: registrationNumber,
      founded_year: foundedYear,
      timezone: timezone,
      
      // Label Information
      label_name: labelName,
      
      // Banking Information
      revolut_account_id: revolutAccountId,
      bank_account_name: bankAccountName,
      bank_account_number: bankAccountNumber,
      bank_routing_number: bankRoutingNumber,
      bank_name: bankName,
      bank_swift_code: bankSwiftCode,
      bank_iban: bankIban,
      
      // Professional Network
      manager_name: managerName,
      manager_email: managerEmail,
      manager_phone: managerPhone,
      booking_agent: bookingAgent,
      publicist: publicist,
      
      // Wallet & Subscription
      wallet_balance: walletBalance,
      negative_balance_allowed: negativeBallowanceAllowed,
      wallet_credit_limit: walletCreditLimit,
      preferred_payment_method: preferredPaymentMethod,
      auto_pay_from_wallet: autoPayFromWallet,
      
      updated_at: new Date().toISOString()
    };

    // Add immutable fields only if not locked or this is the first time setting them
    if (!currentProfile?.immutable_data_locked || isBasicInfoSet) {
      profileUpdateData.first_name = firstName;
      profileUpdateData.last_name = lastName;
      profileUpdateData.date_of_birth = dateOfBirth;
      profileUpdateData.nationality = nationality;
      profileUpdateData.city = city;
      profileUpdateData.address = location;
      profileUpdateData.postal_code = postalCode;
      profileUpdateData.display_name = artistName || stageName;
      
      // Lock immutable data if this is the completion of basic info
      if (isBasicInfoSet && !currentProfile?.immutable_data_locked) {
        profileUpdateData.immutable_data_locked = true;
      }
    } else {
      // Update display name even if locked
      profileUpdateData.display_name = artistName || stageName;
    }

    // Update user profile
    const { data: updatedProfile, error: profileError } = await supabase
      .from('user_profiles')
      .update(profileUpdateData)
      .eq('id', user.id)
      .select()
      .single();

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    // Update or create artist profile
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingArtist) {
      // Update existing artist
      await supabase
        .from('artists')
        .update({
                  stage_name: artistName || stageName,
        real_name: `${firstName} ${lastName}`.trim(),
        bio: bio,
        genre: primaryGenre,
        artist_type: artistType,
        vocal_type: vocalType,
        years_active: yearsActive,
        record_label: recordLabel,
        publisher: publisher,
        instruments: instruments,
        secondary_genres: secondaryGenres,
        social_links: socialMedia,
        music_platforms: musicPlatforms,
        website: website,
        instagram: instagram,
        facebook: facebook,
        twitter: twitter,
        youtube: youtube,
        tiktok: tiktok,
        threads: threads,
        apple_music: appleMusic,
        spotify: spotify,
        soundcloud: soundcloud,
        bandcamp: bandcamp,
        deezer: deezer,
        amazon_music: amazonMusic,
        youtube_music: youtubeMusic,
        tidal: tidal,
        press_coverage: pressCoverage,
        awards: awards,
        recognition: recognition,
        manager_name: managerName,
        manager_email: managerEmail,
        manager_phone: managerPhone,
        booking_agent: bookingAgent,
        publicist: publicist,
        
        // Revenue Split Configuration
        artist_revenue_percentage: artistRevenuePercentage || 70.00,
        label_revenue_percentage: labelRevenuePercentage || 20.00,
        company_revenue_percentage: companyRevenuePercentage || 10.00,
        custom_split_enabled: customSplitEnabled || false,
        
        updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    } else {
      // Create new artist profile
      await supabase
        .from('artists')
        .insert({
          user_id: user.id,
          stage_name: artistName || stageName,
          real_name: `${firstName} ${lastName}`.trim(),
          bio: bio,
          genre: primaryGenre,
          artist_type: artistType,
          vocal_type: vocalType,
          years_active: yearsActive,
          record_label: recordLabel,
          publisher: publisher,
          instruments: instruments,
          secondary_genres: secondaryGenres,
          social_links: socialMedia,
          music_platforms: musicPlatforms,
          website: website,
          instagram: instagram,
          facebook: facebook,
          twitter: twitter,
          youtube: youtube,
          tiktok: tiktok,
          threads: threads,
          apple_music: appleMusic,
          spotify: spotify,
          soundcloud: soundcloud,
          bandcamp: bandcamp,
          deezer: deezer,
          amazon_music: amazonMusic,
          youtube_music: youtubeMusic,
          tidal: tidal,
          press_coverage: pressCoverage,
          awards: awards,
          recognition: recognition,
          manager_name: managerName,
          manager_email: managerEmail,
          manager_phone: managerPhone,
          booking_agent: bookingAgent,
          publicist: publicist
        });
    }

    res.status(200).json({ 
      success: true, 
      profile: updatedProfile,
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('Error updating artist profile:', error);
    res.status(500).json({ 
      message: 'Error updating artist profile',
      error: error.message 
    });
  }
}