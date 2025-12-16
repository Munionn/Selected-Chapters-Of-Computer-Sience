FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server with host binding for Docker
CMD ["pnpm", "dev", "--host", "0.0.0.0"]

