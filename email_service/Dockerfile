FROM node:14
WORKDIR /email_service
COPY ./package*.json ./
RUN npm install
COPY . .
CMD ["npm run","pm2"]
