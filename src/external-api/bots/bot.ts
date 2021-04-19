import { HTTP } from '../http';

export class Bot {

	public static CreateBot = async (dns: string, botId: string, currencyPreChosen: boolean, currency: string | undefined, quoteAmount: number,
									 repeatedlyTrade: boolean, percentageLoss: number): Promise<{ success: boolean }> => {
		return HTTP.post(`http://${dns}:3000/v1/bot`, {
			botId,
			currencyPreChosen,
			currency,
			quoteAmount,
			repeatedlyTrade,
			percentageLoss
		});
	}

	public static StopBot = async (dns: string, botId: string): Promise<{ success: boolean }> => {
		return HTTP.delete(`http://${dns}:3000/v1/bot?botId=${botId}`, undefined);
	}

}
