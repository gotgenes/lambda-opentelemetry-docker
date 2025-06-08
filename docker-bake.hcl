group "default" {
  targets = ["lambda-otel-docker"]
}

target "lambda-otel-docker" {
  target = "otel-lambda"
  context = "."
  tags = ["lambda-otel-docker:latest"]
}
