# Container Image Lambda with OpenTelemetry Lambda Extension Layers

This repository demonstrates how to create an [AWS Lambda](https://docs.aws.amazon.com/lambda/) function backed by a [Docker Container image](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) instrumented with [OpenTelemetry](https://opentelemetry.io/) using the [OpenTelemetry Lambda Extension Layers](https://github.com/open-telemetry/opentelemetry-lambda/).

The project uses the following technologies:

- [Node.js](https://nodejs.org/) and [TypeScript](https://www.typescriptlang.org/) for the Lambda function code.
- The [OpenTelemetry Lambda Layers](https://github.com/open-telemetry/opentelemetry-lambda) to provide telemetry signals.
- [AWS Cloud Development Kit (CDK)](https://aws.amazon.com/cdk/) to define the infrastructure as code.
- a [Docker Container image](https://docs.aws.amazon.com/lambda/latest/dg/images-create.html) as the distribution format for the Lambda function.

## Prerequisites

### Docker

If you want to build and run the application locally, you need to have Docker installed.
See the [Docker documentation for installation instructions](https://docs.docker.com/get-docker/).

### AWS CLI

You need to have the [AWS CLI](https://aws.amazon.com/cli/) installed and configured with your AWS account.

### IAM Identity Center (Recommended)

[AWS recommends](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-authentication.html) using [IAM Identity Center](https://docs.aws.amazon.com/singlesignon/latest/userguide/what-is.html) to access short-term credentials programmatic access to AWS services (e.g., AWS CLI, or using the CDK locally).
Refer to [AWS CLI's documentation on configuring authentication with IAM Identity Center](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html) if you have not yet set it up.

The command `npm run login` uses Identity Center to authenticate you with AWS (via `aws sso login`).

## Running locally

### Environment Variables

You'll want to have the following environment variables set:

- `AWS_PROFILE`
- `COMPOSE_BAKE=true`

[mise](https://mise.jdx.dev/) provides helpful tooling for ensuring environment variables are set correctly for a given project.

You'll want to set the AWS credential variables in the shell launching the Docker container. You can do this by running:

### AWS Credentials

#### Log in to AWS (IAM Identity Center)

Assuming you have the AWS CLI configured with IAM Identity Center, you can log in with the following command:

```sh
npm run login
```

#### Exporting AWS Credentials to the shell for the Docker container

The Lambda container will use environment variables to access AWS credentials, which you set as environment variables prior to starting the container.
Run the following command to export the AWS credentials to the shell:

```sh
source ./scripts/set-aws-credentials.sh
```

Note you need to use the `source` command to run the script in the current shell, so that the environment variables are set in the current shell.

#### Resetting AWS Credentials

If you see a message like

```txt
Credentials were refreshed, but the refreshed credentials are still expired.
```

you can reset your AWS credentials by running:

```sh
source ./scripts/unset-aws-credentials.sh
aws sso login
source ./scripts/set-aws-credentials.sh
```

### Starting the Lambda container

Start the Lambda container with the following command:

```sh
docker compose up --build
```

This will start the container and expose it locally on port 9000.

### Invoking the Lambda

You can invoke the Lambda function locally using the following command:

```sh
curl -XPOST -d '{}' http://localhost:9000/2015-03-31/functions/function/invocations
```

### Viewing the OpenTelemetry signals

You can view the OpenTelemetry signals locally by attaching to the [otel-tui](https://github.com/ymtdzzz/otel-tui) sidecar container:

```sh
docker compose attach oteltui
```

## Deploying to AWS

### Create the ECR repository

Synthesize the CDK app:

```sh
npm run build --workspace=cdk
```

Then deploy the Elastic Container Repository stack:

```sh
npm run cdk --workspace=cdk -- deploy LambdaOtelDockerContainerRepository
```

### Build and push the Docker image to ECR

Log Docker into ECR:

```sh
npm run login-docker
```

Build the Docker image:

```sh
npm run build
```

Publish the image to ECR:

```sh
npm run publish-docker
```

### Deploy the Lambda function

Finally, deploy the Lambda function stack:

```sh
npm run deploy
```
