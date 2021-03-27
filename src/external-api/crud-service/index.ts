import { ENV } from '../../environment';
import { HTTP } from '../http';

export default class CrudService {

	protected static async get(path: string): Promise<any> {
		return HTTP.get(`${ENV.CRUD_SERVICE_URL}${path}`);
	}

	protected static async post(path: string, postData: any): Promise<any> {
		return HTTP.post(`${ENV.CRUD_SERVICE_URL}${path}`, postData);
	}

}

export interface CrudServiceResponse {
	success: boolean;
}
