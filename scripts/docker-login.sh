#!/usr/bin/env bash
# Authenticates local Docker cilent to the Amazon ECR registry.

set -e
set -x

REPOSITORY_NAME="lambda-otel-docker"

query="repositories[?repositoryName==\`$REPOSITORY_NAME\`] | [0].repositoryUri"
ecr_uri=$(aws ecr describe-repositories --output text --query "$query")
region="${CDK_DEFAULT_REGION:-$(aws configure get region)}"
registry_url=${ecr_uri%/*}
aws ecr get-login-password --region "$region" | docker login --username AWS --password-stdin "$registry_url"
