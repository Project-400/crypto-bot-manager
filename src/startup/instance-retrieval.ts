import {ENV} from "../environment";
import {Deployment} from "../models/deployment";
import * as AWS from 'aws-sdk';
import {Ec2InstanceDeployment} from "@crypto-tracker/common-types";
import CrudServiceDeployments from "../external-api/crud-service/services/deployments";
import {BotManager} from "../services/bot-manager";

export class InstanceRetrieval {

	public static Setup = async (): Promise<void> => {
		const deploymentId: string = await InstanceRetrieval.GetLatestDeploymentLog();


	}

	private static GetLatestDeploymentLog = async (): Promise<string> => {
		const deploymentLog: Ec2InstanceDeployment = await CrudServiceDeployments.GetLatestDeploymentLog(ENV.EC2_APP_NAME);

		if (!deploymentLog) throw Error('No deployment log retrieved from CRUD Service');

		BotManager.SetCurrentDeploymentId(deploymentLog.deploymentId);

		return deploymentLog.deploymentId;
	}

	public static GatherCurrentlyRunningInstances = () => {
		AWS.config.update({region: 'eu-west-1'});
		const ec2 = new AWS.EC2({apiVersion: '2016-11-15'});

		const params = {
			Filters: [
				{
					Name: 'tag:AppName',
					Values: [ ENV.EC2_APP_NAME ]
				}
			]
		};

		ec2.describeInstances(params, function (err, data) {
			const deployments: (AWS.EC2.Instance | undefined)[] | undefined = data.Reservations
				?.map((r: AWS.EC2.Reservation) => r.Instances)
				.flat();
			// .map((i: AWS.EC2.Instance | undefined) => i && i.PublicDnsName);

			const latestBuildDeployments: (AWS.EC2.Instance)[] | undefined = deployments?.filter((i: AWS.EC2.Instance | undefined) => {
				if (!i) return false;
				const deploymentId: AWS.EC2.Tag | undefined = i.Tags?.find((tag: AWS.EC2.Tag) => tag.Key === 'DeploymentId');
				return !!(deploymentId && deploymentId.Value === BotManager.currentDeploymentId);
			}) as AWS.EC2.Instance[];

			const previousBuildDeployments: (AWS.EC2.Instance)[] | undefined = deployments?.filter((i: AWS.EC2.Instance | undefined) => {
				if (!i) return false;
				const deploymentId: AWS.EC2.Tag | undefined = i.Tags?.find((tag: AWS.EC2.Tag) => tag.Key === 'DeploymentId');
				return !!(deploymentId && deploymentId.Value !== BotManager.currentDeploymentId);
			}) as AWS.EC2.Instance[];

			if (latestBuildDeployments) {
				BotManager.deployInstances.latestBuild = latestBuildDeployments
					.filter((i: AWS.EC2.Instance | undefined): boolean => !!i)
					.map((i: AWS.EC2.Instance): Deployment | undefined => {
						if (i.PublicDnsName) return new Deployment(i.PublicDnsName, BotManager.currentDeploymentId);
					})
					.filter((d: Deployment | undefined): boolean => !!d) as Deployment[];
			}
			if (previousBuildDeployments) {
				BotManager.deployInstances.previousBuilds = previousBuildDeployments
					.filter((i: AWS.EC2.Instance | undefined): boolean => !!i)
					.map((i: AWS.EC2.Instance): Deployment | undefined => {
						if (i.PublicDnsName) return new Deployment(i.PublicDnsName, 'Unknown');
					})
					.filter((d: Deployment | undefined): boolean => !!d) as Deployment[];
			}

			console.log(BotManager.deployInstances)
		});
	}

}
