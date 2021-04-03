import { Request, Response } from 'express';
import {BotManager} from "../services/bot-manager";

export class BotController {

	public static createBot = async (req: Request, res: Response): Promise<Response> => {
		console.log(req.body)
		if (!req.body || !req.body.currency || !req.body.quoteAmount || req.body.repeatedlyTrade === undefined)
			return res.status(400).json({ error: 'Invalid request params' });

		const currency: string = req.body.currency.toString();
		const quoteAmount: number = parseFloat(req.body.quoteAmount.toString());
		const repeatedlyTrade: boolean = req.body.repeatedlyTrade.toString() === 'true';
		const percentageLoss: number = req.query.percentageLoss ? parseFloat(req.query.percentageLoss.toString()) : 1;

		await BotManager.CreateTradeBot(currency, quoteAmount, repeatedlyTrade, percentageLoss);

		return res.status(200).json({ success: true });
	}

}
