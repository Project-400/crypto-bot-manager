import { ENV } from '../environment';
import { Deployment, DeploymentHealth, DeploymentState } from '../models/deployment';
import * as AWS from 'aws-sdk';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';
import CrudServiceDeployments from '../external-api/crud-service/services/deployments';
import { BotManager } from '../services/bot-manager';

export class InstanceRetrieval {

	public static Setup = async (): Promise<Ec2InstanceDeployment> => {
		const deployment: Ec2InstanceDeployment = await InstanceRetrieval.GetLatestDeploymentLog();

		if (ENV.TEST_MODE) {
			console.log('Test Mode - Setting Localhost instance build DNS');
			BotManager.SetLatestBuilds([
				new Deployment('localhost', 'fake-deployment-id123', DeploymentHealth.HEALTHY, DeploymentState.WORKING)
			]);
		}

		await InstanceRetrieval.GatherCurrentlyRunningInstances(deployment.deploymentId);

		return deployment;
	}

	public static GetLatestDeploymentLog = async (): Promise<Ec2InstanceDeployment> => {
		const deploymentLogResult: { success: boolean; latestDeploy: Ec2InstanceDeployment } =
			await CrudServiceDeployments.GetLatestDeploymentLog(ENV.APP_NAME);

		console.log(deploymentLogResult)

		if (!deploymentLogResult) throw Error('No deployment log retrieved from CRUD Service');

		return deploymentLogResult.latestDeploy;
	}

	private static GatherCurrentlyRunningInstances = async (deploymentId: string) => {
		AWS.config.update({ region: 'eu-west-1' });
		const ec2 = new AWS.EC2({ apiVersion: '2016-11-15' });

		const params = {
			Filters: [
				{
					Name: 'tag:AppName',
					Values: [ ENV.EC2_APP_NAME_TAG ]
				}
			]
		};

		await new Promise((resolve, reject) => {
			ec2.describeInstances(params, function (err, data) {
				const deployments: (AWS.EC2.Instance | undefined)[] | undefined = data.Reservations
					?.map((r: AWS.EC2.Reservation) => r.Instances?.filter((i: AWS.EC2.Instance) => i.State?.Name === 'running' || i.State?.Name === 'pending'))
					.flat();

				const latestBuildDeployments: (AWS.EC2.Instance)[] | undefined = deployments?.filter((i: AWS.EC2.Instance | undefined) => {
					if (!i) return false;
					const deploymentTag: AWS.EC2.Tag | undefined = i.Tags?.find((tag: AWS.EC2.Tag) => tag.Key === 'DeploymentId');
					return !!(deploymentTag && deploymentTag.Value === deploymentId);
				}) as AWS.EC2.Instance[];

				const previousBuildDeployments: (AWS.EC2.Instance)[] | undefined = deployments?.filter((i: AWS.EC2.Instance | undefined) => {
					if (!i) return false;
					const deploymentTag: AWS.EC2.Tag | undefined = i.Tags?.find((tag: AWS.EC2.Tag) => tag.Key === 'DeploymentId');
					return !!(deploymentTag && deploymentTag.Value !== deploymentId);
				}) as AWS.EC2.Instance[];

				console.log('latestBuildDeployments.length')
				console.log(latestBuildDeployments.length)

				if (latestBuildDeployments) {
					const latestBuildInstances: Deployment[] = latestBuildDeployments
						.filter((i: AWS.EC2.Instance | undefined): boolean => !!i)
						.map((i: AWS.EC2.Instance): Deployment | undefined => {
							if (i.PublicDnsName) return new Deployment(i.PublicDnsName, deploymentId);
						})
						.filter((d: Deployment | undefined): boolean => !!d) as Deployment[];

					BotManager.SetLatestBuilds(latestBuildInstances);
				}
				console.log('previousBuildDeployments.length')
				console.log(previousBuildDeployments.length)

				if (previousBuildDeployments) {
					const previousBuildInstances: Deployment[] = previousBuildDeployments
						.filter((i: AWS.EC2.Instance | undefined): boolean => !!i)
						.map((i: AWS.EC2.Instance): Deployment | undefined => {
							const depId: string = i?.Tags?.find((t: AWS.EC2.Tag) => t?.Key === 'DeploymentId')?.Value || 'Unknown';
							if (i.PublicDnsName) return new Deployment(i.PublicDnsName, depId);
						})
						.filter((d: Deployment | undefined): boolean => !!d) as Deployment[];

					BotManager.SetPreviousBuilds(previousBuildInstances);
				}

				if ((!latestBuildDeployments || !latestBuildDeployments.length) && (!previousBuildDeployments || !previousBuildDeployments.length)) {
					console.log('No existing bot instances on startup - Deploying first instance');
					BotManager.DeployBotInstance();
				}

				resolve();
			});
		});
	}

}
