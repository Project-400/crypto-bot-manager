import moment from 'moment';
import { v4 as uuid } from 'uuid';

export enum DeploymentHealth {
	HEALTHY = 'HEALTHY',
	UNHEALTHY = 'UNHEALTHY'
}
export enum DeploymentState {
	UNKNOWN = 'UNKNOWN',
	STARTING_UP = 'STARTING_UP',
	WORKING = 'WORKING',
	DOWN = 'DOWN',
	SHUTTING_DOWN = 'SHUTTING_DOWN',
	SHUT_DOWN = 'SHUT_DOWN'
}

export class Deployment {

	public deploymentHealth: DeploymentHealth;
	public deploymentState: DeploymentState;
	public dns: string;
	public deploymentId: string;
	public totalBotCount: number = 0;					// Total count of bots on instance since startup including failed
	public activeBotCount: number = 0;					// Current count of bots trading on instance
	public pendingBotCount: number = 0;					// Current count of bots setting up on instance
	public currentBotCount: number = 0;					// Current count of bots (trading and setting up) on instance
	public failedBotCount: number = 0;					// Total count of failed bots on instance
	public bots: string[];
	public pendingBots: string[];
	public lastSuccessfulHealthCall?: Date;
	public beginningOfUnhealthyCalls?: Date;

	public constructor(dns: string, deploymentId: string, health: DeploymentHealth = DeploymentHealth.UNHEALTHY, state: DeploymentState = DeploymentState.UNKNOWN) {
		this.dns = dns;
		this.deploymentId = deploymentId;
		this.bots = [];
		this.pendingBots = [];
		this.deploymentHealth = health;
		this.deploymentState = state;
	}

	public AddNewBot = (): string => {
		const botId: string = uuid();
		this.totalBotCount = this.totalBotCount + 1;
		this.pendingBotCount = this.pendingBotCount + 1;
		this.currentBotCount = this.currentBotCount + 1;
		this.pendingBots.push(botId);
		return botId;
	}

	public ConfirmBot = (botId: string) => {
		const index: number = this.pendingBots.findIndex((b: string) => b === botId);
		if (index > -1) {
			this.pendingBots.splice(index, 1);
			this.activeBotCount = this.activeBotCount + 1;
			this.pendingBotCount = this.pendingBotCount - 1;
		}
		this.bots.push(botId);
	}

	public FailBot = (botId: string) => {
		const index: number = this.pendingBots.findIndex((b: string) => b === botId);
		if (index > -1) {
			this.pendingBots.splice(index, 1);
			this.pendingBotCount = this.pendingBotCount - 1;
			this.currentBotCount = this.currentBotCount - 1;
			this.failedBotCount = this.failedBotCount + 1;
		}
	}

	public RemoveBot = (botId: string) => {
		const index: number = this.bots.findIndex((b: string) => b === botId);
		if (index > -1) {
			this.bots.splice(index, 1);
			this.currentBotCount = this.currentBotCount - 1;
			this.activeBotCount = this.activeBotCount - 1;
		}
	}

	public UpdateSuccessfulHealthCall = () => {
		this.deploymentHealth = DeploymentHealth.HEALTHY;
		this.lastSuccessfulHealthCall = new Date();
		this.beginningOfUnhealthyCalls = undefined;
		console.log('Healthy....')
	}

	public UpdateNonSuccessfulHealthCall = () => {
		this.deploymentHealth = DeploymentHealth.UNHEALTHY;
		this.lastSuccessfulHealthCall = undefined;
		if (!this.beginningOfUnhealthyCalls) this.beginningOfUnhealthyCalls = new Date();

		const timeDiff: number = moment().diff(moment(this.beginningOfUnhealthyCalls));
		const secondsDuration: number = moment.duration(timeDiff).asSeconds();

		if (secondsDuration >= 60 && this.deploymentState !== DeploymentState.STARTING_UP) {
			console.log('Unhealthy for more than a minute');
		} else if (secondsDuration >= 300 && this.deploymentState === DeploymentState.STARTING_UP) {
			console.log('Unhealthy for more than 5 minutes');
		} else {
			console.log('Instance has been unhealthy for less than 60 seconds');
		}
	}

}
