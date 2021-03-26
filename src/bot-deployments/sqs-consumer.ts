import https from 'https';
import * as AWS from 'aws-sdk';
import { Consumer, SQSMessage } from 'sqs-consumer';
import { ENV } from '../environment';

AWS.config.update({
	region: ENV.AWS_REGION,
	accessKeyId: ENV.AWS_ACCESS_KEY_ID,
	secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY_ID
});


export class SQSConsumer {

	public static SetupConsumer = async (): Promise<void> => {
		// const queueName: string = await SQSConsumer.CreateQueue(instanceId);
		// await SQSConsumer.SubscribeToSNSTopic(queueName);
		SQSConsumer.ListenToQueue();
	}

	public static ListenToQueue = (): void => {
		const consumer: Consumer = Consumer.create({
			queueUrl: `https://sqs.${ENV.AWS_REGION}.amazonaws.com/${ENV.AWS_ACCOUNT_ID}/${ENV.AWS_CRYPTO_BOT_DEPLOYMENT_SQS_QUEUE_NAME}`,
			handleMessage: async (message: SQSMessage): Promise<void> => {
				await SQSConsumer.HandleMessage(message);
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
			if (message.Body) messageBody = JSON.parse(message.Body);
		} catch (err) {
			console.error(`Failed to parse SQS message: ${err}`);
		}

		if (messageBody) {
			const deploymentMessage: any = JSON.parse(messageBody.Message);

			console.log(deploymentMessage)

			// if (currencySuggestion.symbol) CurrencySuggestionsManager.AddSuggestion(currencySuggestion);
		}
	}

}
