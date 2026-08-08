# EVA · NODUS SYSTEMS — Immo-Express Frontend
FROM nginx:alpine

# Copy nginx config
COPY config/nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files
COPY public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]