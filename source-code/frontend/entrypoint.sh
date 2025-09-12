#!/bin/sh
set -e

envsubst '$DOMAIN_NAME $BACKEND_HOST $BACKEND_PORT' \
        < /etc/nginx/templates/nginx.conf.tmp \
        > /etc/nginx/conf.d/default.conf

echo
echo "###################################"
echo "######## Nginx Config File ########"
echo "###################################"

cat /etc/nginx/conf.d/default.conf

echo "###################################"
echo "############### End ###############"
echo "###################################"
echo 
echo "Starting Nginx with DOMAIN: $DOMAIN_NAME BACKEND_HOST: $BACKEND_HOST BACKEND_PORT: $BACKEND_PORT"
echo "##################################################################"

exec nginx -g 'daemon off;'