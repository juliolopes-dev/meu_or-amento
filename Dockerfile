FROM nginx:alpine

# Invalidate cache
ARG CACHEBUST=1

# Copy frontend files
COPY index.html /usr/share/nginx/html/
COPY login.html /usr/share/nginx/html/
COPY config.js /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
