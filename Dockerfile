FROM alpine

ENV NODE_ENV 'production'

RUN apk add --no-cache --update nodejs npm
RUN npm install -g sails

WORKDIR /usr/src/app

COPY package.json /usr/src/app
COPY package-lock.json /usr/src/app
RUN npm install

COPY . /usr/src/app

EXPOSE 80

CMD sails lift
