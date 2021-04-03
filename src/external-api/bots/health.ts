import { HTTP } from '../http';

export class Health {

	public static HealthCheck = async (dns: string): Promise<{ success: boolean }> => HTTP.get(`http://${dns}:3000/v1/health`);

}
