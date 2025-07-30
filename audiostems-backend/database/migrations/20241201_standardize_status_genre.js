'use strict';

/**
 * Migration to standardize status and genre fields in projects table
 */

module.exports = {
  async up(knex) {
    // Update the projects table to use standardized enums
    await knex.schema.alterTable('projects', (table) => {
      // Drop the old status enum and create new one
      table.dropColumn('status');
      table.enum('status', [
        'draft',
        'submitted', 
        'under_review',
        'completed',
        'live'
      ]).defaultTo('draft').notNullable();
      
      // Drop the old release_type enum and create new one
      table.dropColumn('release_type');
      table.enum('release_type', [
        'Single',
        'EP', 
        'Album',
        'Mixtape'
      ]).notNullable();
      
      // Drop the old genre relation and create new enum
      table.dropColumn('genre_id');
      table.enum('genre', [
        'Acoustic',
        'Alternative',
        'Ambient',
        'Blues',
        'Classical',
        'Country',
        'Dance',
        'Electronic',
        'Experimental',
        'Folk',
        'Funk',
        'Gospel',
        'Hip Hop',
        'House',
        'Indie',
        'Jazz',
        'Latin',
        'Metal',
        'Pop',
        'Punk',
        'R&B',
        'Reggae',
        'Rock',
        'Soul',
        'Techno',
        'World'
      ]).notNullable();
    });
    
    // Update track_listings table to include BPM and Key fields
    await knex.schema.alterTable('components_project_track_listings', (table) => {
      table.integer('bpm').nullable();
      table.string('song_key').nullable();
      table.string('isrc').nullable();
    });
    
    console.log('✅ Migration completed: Standardized status and genre fields');
  },

  async down(knex) {
    // Revert the changes
    await knex.schema.alterTable('projects', (table) => {
      // Revert status enum
      table.dropColumn('status');
      table.enum('status', [
        'draft',
        'in_progress',
        'under_review', 
        'approved',
        'scheduled',
        'released',
        'cancelled'
      ]).defaultTo('draft').notNullable();
      
      // Revert release_type enum
      table.dropColumn('release_type');
      table.enum('release_type', [
        'single',
        'ep',
        'album',
        'mixtape',
        'compilation',
        'live_album',
        'remix_album',
        'soundtrack'
      ]).notNullable();
      
      // Revert genre to relation
      table.dropColumn('genre');
      table.integer('genre_id').unsigned().references('id').inTable('genres');
    });
    
    // Revert track_listings table
    await knex.schema.alterTable('components_project_track_listings', (table) => {
      table.dropColumn('bpm');
      table.dropColumn('song_key');
      table.dropColumn('isrc');
    });
    
    console.log('✅ Migration reverted: Restored original status and genre fields');
  }
}; 