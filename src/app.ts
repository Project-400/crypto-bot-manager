import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './routes';
import { WebsocketProducer } from './config/websocket/producer';
import {SQSConsumer} from "./bot-deployments/sqs-consumer";
import * as AWS from 'aws-sdk';
import {ENV} from "./environment";
import {BotManager} from "./services/bot-manager";
import {InstanceRetrieval} from "./startup/instance-retrieval";

const app: express.Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/v1', indexRouter);

InstanceRetrieval.Setup().then(() => {
	console.log('Manage works after this')

	console.log(BotManager.GetAllBuilds())
});

SQSConsumer.SetupConsumer();
WebsocketProducer.setup(app);

const port: number = (Number(process.env.PORT) + 1) || 3000;
const listenPort: number = port + 1;

app.listen(listenPort, '0.0.0.0', (): void => {
	console.log('Listening to port: ' + port);
});

export default app;
