/**
 * Global Variable Configuration
 * (sails.config.globals)
 *
 * Configure which global variables which will be exposed
 * automatically by Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.globals.html
 */
module.exports.globals = {

  keymaster: {
    defaultLife: process.env.DEFAULT_KEY_LIFE_SECONDS || 3600,
    slashToken: process.env.SLASH_TOKEN,
    auditWebhook: process.env.AUDIT_WEBHOOK,
    auditChannel: process.env.AUDIT_CHANNEL,
    auditBucket: process.env.AUDIT_S3_BUCKET,
    auditBotName: process.env.AUDIT_BOT_NAME || 'Keymaster'
  }
};
