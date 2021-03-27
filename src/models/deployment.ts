export class Deployment {

	public dns: string;
	public deployId: string;
	public botCount: number;
	public bots: string[];
	public pendingBots: string[];

	public constructor(dns: string, deployId: string) {
		this.dns = dns;
		this.deployId = deployId;
		this.botCount = 0;
		this.bots = [];
		this.pendingBots = [];
	}

	public AddNewBot = (botId: string) => {
		this.botCount = this.botCount + 1;
		this.pendingBots.push(botId);
	}

}
