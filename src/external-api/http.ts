import axios, { AxiosError, AxiosResponse } from 'axios';

export class HTTP {

	public static async get(url: string): Promise<any> {
		return new Promise((resolve: any, reject: any): void => {
			axios.get(`${url}`)
				.then((res: AxiosResponse): void => {
					if (res.status === 200) resolve(res.data);
					else reject(res);
				})
				.catch((error: AxiosError): void => {
					// console.error(error);
					reject(error);
				});
		});
	}

	public static async post(url: string, postData: any): Promise<any> {
		return new Promise((resolve: any, reject: any): void => {
			axios.post(`${url}`, postData)
				.then((res: AxiosResponse): void => {
					if (res.status === 200) resolve(res.data);
					else reject(res);
				})
				.catch((error: AxiosError): void => {
					// console.error(error);
					reject(error);
				});
		});
	}

}
