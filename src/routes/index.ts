import express, { Router } from 'express';
import { BotController, HealthController } from '../controllers';

const indexRouter: Router = express.Router();

indexRouter.get('/health', HealthController.health);
indexRouter.get('/launch', BotController.createBot);

export default indexRouter;
