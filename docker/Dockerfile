FROM node:22.2.0-slim

ARG HF_API_KEY
ARG NODE_ENV
WORKDIR /app

COPY yarn.lock package.json ./
RUN yarn install

COPY . .
RUN yarn build

CMD ["yarn", "start"]