#!/bin/bash

docker buildx build \
  --platform linux/amd64 \
  -f ./AstroDeLaConchaSuMar/Dockerfile.prod \
  --build-arg BACKEND_URL=https://backend-889856606817.europe-west1.run.app \
  --build-arg PUBLIC_BACKEND_URL=https://backend-889856606817.europe-west1.run.app \
  -t us-central1-docker.pkg.dev/de-la-concha-su-mar/app-repo/frontend:latest \
  ./AstroDeLaConchaSuMar \
  --push

docker buildx build \
  --platform linux/amd64 \
  -f ./rest-modules/Dockerfile.prod \
  -t us-central1-docker.pkg.dev/de-la-concha-su-mar/app-repo/backend:latest \
  ./rest-modules \
  --push