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

		console.log(message);

		try {
			if (message.Body) messageBody = message.Body;
		} catch (err) {
			console.error(`Failed to parse SQS message: ${err}`);
		}

		console.log(messageBody)

		// if (messageBody) {
		//
		// 	if (currencySuggestion.symbol) CurrencySuggestionsManager.AddSuggestion(currencySuggestion);
		// }
	}

}
