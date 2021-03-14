import express, { Router } from 'express';
import { HealthController } from '../controllers';

const indexRouter: Router = express.Router();

indexRouter.get('/health', HealthController.health);

export default indexRouter;
