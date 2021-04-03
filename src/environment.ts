import dotenv from 'dotenv';

dotenv.config();

export const PORT: string = process.env.PORT as string;

export const TEST_MODE: boolean = process.env.TEST_MODE as string === 'true';

export const CRUD_SERVICE_URL: string = process.env.CRUD_SERVICE_URL as string;

export const APP_NAME: string = process.env.APP_NAME as string;
export const EC2_APP_NAME_TAG: string = process.env.EC2_APP_NAME_TAG as string;

export const AWS_ACCOUNT_ID: string = process.env.AWS_ACCOUNT_ID as string;
export const AWS_REGION: string = process.env.AWS_REGION as string;
export const AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID as string;
export const AWS_SECRET_ACCESS_KEY_ID: string = process.env.AWS_SECRET_ACCESS_KEY_ID as string;

export const AWS_CRYPTO_BOT_DEPLOYMENT_SQS_QUEUE_NAME: string = process.env.AWS_CRYPTO_BOT_DEPLOYMENT_SQS_QUEUE_NAME as string;

export const BOT_PER_INSTANCE_LIMIT: number = Number(process.env.BOT_PER_INSTANCE_LIMIT);

export const ENV: { [key: string]: any } = {
	APP_NAME,
	TEST_MODE,
	EC2_APP_NAME_TAG,
	AWS: {
		AWS_ACCOUNT_ID,
		AWS_REGION,
		AWS_ACCESS_KEY_ID,
		AWS_SECRET_ACCESS_KEY_ID,
		AWS_CRYPTO_BOT_DEPLOYMENT_SQS_QUEUE_NAME
	},
	BOT_PER_INSTANCE_LIMIT,
	CRUD_SERVICE_URL
};

