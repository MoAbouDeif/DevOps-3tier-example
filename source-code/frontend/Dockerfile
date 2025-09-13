FROM node:24-alpine AS build

ARG REACT_APP_API_BASE_URL=/api
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

WORKDIR /app
COPY calculator-app/package*.json .
RUN npm ci 

COPY calculator-app/ .
RUN npm run build

FROM nginx:1.29-alpine3.22

ENV REACT_APP_API_BASE_URL=/api \
    DOMAIN_NAME= \
    BACKEND_HOST= \
    BACKEND_PORT=

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf.tmp /etc/nginx/templates/nginx.conf.tmp 
RUN rm -f /etc/nginx/conf.d/default.conf

WORKDIR /app
COPY 10-nginx-conf.sh /docker-entrypoint.d/10-nginx-conf.sh
RUN chmod +x /docker-entrypoint.d/10-nginx-conf.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]