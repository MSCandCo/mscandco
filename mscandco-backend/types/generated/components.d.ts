import type { Attribute, Schema } from '@strapi/strapi';

export interface ArtistManagerInfo extends Schema.Component {
  collectionName: 'components_artist_manager_info';
  info: {
    description: 'Manager contact information for artists';
    displayName: 'Manager Info';
  };
  attributes: {
    company: Attribute.String;
    email: Attribute.Email & Attribute.Required;
    name: Attribute.String & Attribute.Required;
    phoneNumber: Attribute.String;
    website: Attribute.String;
  };
}

export interface LyricVerse extends Schema.Component {
  collectionName: 'components_lyric_verses';
  info: {
    displayName: 'verse';
  };
  attributes: {
    content: Attribute.Text & Attribute.Required;
    type: Attribute.Enumeration<['Verse', 'Chorus', 'Bridge', 'Outro']> &
      Attribute.Required &
      Attribute.DefaultTo<'Verse'>;
  };
}

export interface ProjectTrackListing extends Schema.Component {
  collectionName: 'components_project_track_listings';
  info: {
    description: 'Individual track information for project track listing';
    displayName: 'Track Listing';
  };
  attributes: {
    creation: Attribute.Relation<
      'project.track-listing',
      'oneToOne',
      'api::creation.creation'
    >;
    duration: Attribute.Integer;
    featuring: Attribute.String;
    isAcoustic: Attribute.Boolean & Attribute.DefaultTo<false>;
    isBonus: Attribute.Boolean & Attribute.DefaultTo<false>;
    isExplicit: Attribute.Boolean & Attribute.DefaultTo<false>;
    isInstrumental: Attribute.Boolean & Attribute.DefaultTo<false>;
    isLive: Attribute.Boolean & Attribute.DefaultTo<false>;
    isRemix: Attribute.Boolean & Attribute.DefaultTo<false>;
    masteringEngineer: Attribute.String;
    mixer: Attribute.String;
    notes: Attribute.Text;
    producer: Attribute.String;
    title: Attribute.String & Attribute.Required;
    trackNumber: Attribute.Integer &
      Attribute.Required &
      Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      >;
  };
}

export interface SharedBankDetails extends Schema.Component {
  collectionName: 'components_shared_bank_details';
  info: {
    description: 'Bank account information for payments';
    displayName: 'Bank Details';
  };
  attributes: {
    accountHolderName: Attribute.String & Attribute.Required;
    accountNumber: Attribute.String & Attribute.Required & Attribute.Private;
    accountType: Attribute.Enumeration<['checking', 'savings', 'business']> &
      Attribute.DefaultTo<'checking'>;
    bankName: Attribute.String & Attribute.Required;
    currency: Attribute.Enumeration<['GBP', 'USD', 'EUR', 'CAD', 'AUD']> &
      Attribute.DefaultTo<'GBP'>;
    iban: Attribute.String & Attribute.Private;
    routingNumber: Attribute.String & Attribute.Private;
    sortCode: Attribute.String & Attribute.Required & Attribute.Private;
    swiftCode: Attribute.String & Attribute.Private;
    verificationDate: Attribute.DateTime;
    verified: Attribute.Boolean & Attribute.DefaultTo<false>;
  };
}

export interface SharedEarnings extends Schema.Component {
  collectionName: 'components_shared_earnings';
  info: {
    description: 'Artist earnings and revenue tracking';
    displayName: 'Earnings';
  };
  attributes: {
    currency: Attribute.Enumeration<['GBP', 'USD', 'EUR', 'CAD', 'AUD']> &
      Attribute.DefaultTo<'GBP'>;
    lastPayout: Attribute.DateTime;
    monthlyGrowth: Attribute.Decimal;
    nextPayout: Attribute.DateTime;
    payoutThreshold: Attribute.Decimal & Attribute.DefaultTo<50>;
    pendingAmount: Attribute.Decimal & Attribute.DefaultTo<0>;
    platformEarnings: Attribute.JSON;
    streamingStats: Attribute.JSON;
    topPerformingTracks: Attribute.JSON;
    totalEarnings: Attribute.Decimal & Attribute.DefaultTo<0>;
  };
}

export interface StemsTrack extends Schema.Component {
  collectionName: 'components_stems_tracks';
  info: {
    description: '';
    displayName: 'Track';
  };
  attributes: {
    name: Attribute.String;
    source: Attribute.Media<'audios'> & Attribute.Required;
    sourcePeaks: Attribute.JSON;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'artist.manager-info': ArtistManagerInfo;
      'lyric.verse': LyricVerse;
      'project.track-listing': ProjectTrackListing;
      'shared.bank-details': SharedBankDetails;
      'shared.earnings': SharedEarnings;
      'stems.track': StemsTrack;
    }
  }
}
