import { Request, Response } from 'express';
import {BotManager} from "../services/bot-manager";

export class BotController {

	public static createBot = async (req: Request, res: Response): Promise<Response> => {
		if (!req.query || !req.query.quoteAmount || req.query.repeatedlyTrade === undefined)
			return res.status(400).json({ error: 'Invalid request params' });

		const currencyPreChosen: boolean = req.query.botChoiceCurrency!.toString() === 'true';

		let currency: string | undefined;
		if (currencyPreChosen) {
			currency = undefined;
		} else {
			currency = req.query.currency!.toString();
		}

		const quoteAmount: number = parseFloat(req.query.quoteAmount.toString());
		const repeatedlyTrade: boolean = req.query.repeatedlyTrade.toString() === 'true';
		const percentageLoss: number = req.query.percentageLoss ? parseFloat(req.query.percentageLoss.toString()) : 1;

		try {
			const response: { success: boolean } = await BotManager.CreateTradeBot(currencyPreChosen, currency, quoteAmount, repeatedlyTrade, percentageLoss);

			if (!response.success) return res.status(500).json({ success: false, error: 'Failed to create bot (1)' });
			return res.status(200).json(response);
		} catch {
			return res.status(500).json({ success: false, error: 'Failed to create bot (2)' });
		}
	}

	public static stopBot = async (req: Request, res: Response): Promise<Response> => {
		if (!req.query || !req.query.botId)
			return res.status(400).json({ error: 'Invalid request params' });

		const botId: string = req.query.botId.toString();

		const response: { success: boolean } = await BotManager.StopBot(botId);

		if (!response.success) return res.status(400).json({ success: false });

		return res.status(200).json({ success: true });
	}

}
