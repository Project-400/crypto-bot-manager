import { Request, Response } from 'express';
import { UserData } from './ec2-user-data';
import * as AWS from 'aws-sdk';

export class DeployBotEc2 {

	private static LaunchEC2 = (): any => {
		AWS.config.update({ region: 'eu-west-1' });

		const userData: string = UserData();

		const instanceParams: AWS.EC2.RunInstancesRequest = {
			ImageId: 'ami-059fd785ca7cf349e',
			InstanceType: 't2.micro',
			MinCount: 1,
			MaxCount: 1,
			UserData: userData
		};

		const instancePromise: any = new AWS.EC2({apiVersion: '2016-11-15'})
			.runInstances(instanceParams)
			.promise();

		return new Promise((resolve, reject) => {
			instancePromise.then(
				(instanceData: any) => {
					console.log(instanceData);
					const instanceId = instanceData.Instances[0].InstanceId;
					console.log('Created instance', instanceId);

					const tagParams = {
						Resources: [instanceId],
						Tags: [
							{
								Key: 'Name',
								Value: `CryptoBot-${new Date().toISOString()}`
							}
						]
					};

					const tagPromise = new AWS.EC2({apiVersion: '2016-11-15'})
						.createTags(tagParams)
						.promise();

					tagPromise
						.then(
							(tagData) => {
								console.log('Instance tagged');
								resolve({ instanceData, tagData })
							}
						).catch(
							(err) => {
								console.error(err, err.stack);
							}
						);
				}).catch(
					(err: Error) => {
						console.error(err, err.stack);
					}
				);
		})

	}

}
