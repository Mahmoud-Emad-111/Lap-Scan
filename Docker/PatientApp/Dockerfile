FROM node:24-alpine

WORKDIR /app

COPY patient-app/package*.json ./
RUN npm ci

COPY patient-app/ ./

EXPOSE 5174

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5174"]
