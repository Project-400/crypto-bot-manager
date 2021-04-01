import { UserData } from './ec2-user-data';
import * as AWS from 'aws-sdk';
import {BotManager} from "../services/bot-manager";

export class DeployBotEc2 {

	public static LaunchEC2 = (deploymentId: string): Promise<any> => {
		AWS.config.update({ region: 'eu-west-1' });

		const userData: string = UserData();

		const instanceParams: AWS.EC2.RunInstancesRequest = {
			ImageId: 'ami-059fd785ca7cf349e',
			InstanceType: 't2.micro',
			MinCount: 1,
			MaxCount: 1,
			UserData: userData
		};

		const instancePromise: any = new AWS.EC2({ apiVersion: '2016-11-15' })
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
							},
							{
								Key: 'AppName',
								Value: `CryptoBot-Express-Application`
							},
							{
								Key: 'DeploymentId',
								Value: deploymentId
							}
						]
					};

					const tagPromise = new AWS.EC2({apiVersion: '2016-11-15'})
						.createTags(tagParams)
						.promise();

					tagPromise
						.then(
							async (tagData) => {
								console.log('Instance tagged');
								DeployBotEc2.GetDeploymentURL(instanceId, deploymentId);
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

	private static GetDeploymentURL = async (instanceId: string, deploymentId: string) => {
		AWS.config.update({region: 'eu-west-1'});
		const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

		const params = {
			InstanceIds: [
				instanceId
			]
		};

		const interval = setInterval(async () => {
			const publicDns: string = await new Promise((resolve, reject) => {
				ec2.describeInstances(params, function (err, data) {
					if (err) {
						console.log(err);
					}

					console.log(data);
					console.log(data.Reservations?.length && data.Reservations[0].Instances);

					const reservations: AWS.EC2.ReservationList | undefined = data.Reservations;

					if (!reservations || !reservations.length) return resolve(undefined);

					const instances: AWS.EC2.InstanceList | undefined = reservations[0].Instances;

					if (!instances || !instances.length) return resolve(undefined);

					const instance: AWS.EC2.Instance = instances[0];
					const publicDns: string | undefined = instance.PublicDnsName;

					if (!publicDns) return resolve(undefined);

					resolve(publicDns);
				});
			});

			if (publicDns) {
				clearInterval(interval);
				BotManager.RegisterNewBuild(deploymentId, publicDns);
			}
		}, 5000);
	}


}
