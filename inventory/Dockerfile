FROM node:latest

MAINTAINER Alagappan Arumugam

ENV NODE_ENV=production
ENV PORT=3001

COPY . /app
WORKDIR /app

RUN npm install

EXPOSE $PORT
