import moment from 'moment';

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
	public botCount: number;
	public bots: string[];
	public pendingBots: string[];
	public lastSuccessfulHealthCall?: Date;
	public beginningOfUnhealthyCalls?: Date;

	public constructor(dns: string, deploymentId: string, health: DeploymentHealth = DeploymentHealth.UNHEALTHY, state: DeploymentState = DeploymentState.UNKNOWN) {
		this.dns = dns;
		this.deploymentId = deploymentId;
		this.botCount = 0;
		this.bots = [];
		this.pendingBots = [];
		this.deploymentHealth = health;
		this.deploymentState = state;
	}

	public AddNewBot = (botId: string) => {
		this.botCount = this.botCount + 1;
		this.pendingBots.push(botId);
	}

	public ConfirmBot = (botId: string) => {
		const index: number = this.pendingBots.findIndex((b: string) => b === botId);
		if (index > -1) this.pendingBots.splice(index, 1);
		this.bots.push(botId);
	}

	public RemoveBot = (botId: string) => {
		const index: number = this.bots.findIndex((b: string) => b === botId);
		if (index > -1) this.bots.splice(index, 1);
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

		if (moment.duration(moment().diff(moment(this.beginningOfUnhealthyCalls))).asSeconds() >= 60 && this.deploymentState !== DeploymentState.STARTING_UP) {
			console.log('Unhealthy for more than a minute');
		} else if (moment.duration(moment().diff(moment(this.beginningOfUnhealthyCalls))).asSeconds() >= 300 && this.deploymentState === DeploymentState.STARTING_UP) {
			console.log('Unhealthy for more than 5 minutes');
		} else {
			console.log('Instance has been unhealthy for less than 60 seconds');
		}
	}

}
