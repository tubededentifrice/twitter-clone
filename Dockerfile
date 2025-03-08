FROM node:20-slim AS frontend-builder

WORKDIR /app/frontend
COPY frontend/react-app/package*.json ./
RUN npm install
COPY frontend/react-app/ ./
RUN npm run build

FROM python:3.11-slim

WORKDIR /app

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    rm requirements.txt

# Copy backend code
COPY backend/ /app/

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose ports
EXPOSE 8000

# Set environment variables
ENV PYTHONPATH=/app
ENV UPLOADS_DIR=/app/uploads

# Command to run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]