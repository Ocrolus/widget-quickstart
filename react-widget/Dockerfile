# pull official base image
FROM node:16-alpine

# set working directory
WORKDIR /app

# install app dependencies
COPY ./react-widget/package*.json ./
RUN npm install

# add app
COPY ./react-widget ./

# start app
EXPOSE 3001
CMD ["npm", "start"]
