export const UserData = (): string => {
	const data: string =
		'Content-Type: multipart/mixed; boundary="//"\n' +
		'MIME-Version: 1.0\n' +
		'\n' +
		'--//\n' +
		'Content-Type: text/cloud-config; charset="us-ascii"\n' +
		'MIME-Version: 1.0\n' +
		'Content-Transfer-Encoding: 7bit\n' +
		'Content-Disposition: attachment; filename="cloud-config.txt"\n' +
		'\n' +
		'#cloud-config\n' +
		'cloud_final_modules:\n' +
		'- [scripts-user, always]\n' +
		'\n' +
		'--//\n' +
		'Content-Type: text/x-shellscript; charset="us-ascii"\n' +
		'MIME-Version: 1.0\n' +
		'Content-Transfer-Encoding: 7bit\n' +
		'Content-Disposition: attachment; filename="userdata.txt"\n' +
		'\n' +
		'#!/bin/bash\n' +
		'\n' +
		'echo "Installing Node"\n' +
		'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash\n' +
		'. ~/.nvm/nvm.sh\n' +
		'nvm install node\n' +
		'\n' +
		'mkdir /home/ec2-user/server/ \n' +
		'cd /home/ec2-user/server/\n' +
		'\n' +
		'# echo "Retrieving Deployment Zipped Folder From S3"\n' +
		'\n' +
		'fileUrl=`curl https://w0sizekdyd.execute-api.eu-west-1.amazonaws.com/dev/deployment/latest/location/ExpressTemplate` \n' +
		'fileUrl=`echo "$fileUrl" | tr -d \'"\'`\n' +
		'aws s3 cp $fileUrl .\n' +
		'\n' +
		'# echo "Received Zipped Folder"\n' +
		'\n' +
		'IFS=\'/\' read -r -a fileParts <<< "$fileUrl"\n' +
		'fileName="${fileParts[5]}"\n' +
		'\n' +
		'# echo "FileName: $fileName"\n' +
		'\n' +
		'unzip $fileName\n' +
		'cd dist/\n' +
		'node compiled.js\n' +
		'\n' +
		'--//';

	const buff: Buffer = new Buffer(data);
	return buff.toString('base64');
}
