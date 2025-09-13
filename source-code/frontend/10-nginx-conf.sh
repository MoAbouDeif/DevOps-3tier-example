#!/bin/sh
set -e

envsubst '$DOMAIN_NAME $BACKEND_HOST $BACKEND_PORT ${REACT_APP_API_BASE_URL}' \
        < /etc/nginx/templates/nginx.conf.tmp \
        > /etc/nginx/conf.d/default.conf

echo "#########################################"
echo "### nginx.conf generated successfully ###"
echo "#########################################"