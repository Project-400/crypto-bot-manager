import { Deployment } from '../models/deployment';
import { ENV } from '../environment';
import {Health} from "../external-api/bots/health";
import {Ec2InstanceDeployment} from "@crypto-tracker/common-types";
import {DeployBotEc2} from "../bot-deployments/deploy-bot-ec2";
import {InstanceRetrieval} from "../startup/instance-retrieval";
import {Bot} from "../external-api/bots/bot";

interface DeployedInstances {
	latestBuild: Deployment[];
	previousBuilds: Deployment[];
}

export class BotManager {

	private static currentDeploymentLog: Ec2InstanceDeployment;
	private static currentDeploymentId: string; 				// Random string generated by AWS for deployment folder is S3
	private static deployInstances: DeployedInstances = {		// Crypto bot instance public DNS strings
		latestBuild: [],											// List of public DNS for current / latest build
		previousBuilds: []											// DNS for old builds get moved here from latestBuild array if new build is deployed
	};
	private static healthInterval: NodeJS.Timeout;
	private static botDirectory: { [botId: string]: string } = { }; // BotIds with EC2 DNS associated with it

	public static SetCurrentDeploymentLog = (deployment: Ec2InstanceDeployment): void => {
		BotManager.currentDeploymentId = deployment.deploymentId;
		BotManager.currentDeploymentLog = deployment;
	}
	public static SetLatestBuilds = (builds: Deployment[]): void => {
		if (BotManager.deployInstances.latestBuild.length) return;
		BotManager.deployInstances.latestBuild = builds;
	}
	public static SetPreviousBuilds = (builds: Deployment[]): void => {
		if (BotManager.deployInstances.previousBuilds.length) return;
		BotManager.deployInstances.previousBuilds = builds;
	}
	public static GetAllBuilds = (): DeployedInstances => BotManager.deployInstances;

	public static RegisterNewBuild = (deploymentId: string, newInstanceDNS: string): void => {
		BotManager.currentDeploymentId = deploymentId;
		BotManager.deployInstances.previousBuilds = [
			...BotManager.deployInstances.previousBuilds,
			...BotManager.deployInstances.latestBuild
		];
		BotManager.deployInstances.latestBuild = [ new Deployment(newInstanceDNS, BotManager.currentDeploymentId) ];
	}

	public static CreateTradeBot = async (currency: string, quoteAmount: number, repeatedlyTrade: boolean, percentageLoss: number = 1): Promise<{ success: boolean, botId?: string }> => {
		const deployment: Deployment = BotManager.GetDeploymentWithMostBots();
		if (deployment) {
			const botId: string = deployment.AddNewBot();
			BotManager.AddBotDirectoryItem(botId, deployment.dns);

			let response = undefined;

			try {
				response = await Bot.CreateBot(deployment.dns, botId, currency, quoteAmount, repeatedlyTrade, percentageLoss);
			} catch (e) {
				console.error(e);
				return { success: false };
			}

			if (response && response.success) deployment.ConfirmBot(botId);
			else deployment.FailBot(botId);

			return { ...response, botId };
		} else console.error('NO DEPLOYMENTS LEFT')
		return { success: false };
	}

	public static StopBot = async (botId: string): Promise<{ success: boolean }> => {
		let dns: string | undefined = BotManager.FindBotDirectoryDNS(botId);

		if (!dns) dns = BotManager.FindBotInstanceDNS(botId);
		if (!dns) {
			console.log('Failed to find bot instance DNS');
			return { success: false };
		}

		const deployment: Deployment| undefined = BotManager.FindDeploymentByDNS(dns);

		if (!deployment) {
			console.log('Failed to find bot deployment instance');
			return { success: false };
		}

		const response: { success: boolean } = await Bot.StopBot(dns, botId);

		if (response.success) {
			deployment.RemoveBot(botId);
			BotManager.RemoveBotDirectoryItem(botId);
		}

		return response;
	}

	private static FindBotDirectoryDNS = (botId: string): string | undefined => {
		return BotManager.botDirectory[botId];
	}

