# Use the official Node.js 22 LTS Alpine image for a minimal and secure base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json before installing dependencies
COPY package.json ./

# Install dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
