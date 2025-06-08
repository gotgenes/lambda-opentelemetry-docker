# Source this file so that the AWS credentials get set in the current shell
# Make sure you have set AWS_PROFILE ahead of time

eval "$(aws configure export-credentials --format env)"
AWS_REGION="$(aws configure get region)"
export AWS_REGION