	private static AddBotDirectoryItem = (botId: string, dns: string): void => {
		BotManager.botDirectory[botId] = dns;
	}

	private static RemoveBotDirectoryItem = (botId: string): void => {
		delete BotManager.botDirectory[botId];
	}

	private static FindBotInstanceDNS = (botId: string): string | undefined => { // Backup method for finding DNS - slower
		let dns: string | undefined = undefined;

		BotManager.deployInstances.latestBuild.forEach((deployment: Deployment) => {
			const botRes: string | undefined = deployment.bots.find((b: string) => b === botId);
			const pendingBotRes: string | undefined = deployment.pendingBots.find((b: string) => b === botId);

			if (botRes || pendingBotRes) dns = deployment.dns;
		});

		if (dns) return dns;

		BotManager.deployInstances.previousBuilds.forEach((deployment: Deployment) => {
			const botRes: string | undefined = deployment.bots.find((b: string) => b === botId);
			const pendingBotRes: string | undefined = deployment.pendingBots.find((b: string) => b === botId);

			if (botRes || pendingBotRes) dns = deployment.dns;
		});

		return dns;
	}

	private static FindDeploymentByDNS = (dns: string): Deployment | undefined => {
		let deployment: Deployment | undefined = BotManager.deployInstances.latestBuild.find((d: Deployment) => d.dns === dns);
		if (!deployment) deployment = BotManager.deployInstances.previousBuilds.find((d: Deployment) => d.dns === dns);

		return deployment;
	}

	public static DeployBotInstance = async (): Promise<void> => {
		const deployment: Ec2InstanceDeployment = await InstanceRetrieval.GetLatestDeploymentLog();
		await DeployBotEc2.LaunchEC2(deployment.deploymentId);
	}

	private static GetDeploymentWithMostBots = (): Deployment => { // Return the deployment with most bots less than limit
		return BotManager.deployInstances.latestBuild.sort((a: Deployment, b: Deployment) => {
			if (a.botCount < b.botCount) return 1;
			if (a.botCount > b.botCount) return -1;
			return 0;
		}).filter((d: Deployment) => d.botCount < ENV.BOT_PER_INSTANCE_LIMIT)[0];
	}

	public static MonitorInstancesHealth = (): void => {
		BotManager.healthInterval = setInterval(() => {
			console.log('------------------------')
			console.log(JSON.stringify(BotManager.deployInstances.latestBuild))
			console.log(BotManager.botDirectory)
			console.log('------------------------')

			BotManager.deployInstances.latestBuild.forEach(async (deployment: Deployment) => {
				try {
					const response: { success: boolean } = await Health.HealthCheck(deployment.dns);
					if (response.success) {
						deployment.UpdateSuccessfulHealthCall();
						return console.log(`Deployment ${deployment.dns} is Healthy`);
					}
					deployment.UpdateNonSuccessfulHealthCall();
					console.error(`Error response from deployment ${deployment.dns} - NOT Healthy`);
				} catch (e) {
					deployment.UpdateNonSuccessfulHealthCall();
					console.error(`Error response from deployment ${deployment.dns} - NOT Healthy`);
				}
			});
			BotManager.deployInstances.previousBuilds.forEach(async (deployment: Deployment) => {
				try {
					const response: { success: boolean } = await Health.HealthCheck(deployment.dns);
					if (response.success) {
						deployment.UpdateSuccessfulHealthCall();
						return console.log(`Deployment ${deployment.dns} is Healthy`);
					}
					deployment.UpdateNonSuccessfulHealthCall();
					console.error(`Error response from deployment ${deployment.dns} - NOT Healthy`);
				} catch (e) {
					deployment.UpdateNonSuccessfulHealthCall();
					console.error(`Error response from deployment ${deployment.dns} - NOT Healthy`);
				}
			});
		}, 10000);
	}

	public static StopBotManager = (): void => {
		clearInterval(BotManager.healthInterval);
	}

}
