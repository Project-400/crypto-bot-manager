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
	public lastSuccessfulHealthCall?: string;
	public lastNonSuccessfulHealthCall?: string;
	public beginningOfUnhealthyCalls?: string;

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
		this.lastSuccessfulHealthCall = new Date().toISOString();
		this.lastNonSuccessfulHealthCall = undefined;
		this.beginningOfUnhealthyCalls = undefined;
	}

	public UpdateNonSuccessfulHealthCall = () => {
		this.deploymentHealth = DeploymentHealth.UNHEALTHY;
		if (!this.beginningOfUnhealthyCalls) this.beginningOfUnhealthyCalls = new Date().toISOString();
		this.lastNonSuccessfulHealthCall = new Date().toISOString();
		// TODO: If gap between beginningOfUnhealthyCalls and lastNonSuccessfulHealthCall / now is greater than 60? seconds, replace instance
		this.lastSuccessfulHealthCall = undefined;
	}

}
