import CrudService from '../index';
import { Ec2InstanceDeployment } from '@crypto-tracker/common-types';

export default class CrudServiceDeployments extends CrudService {

	private static SERVICE_PATH: string = '/deployment';

	public static GetLatestDeploymentLog = async (appName: string): Promise<Ec2InstanceDeployment> =>
		CrudService.get(`${CrudServiceDeployments.SERVICE_PATH}/latest/${appName}`)

}
