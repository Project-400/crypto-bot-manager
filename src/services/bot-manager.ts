import {Deployment} from "../models/deployment";
import {BOT_PER_INSTANCE_LIMIT, ENV} from "../environment";
import * as AWS from 'aws-sdk';

interface DeployedInstances {
	latestBuild: Deployment[];
	previousBuilds: Deployment[];
}

export class BotManager {

	private static currentDeploymentId: string; 					// Random string generated by AWS for deployment folder is S3
	private static deployInstances: DeployedInstances = {		// Crypto bot instance public DNS strings
		latestBuild: [],											// List of public DNS for current / latest build
		previousBuilds: []											// DNS for old builds get moved here from latestBuild array if new build is deployed
	};

	public static RegisterNewBuild = (deploymentId: string, newInstanceDNS: string): void => {
		BotManager.currentDeploymentId = deploymentId;
		BotManager.deployInstances.previousBuilds = [
			...BotManager.deployInstances.previousBuilds,
			...BotManager.deployInstances.latestBuild
		];
		BotManager.deployInstances.latestBuild = [ new Deployment(newInstanceDNS, deploymentId) ];
	}

	public static CreateTradeBot = (botId: string): void => {
		const deployment: Deployment = BotManager.GetDeploymentWithMostBots();
		if (deployment) deployment.AddNewBot(botId);
		else console.error('NO DEPLOYMENTS LEFT')
	}

	private static GetDeploymentWithMostBots = (): Deployment => { // Return the deployment with most bots less than limit
		return BotManager.deployInstances.latestBuild.sort((a: Deployment, b: Deployment) => {
			if (a.botCount < b.botCount) return 1;
			if (a.botCount > b.botCount) return -1;
			return 0;
		}).filter((d: Deployment) => d.botCount < ENV.BOT_PER_INSTANCE_LIMIT)[0];
	}

	public static GatherCurrentlyRunningInstances = () => {
		AWS.config.update({region: 'eu-west-1'});
		const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

		const params = {
			Filters: [
				{
					Name: 'tag:AppName',
					Values: [ ENV.EC2_APP_NAME ]
				}
			]
		};

		ec2.describeInstances(params, function (err, data) {
			const dnsNames: (string | undefined)[] | undefined = data.Reservations
				?.map((r: AWS.EC2.Reservation) => r.Instances)
				.flat()
				.map((i: AWS.EC2.Instance | undefined) => i && i.PublicDnsName);

			console.log(dnsNames);
		});
	}

}
