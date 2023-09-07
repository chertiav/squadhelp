FROM node:18.17.1

RUN mkdir ./server

# Create app directory
WORKDIR /server

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install app dependencies
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD [ "npm", "run", "start" ]