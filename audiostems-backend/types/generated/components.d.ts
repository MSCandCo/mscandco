import type { Schema, Attribute } from '@strapi/strapi';

export interface ArtistManagerInfo extends Schema.Component {
  collectionName: 'components_artist_manager_info';
  info: {
    displayName: 'Manager Info';
    description: 'Manager contact information for artists';
  };
  attributes: {
    name: Attribute.String & Attribute.Required;
    email: Attribute.Email & Attribute.Required;
    phoneNumber: Attribute.String;
    company: Attribute.String;
    website: Attribute.String;
  };
}

export interface LyricVerse extends Schema.Component {
  collectionName: 'components_lyric_verses';
  info: {
    displayName: 'verse';
  };
  attributes: {
    type: Attribute.Enumeration<['Verse', 'Chorus', 'Bridge', 'Outro']> &
      Attribute.Required &
      Attribute.DefaultTo<'Verse'>;
    content: Attribute.Text & Attribute.Required;
  };
}

export interface StemsTrack extends Schema.Component {
  collectionName: 'components_stems_tracks';
  info: {
    displayName: 'Track';
    description: '';
  };
  attributes: {
    name: Attribute.String;
    source: Attribute.Media & Attribute.Required;
    sourcePeaks: Attribute.JSON;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'artist.manager-info': ArtistManagerInfo;
      'lyric.verse': LyricVerse;
      'stems.track': StemsTrack;
    }
  }
}
