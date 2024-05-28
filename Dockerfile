FROM node:20.13.1-bullseye-slim

WORKDIR /usr/src

# Copy only files required to install
# dependencies (better layer caching)
COPY package*.json ./

RUN --mount=type=cache,target=/usr/src/.npm \
  npm set cache /usr/src/.npm && \
  npm ci 

USER node

COPY --chown=node:node ./src/ .

EXPOSE 3000

CMD [ "node", "server/index.js" ]