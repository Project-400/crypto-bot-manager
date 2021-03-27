import { Request, Response } from 'express';
import {BotManager} from "../services/bot-manager";

export class BotController {

	public static createBot = async (req: Request, res: Response): Promise<Response> => {
		BotManager.CreateTradeBot('');

		return res.status(200).json({ success: true });
	}

}
