FROM node:24-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginx:alpine

WORKDIR /var/www/html

COPY public /var/www/html/public
COPY --from=frontend-build /app/frontend/dist /var/www/html/frontend/dist
COPY Docker/Nginx/nginx.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /var/www/html/public/storage

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
