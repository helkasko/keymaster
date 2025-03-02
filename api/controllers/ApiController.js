/**
 * ApiController
 *
 * @description :: API controller for responding to Slash commands
 */

var help = [
  'Keymaster - Temporary AWS credential Slack bot',
  '    list - List available roles',
  '    generate [role name] [credential lifetime in seconds] - Generate temporary credentails (e.g. generate s3-read-only 3600)',
  '    help - This help text'
].join('\n');

module.exports = {
  slash: function(req, res) {
    if (!sails.config.globals.keymaster.slashToken || sails.config.globals.keymaster.slashToken !== req.body.token) {
      return res.json({
        text: 'Unauthorized'
      });
    }
    var text = req.body.text.split(' ');
    var command = text.shift();
    if (command === 'list') {
      return res.json({
        text: 'Available Roles:\n' + RoleService.listRoleNames().map(function(role) {
          return '- ' + role;
        }).join('\n')
      });
    } else if (command === 'generate') {
      var roleName = text.shift();
      var roleArn = RoleService.getRoleArn(roleName);
      if (!roleArn) {
        throw 'The role "' + roleName + '" does not exist';
      }
      var duration = parseInt(text.shift()) || sails.config.globals.keymaster.defaultLife;
      return RoleService.assumeRole(roleArn, req.body.user_id, duration).then(function(credentials) {
        if (sails.config.globals.keymaster.auditBucket) {
          S3Service.sendAuditFileToS3(sails.config.globals.keymaster.auditBucket, credentials, req.body.user_name, roleName);
        }
        return SlackService.sendAuditMessage(credentials, req.body.user_name, roleName);
      }).then(function(credentials) {
        var response = [
          'Your temporary credentials are below, they will expire on ' + credentials.Expiration + ':',
          '```',
          'export AWS_DEFAULT_REGION=eu-north-1',
          'export AWS_ACCESS_KEY_ID="' + credentials.AccessKeyId + '"',
          'export AWS_SECRET_ACCESS_KEY="' + credentials.SecretAccessKey + '"',
          'export AWS_SESSION_TOKEN="' + credentials.SessionToken + '"',
          '```'
        ].join('\n');
        return res.json({
          text: response
        });
      }).catch(function(err) {
        return res.json({
          text: 'Error: ' + err
        });
      });
    } else {
      return res.json({
        text: help
      });
    }
  }
};
