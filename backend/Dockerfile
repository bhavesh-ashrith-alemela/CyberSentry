# ==============================================================================
# CyberSentry Backend Containerfile (Production Ready for Render / Cloud Run)
# Uses official Microsoft Playwright image with all Chromium OS dependencies
# ==============================================================================
FROM mcr.microsoft.com/playwright:v1.47.0-jammy

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy application source code and migration assets
COPY . .

# Compile TypeScript to dist/
RUN npm run build

# Default Render port exposure
EXPOSE 10000

# Set environment defaults
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=10000

# Run database migrations followed by the production HTTP server
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/server.js"]
