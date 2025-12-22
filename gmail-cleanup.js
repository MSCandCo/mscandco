#!/usr/bin/env node

/**
 * Gmail Cleanup Script
 * Helps clean up Gmail account by deleting old emails, organizing by labels, etc.
 * 
 * Prerequisites:
 *   1. Generate an App-Specific Password at: https://myaccount.google.com/apppasswords
 *   2. Install dependencies: npm install imap
 *   3. Update GMAIL_APP_PASSWORD below with your app-specific password
 * 
 * Usage:
 *   node gmail-cleanup.js [options]
 * 
 * Options:
 *   --dry-run          Preview changes without making them
 *   --older-than-days=X  Delete emails older than X days (default: 90)
 *   --delete-spam      Delete all spam emails
 *   --delete-trash     Delete all trash emails
 *   --stats            Show email statistics only
 *   --inbox-only       Only process inbox (default: all folders)
 */

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const util = require('util');

// Configuration
// You can set these via environment variables or update below
const GMAIL_USERNAME = process.env.GMAIL_USERNAME || 'info@yhwhmsc.com';
// IMPORTANT: Gmail requires an App-Specific Password for IMAP access
// Generate one at: https://myaccount.google.com/apppasswords
// Your regular password will NOT work!
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || 'kefxxujgcfipdoql';

