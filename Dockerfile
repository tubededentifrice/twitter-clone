FROM --platform=linux/amd64 node:20-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/react-app/package*.json ./
RUN npm install
COPY frontend/react-app/ ./
RUN npm run build

FROM --platform=linux/amd64 nginx:alpine AS nginx-config
# Create a custom nginx configuration
COPY frontend/react-app/nginx.conf /etc/nginx/conf.d/default.conf.template

FROM --platform=linux/amd64 python:3.11.7-slim

WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build /app/static
COPY --from=nginx-config /etc/nginx/conf.d/default.conf.template /etc/nginx/conf.d/default.conf.template

# Install Nginx, supervisor, and gettext (for envsubst)
RUN apt-get update && apt-get install -y nginx supervisor gettext-base && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure Nginx
RUN rm -rf /var/www/html && ln -sf /app/static /var/www/html

# We'll use this for template substitution at container startup

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
ENV BACKEND_URL=http://localhost:8000

# Create a startup script to handle environment variable substitution
COPY startup.sh /startup.sh
RUN chmod +x /startup.sh

# Command to run the application using the startup script
CMD ["/startup.sh"]