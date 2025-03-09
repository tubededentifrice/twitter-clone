FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/react-app/package*.json ./
RUN npm install
COPY frontend/react-app/ ./
RUN npm run build

FROM nginx:alpine AS nginx-config
# Create a custom nginx configuration
COPY frontend/react-app/nginx.conf /etc/nginx/conf.d/default.conf.template

FROM python:3.11.7-slim

WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build /app/static
COPY --from=nginx-config /etc/nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf.template

# Install Nginx and supervisor
RUN apt-get update && apt-get install -y nginx supervisor && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure Nginx
RUN echo 'daemon off;' >> /etc/nginx/nginx.conf
COPY --from=nginx-config /etc/nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf
RUN rm -rf /var/www/html && ln -sf /app/static /var/www/html

# Configure supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt && \
    rm requirements.txt

# Copy backend code
COPY backend/ /app/

# Create uploads and config directories
RUN mkdir -p /app/uploads /app/config

# Expose ports
EXPOSE 80 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV UPLOADS_DIR=/app/uploads
ENV CONFIG_DIR=/app/config

# Command to run the application using supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]