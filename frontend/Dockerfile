# pull official base image
FROM node:16-alpine

# set working directory
WORKDIR /app

# install app dependencies
COPY ./frontend/package*.json ./
RUN npm install

# add app
COPY ./frontend ./

# start app
EXPOSE 3000
CMD ["npm", "start"]
