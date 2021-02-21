FROM node:14
WORKDIR /public_apis/customers
COPY ./package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm run","pm2"]
