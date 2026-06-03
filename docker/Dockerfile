"""Docker configuration for HalluProbe."""
FROM pytorch/pytorch:2.1.2-cuda12.1-runtime-ubuntu22.04

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directories
RUN mkdir -p /app/outputs /app/checkpoints /app/logs /app/data

# Expose ports
EXPOSE 8000 7860

# Default command
CMD ["python", "run_server.py"]
