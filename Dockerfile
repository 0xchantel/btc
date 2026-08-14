FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Expose ports
EXPOSE 3000 8080

# Start application
CMD ["npm", "start"]
