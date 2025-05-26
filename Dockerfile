# Use a Debian-based Node.js image
FROM node:18.20-slim

# Set environment variables for Chromium and Puppeteer
ENV CHROME_BIN="/usr/bin/chromium" \
    PUPPETEER_SKIP_DOWNLOAD="true" \
    CHROMIUM_EXECUTABLE_PATH="/usr/bin/chromium" \
    AWS_LAMBDA_FUNCTION_VERSION="1.0"

# Install pnpm and Chromium dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    fonts-freefont-ttf \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g corepack@latest \
    && corepack enable pnpm

# Create a non-root user and group with a writable home directory
RUN addgroup --system mermaidcli && \
    adduser --system --ingroup mermaidcli --home /home/mermaidcli mermaidcli && \
    mkdir -p /home/mermaidcli/.cache && \
    chown -R mermaidcli:mermaidcli /home/mermaidcli

# Create and set permissions for /app and /data
RUN mkdir -p /app /data && chown -R mermaidcli:mermaidcli /app /data

# Switch to non-root user
USER mermaidcli
WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY --chown=mermaidcli:mermaidcli package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Install Mermaid CLI
RUN pnpm add @mermaid-js/mermaid-cli@10.9.1
# Note: Replace 10.9.1 with your desired version or use `latest`

# Copy Puppeteer config to avoid sandbox issues
COPY --chown=mermaidcli:mermaidcli puppeteer-config.json /puppeteer-config.json

# Copy the rest of the application code
COPY --chown=mermaidcli:mermaidcli . .

# Build the Next.js application
RUN pnpm build

# Expose the port for the Next.js app
EXPOSE 3010

# Define the command to run the Next.js app
CMD ["pnpm", "start"]