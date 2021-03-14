import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import indexRouter from './routes';
import { WebsocketProducer } from './config/websocket/producer';

const app: express.Application = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/v1', indexRouter);

WebsocketProducer.setup(app);

const port: number = (Number(process.env.PORT) + 1) || 3000;
const listenPort: number = port + 1;

app.listen(listenPort, '0.0.0.0', (): void => {
	console.log('Listening to port: ' + port);
});

export default app;
