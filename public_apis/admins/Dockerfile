FROM node:14
WORKDIR /public_apis/admins
COPY ./package*.json ./
RUN npm install
COPY . .
EXPOSE 4000
CMD ["npm run","pm2"]
