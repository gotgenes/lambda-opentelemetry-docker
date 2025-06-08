import { BackendStack } from "./stacks/backend";
import { ContainerRepositoryStack } from "./stacks/container";
import * as cdk from "aws-cdk-lib";

export function buildApp(): void {
  const app = new cdk.App();
  const env = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  };
  const props = { env };
  cdk.Tags.of(app).add("app", "LambdaOtelDockerApp");

  const containerRepositoryProps = { ...props };
  const containerRepositoryStack = new ContainerRepositoryStack(
    app,
    "LambdaOtelDockerContainerRepository",
    containerRepositoryProps,
  );

  const backendProps = {
    containerRepository: containerRepositoryStack.repository,
    ...props,
  };

  new BackendStack(app, "LambdaOtelDockerBackend", backendProps);
}
