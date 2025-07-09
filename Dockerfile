ARG NODE_VERSION="22"
ARG NODE_LAMBDA_BASE="public.ecr.aws/lambda/nodejs:${NODE_VERSION}"
ARG OTEL_COLLECTOR_LAYER_VERSION="0.15.0"
ARG OTEL_COLLECTOR_LAYER="https://github.com/open-telemetry/opentelemetry-lambda/releases/download/layer-collector%2F${OTEL_COLLECTOR_LAYER_VERSION}/opentelemetry-collector-layer-arm64.zip"
ARG OTEL_NODE_LAYER_VERSION="0.15.0"
ARG OTEL_NODE_LAYER="https://github.com/open-telemetry/opentelemetry-lambda/releases/download/layer-nodejs%2F${OTEL_NODE_LAYER_VERSION}/opentelemetry-nodejs-layer.zip"
ARG OTEL_NODE_ENABLED_INSTRUMENTATIONS="aws-lambda,aws-sdk,undici"

FROM ${NODE_LAMBDA_BASE} AS lambda-runtime-dependencies
WORKDIR "/build"
COPY package.json package-lock.json ./
COPY lambda/package.json ./lambda/
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit dev --workspace=lambda

FROM lambda-runtime-dependencies AS lambda-dependencies
RUN --mount=type=cache,target=/root/.npm \
    npm install --workspace=lambda

FROM lambda-dependencies AS lambda-build
COPY lambda/tsconfig.json lambda/tsup.config.ts ./lambda/
COPY lambda/src ./lambda/src/
RUN npm run build --workspace=lambda

FROM ${NODE_LAMBDA_BASE} AS lambda
WORKDIR "/var/task"
COPY --from=lambda-runtime-dependencies /build/node_modules node_modules/
COPY --from=lambda-runtime-dependencies /build/lambda/package.json ./
COPY --from=lambda-build /build/lambda/dist ./
CMD ["index.handler"]

FROM alpine:latest AS otel-nodejs-lambda-layer
ARG OTEL_NODE_LAYER
WORKDIR "/layer"
ADD ${OTEL_NODE_LAYER} /tmp/
RUN unzip /tmp/opentelemetry-nodejs-layer.zip -d ./

FROM lambda AS instrumented-lambda
ARG OTEL_NODE_ENABLED_INSTRUMENTATIONS
COPY --from=otel-nodejs-lambda-layer /layer /opt/
ENV AWS_LAMBDA_EXEC_WRAPPER=/opt/otel-handler
ENV OTEL_NODE_ENABLED_INSTRUMENTATIONS=${OTEL_NODE_ENABLED_INSTRUMENTATIONS}

FROM alpine:latest AS otel-lambda-layers
ARG OTEL_COLLECTOR_LAYER
WORKDIR "/layer"
ADD ${OTEL_COLLECTOR_LAYER} /tmp/
RUN unzip /tmp/opentelemetry-collector-layer-arm64.zip -d ./

FROM instrumented-lambda AS otel-lambda
COPY --from=otel-lambda-layers /layer /opt/
COPY otel-collector-config.yaml ./otel-collector-config.yaml
ENV OPENTELEMETRY_COLLECTOR_CONFIG_URI=file:///var/task/otel-collector-config.yaml
