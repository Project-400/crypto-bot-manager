import express, { Router } from 'express';
import { BotController, HealthController } from '../controllers';

const indexRouter: Router = express.Router();

indexRouter.get('/health', HealthController.health);
indexRouter.post('/bot', BotController.createBot);
indexRouter.post('/auto-bot', BotController.createAutoBot);
indexRouter.delete('/bot', BotController.stopBot);

export default indexRouter;