class GmailCleanup {
  constructor(username, password) {
    this.username = username;
    this.password = password;
    this.imap = null;
    this.stats = {
      total: 0,
      deleted: 0,
      spam: 0,
      trash: 0,
      old: 0
    };
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.imap = new Imap({
        user: this.username,
        password: this.password,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
        connTimeout: 10000,
        authTimeout: 5000
      });

      this.imap.once('ready', () => {
        console.log('✅ Connected to Gmail\n');
        resolve();
      });

      this.imap.once('error', (err) => {
        console.error('❌ IMAP Error:', err.message);
        if (err.message.includes('Invalid credentials') || err.message.includes('authentication failed')) {
          console.error('\n⚠️  Authentication failed!');
          console.error('   Gmail requires an App-Specific Password for IMAP access.');
          console.error('   Please generate one at: https://myaccount.google.com/apppasswords');
          console.error('   Then update GMAIL_APP_PASSWORD in this script.\n');
        }
        reject(err);
      });

      this.imap.once('end', () => {
        console.log('\n📧 Connection closed');
      });

      this.imap.connect();
    });
  }

  openBox(boxName, readOnly = true) {
    return new Promise((resolve, reject) => {
      this.imap.openBox(boxName, readOnly, (err, box) => {
        if (err) reject(err);
        else resolve(box);
      });
    });
  }

  search(criteria) {
    return new Promise((resolve, reject) => {
      this.imap.search(criteria, (err, results) => {
        if (err) reject(err);
        else resolve(results || []);
      });
    });
  }

  fetch(uids, options) {
    return new Promise((resolve, reject) => {
      const fetch = this.imap.fetch(uids, options);
      const messages = [];
      
      fetch.on('message', (msg, seqno) => {
        const message = { seqno };
        msg.on('body', (stream, info) => {
          let buffer = '';
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });
          stream.once('end', () => {
            message.body = buffer;
          });
        });
        msg.once('attributes', (attrs) => {
          message.attrs = attrs;
        });
        msg.once('end', () => {
          messages.push(message);
        });
      });
      
      fetch.once('error', reject);
      fetch.once('end', () => resolve(messages));
    });
  }

  async getStats() {
    console.log('📊 Gathering Email Statistics...\n');
    
    const boxes = await this.getBoxes();
    const stats = {};

    for (const [boxName, box] of Object.entries(boxes)) {
      if (box.attribs.includes('\\Noselect')) continue;
      
      try {
        const boxInfo = await this.openBox(boxName);
        stats[boxName] = {
          total: boxInfo.messages.total,
          unread: boxInfo.messages.total - boxInfo.messages.total
        };
        console.log(`📁 ${boxName}: ${boxInfo.messages.total} messages`);
      } catch (err) {
        console.log(`⚠️  Could not access ${boxName}: ${err.message}`);
      }
    }

    return stats;
  }

  getBoxes() {
    return new Promise((resolve, reject) => {
      this.imap.getBoxes((err, boxes) => {
        if (err) reject(err);
        else resolve(boxes);
      });
    });
  }

  async deleteEmails(uids, dryRun = false) {
    if (uids.length === 0) return 0;

    return new Promise((resolve, reject) => {
      if (dryRun) {
        console.log(`   [DRY RUN] Would delete ${uids.length} emails`);
        resolve(uids.length);
        return;
      }

      this.imap.setFlags(uids, ['\\Deleted'], (err) => {
        if (err) {
          reject(err);
          return;
        }

        this.imap.expunge((expungeErr) => {
          if (expungeErr) {
            reject(expungeErr);
          } else {
            resolve(uids.length);
          }
        });
      });
    });
  }

  async deleteOldEmails(days = 90, dryRun = false) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Format date as DD-MMM-YYYY for IMAP (e.g., "21-Sep-2024")
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(cutoffDate.getDate()).padStart(2, '0');
    const month = months[cutoffDate.getMonth()];
    const year = cutoffDate.getFullYear();
    const imapDate = `${day}-${month}-${year}`;

    console.log(`🗑️  ${dryRun ? '[DRY RUN] ' : ''}Deleting emails older than ${days} days (before ${cutoffDate.toLocaleDateString()})`);

    try {
      const boxes = await this.getBoxes();
      let totalDeleted = 0;

      for (const [boxName, box] of Object.entries(boxes)) {
        if (box.attribs.includes('\\Noselect')) continue;
        if (boxName === '[Gmail]/Trash' || boxName === '[Gmail]/Spam') continue;

        try {
          // Open in read-write mode for deletion
          await this.openBox(boxName, false);
          
          // Workaround: Search for ALL emails, then filter by fetching headers
          // This is more reliable than date-based search
          const allUids = await this.search(['ALL']);
          
          if (allUids.length === 0) {
            console.log(`   No emails found in ${boxName}`);
            continue;
          }

          // Fetch date headers for all emails (batch process)
          const fetch = this.imap.fetch(allUids, { bodies: '', struct: true });
          const oldUids = [];
          
          await new Promise((resolve, reject) => {
            fetch.on('message', (msg) => {
              msg.on('attributes', (attrs) => {
                const uid = attrs.uid;
                const date = attrs.date;
                if (date && date < cutoffDate) {
                  oldUids.push(uid);
                }
              });
            });
            fetch.once('error', reject);
            fetch.once('end', resolve);
          });
          
          if (oldUids.length > 0) {
            console.log(`   Found ${oldUids.length} old emails in ${boxName} (out of ${allUids.length} total)`);
            const deleted = await this.deleteEmails(oldUids, dryRun);
            totalDeleted += deleted;
            if (!dryRun) {
              console.log(`   ✅ Deleted ${deleted} emails from ${boxName}`);
            }
          } else {
            console.log(`   No old emails found in ${boxName} (checked ${allUids.length} emails)`);
          }
        } catch (err) {
          console.log(`   ⚠️  Error processing ${boxName}: ${err.message}`);
        }
      }

      console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Total deleted: ${totalDeleted} emails\n`);
      return totalDeleted;
    } catch (err) {
      console.error(`❌ Error deleting old emails: ${err.message}`);
      throw err;
    }
  }

  async deleteSpam(dryRun = false) {
    console.log(`🗑️  ${dryRun ? '[DRY RUN] ' : ''}Deleting all spam emails`);

    try {
      // Spam folder needs to be opened in read-write mode
      await this.openBox('[Gmail]/Spam', false);
      const uids = await this.search(['ALL']);
      
      if (uids.length > 0) {
        console.log(`   Found ${uids.length} spam emails`);
        const deleted = await this.deleteEmails(uids, dryRun);
        console.log(`   ${dryRun ? '[DRY RUN] Would delete' : '✅ Deleted'} ${deleted} spam emails\n`);
        return deleted;
      } else {
        console.log('   No spam emails found\n');
        return 0;
      }
    } catch (err) {
      console.error(`❌ Error deleting spam: ${err.message}\n`);
      throw err;
    }
  }

  async deleteTrash(dryRun = false) {
    console.log(`🗑️  ${dryRun ? '[DRY RUN] ' : ''}Deleting all trash emails`);

    try {
      // Trash folder needs to be opened in read-write mode
      await this.openBox('[Gmail]/Trash', false);
      const uids = await this.search(['ALL']);
      
      if (uids.length > 0) {
        console.log(`   Found ${uids.length} trash emails`);
        const deleted = await this.deleteEmails(uids, dryRun);
        console.log(`   ${dryRun ? '[DRY RUN] Would delete' : '✅ Deleted'} ${deleted} trash emails\n`);
        return deleted;
      } else {
        console.log('   No trash emails found\n');
        return 0;
      }
    } catch (err) {
      console.error(`❌ Error deleting trash: ${err.message}\n`);
      throw err;
    }
  }

  close() {
    return new Promise((resolve) => {
      if (this.imap) {
        this.imap.end();
      }
      resolve();
    });
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const statsOnly = args.includes('--stats');
  const olderThanArg = args.find(arg => arg.startsWith('--older-than-days='));
  const olderThanDays = olderThanArg ? parseInt(olderThanArg.split('=')[1]) : 90;
  const deleteSpam = args.includes('--delete-spam');
  const deleteTrash = args.includes('--delete-trash');

  console.log('📧 Gmail Cleanup Tool');
  console.log('====================\n');

  // Check if imap module is installed
  try {
    require('imap');
  } catch (err) {
    console.error('❌ Error: "imap" module not found!');
    console.error('   Please install it: npm install imap mailparser\n');
    process.exit(1);
  }

  const cleanup = new GmailCleanup(GMAIL_USERNAME, GMAIL_APP_PASSWORD);

  try {
    await cleanup.connect();

    if (statsOnly) {
      await cleanup.getStats();
      await cleanup.close();
      return;
    }

    let totalDeleted = 0;

    if (deleteSpam) {
      totalDeleted += await cleanup.deleteSpam(dryRun);
    }

    if (deleteTrash) {
      totalDeleted += await cleanup.deleteTrash(dryRun);
    }

    if (olderThanArg || (!deleteSpam && !deleteTrash)) {
      totalDeleted += await cleanup.deleteOldEmails(olderThanDays, dryRun);
    }

    if (!dryRun && totalDeleted > 0) {
      console.log(`\n✅ Cleanup completed! Deleted ${totalDeleted} emails total.`);
    } else if (dryRun) {
      console.log(`\n✅ [DRY RUN] Preview complete. Would delete ${totalDeleted} emails total.`);
      console.log('   Run without --dry-run to actually delete emails.');
    } else {
      console.log('\n✅ Cleanup completed! No emails to delete.');
    }

    await cleanup.close();

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await cleanup.close();
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GmailCleanup;
