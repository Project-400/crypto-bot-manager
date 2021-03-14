import { Request, Response } from 'express';

export class HealthController {

	public static health = (req: Request, res: Response): Response =>
		res.status(200).json({ success: true })

}
