import type { Schema, Attribute } from '@strapi/strapi';

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
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'lyric.verse': LyricVerse;
      'stems.track': StemsTrack;
    }
  }
}
