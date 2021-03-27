export class Deployment {

	public dns: string;
	public deploymentId: string;
	public botCount: number;
	public bots: string[];
	public pendingBots: string[];

	public constructor(dns: string, deploymentId: string) {
		this.dns = dns;
		this.deploymentId = deploymentId;
		this.botCount = 0;
		this.bots = [];
		this.pendingBots = [];
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

}
