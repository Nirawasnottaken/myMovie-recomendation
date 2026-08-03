# Day 4: Multi-stage Frontend Nginx Container Definition
FROM nginx:alpine

# Copy static assets to Nginx web root
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

# Copy custom Nginx configuration with reverse proxy for API
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
