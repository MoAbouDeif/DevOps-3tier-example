FROM node:24-alpine AS build

ARG REACT_APP_API_BASE_URL=/api
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

WORKDIR /app
COPY calculator-app/package*.json .
RUN npm ci 

COPY calculator-app/ .
RUN npm run build

FROM nginx:1.29-alpine3.22

RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx /run \
    && chown -R nginx:nginx /var/cache/nginx /var/run /var/log/nginx /etc/nginx /run

USER nginx

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
