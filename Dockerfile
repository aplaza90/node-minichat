FROM node:20.13.1-bullseye-slim

WORKDIR /src

COPY package*.json ./

RUN --mount=type=cache,target=/src/.npm \
  npm set cache /src/.npm && \
  npm ci 

USER node

COPY --chown=node:node ./src/ .

EXPOSE 3000


CMD [ "node", "server/index.js" ]