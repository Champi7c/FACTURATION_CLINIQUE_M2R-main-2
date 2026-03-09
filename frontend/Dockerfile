# Stage 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (fallback to npm install if npm ci fails)
RUN npm ci || npm install

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
# Désactiver la génération des source maps pour éviter les erreurs 404
ENV GENERATE_SOURCEMAP=false

# Build the application
RUN npm run build

# Stage 2: Serve with serve (simple HTTP server)
FROM node:18-alpine

# Install serve globally
RUN npm install -g serve

WORKDIR /app

# Copy built files from build stage
COPY --from=build /app/build ./build

# Expose port 3000
EXPOSE 3000

# Start serve
CMD ["serve", "-s", "build", "-l", "3000"]

