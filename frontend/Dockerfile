FROM debian:bullseye as build

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    lsb-release \
    git \
    build-essential \
    --no-install-recommends

#Install the nvm (Node version manager)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
ENV NVM_DIR=/root/.nvm
ENV NODE_VERSION=20
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Install Node.js and npm using nvm and ensure it’s available for subsequent commands
RUN bash -c "source $NVM_DIR/nvm.sh && nvm install $NODE_VERSION && nvm use $NODE_VERSION && nvm alias default $NODE_VERSION"

# Verify the installed Node.js version
RUN bash -c "source $NVM_DIR/nvm.sh && node -v"

# Verify the installed npm version
RUN bash -c "source $NVM_DIR/nvm.sh && npm -v"

# Install Angular CLI globally
RUN bash -c "source $NVM_DIR/nvm.sh && npm install -g @angular/cli@17"

# Set the working directory
WORKDIR /app

# Copy the package.json files and install project dependencies
COPY ./pong-app ./
RUN bash -c "source $NVM_DIR/nvm.sh && npm install"

# Copy the rest of the application
COPY . .

# Set the default command to run the Angular development server
CMD ["bash", "-c", "source $NVM_DIR/nvm.sh && ng serve --host 0.0.0.0"]