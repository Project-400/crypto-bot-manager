import https from 'https';
import * as AWS from 'aws-sdk';
import { Consumer, SQSMessage } from 'sqs-consumer';
import {
	AWS_ACCESS_KEY_ID,
	AWS_ACCOUNT_ID,
	AWS_AUTO_DELETED_BOTS_SQS_QUEUE,
	AWS_REGION,
	AWS_SECRET_ACCESS_KEY_ID
} from '../environment';
import {BotManager} from "../services/bot-manager";

AWS.config.update({
	region: AWS_REGION,
	accessKeyId: AWS_ACCESS_KEY_ID,
	secretAccessKey: AWS_SECRET_ACCESS_KEY_ID
});

export class AutoDeletedBotsConsumer {

	public static ListenToAutoDeleteBotConsumer = (): void => {
		const consumer: Consumer = Consumer.create({
			queueUrl: `https://sqs.${AWS_REGION}.amazonaws.com/${AWS_ACCOUNT_ID}/${AWS_AUTO_DELETED_BOTS_SQS_QUEUE}`,
			handleMessage: async (message: SQSMessage): Promise<void> => {
				await AutoDeletedBotsConsumer.HandleMessage(message);
			},
			sqs: new AWS.SQS({
				httpOptions: {
					agent: new https.Agent({
						keepAlive: true
					})
				}
			})
		});

		consumer.on('error', (err: Error): void => {
			console.error(err.message);
		});

		consumer.on('processing_error', (err: Error): void => {
			console.error(err.message);
		});

		consumer.start();
	}

	private static HandleMessage = (message: SQSMessage): void => {
		let messageBody: any;
		let botId: string | undefined = undefined;

		console.log(message)

		try {
			if (message.Body) {
				messageBody = JSON.parse(message.Body);
				botId = messageBody.Message;
				console.log(botId)
			}
		} catch (err) {
			console.error(`Failed to parse SQS message: ${err}`);
		}

		if (botId) {
			console.log(`Received request to remove auto deleted bot ${botId}`);
			BotManager.RemoveFinishedBot(botId);
		} else {
			console.error('Error: Received message via Auto Deleted Bot SQS queue with no botId');
		}
	}

}
