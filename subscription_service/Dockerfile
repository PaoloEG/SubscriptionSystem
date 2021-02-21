FROM node:14
WORKDIR /subscription_service
COPY ./package*.json ./
RUN npm install
COPY . .
CMD ["npm run","pm2"]
