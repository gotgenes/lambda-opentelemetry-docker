import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import type { Construct } from "constructs";

export class ContainerRepositoryStack extends cdk.Stack {
  public readonly repository: ecr.Repository;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const repository = new ecr.Repository(
      this,
      "LambdaOtelDockerContainerRepository",
      {
        repositoryName: "lambda-otel-docker",
        emptyOnDelete: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );
    this.repository = repository;

    new cdk.CfnOutput(this, "RepositoryURI", {
      value: repository.repositoryUri,
    });
  }
}
