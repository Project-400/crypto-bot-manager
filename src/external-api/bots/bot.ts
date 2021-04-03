import { HTTP } from '../http';

export class Bot {

	public static CreateBot = async (dns: string, botId: string, currency: string, quoteAmount: number,
									 repeatedlyTrade: boolean, percentageLoss: number): Promise<{ success: boolean }> =>
		HTTP.post(`http://${dns}:3000/v1/bot`, { botId, currency, quoteAmount, repeatedlyTrade, percentageLoss })

}
