FROM node:24-alpine AS build

ARG REACT_APP_API_BASE_URL=/api
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

WORKDIR /app

COPY calculator-app/package*.json .
RUN npm ci 

COPY calculator-app/ .
RUN npm run build

FROM nginx:1.29-alpine3.22

COPY --from=build app/build /usr/share/nginx/html

COPY nginx.conf.tmp /etc/nginx/templates/nginx.conf.tmp 

WORKDIR /app

COPY entrypoint.sh .
RUN chmod +x ./entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -sS http://localhost/healz/ || exit 1

ENTRYPOINT [ "./entrypoint.sh" ]
