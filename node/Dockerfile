FROM node:alpine

WORKDIR /app
RUN chown -R node:node /app
COPY --chown=node:node ./node/package*.json /app/

USER node
RUN npm install

COPY --chown=node:node ./node/index.js ./
COPY --chown=node:node ./.env ./

EXPOSE 8000
ENTRYPOINT ["node"]
CMD ["index.js"]
