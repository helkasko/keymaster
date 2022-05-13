var fs = require('fs');
var Promise = require('promise');
var AWS = require('aws-sdk');

module.exports = {
  sendAuditFileToS3: function (bucketName, credentials, userName, role) {
    var fileName = userName + "-" + Date.now() + ".log"
    var filePath = role + "/" + fileName

    var s3 = new AWS.S3({params: {Bucket: bucketName, Key: filePath}});
    var content = [
      userName + ' has generated temporary AWS credentials',
      'Role: ' + role,
      'Access Key: ' + credentials.AccessKeyId,
      'Expires: ' + credentials.Expiration
    ].join('\n');
    fs.writeFile(fileName, content, err => {
      if (err) {
        console.error(err)
        return
      }
      //file written successfully
    })
    var body = fs.createReadStream(fileName);

    return new Promise(function (resolve, reject) {

      s3.upload({Key: filePath, Body: body}, function(err, data) {
        if(err) {
          console.log("failed to upload: ", err);
          reject(err);
        } else {
          console.log(data);
          fs.unlink(filePath);
          resolve(data);
        }
      });

    });
  }
}
