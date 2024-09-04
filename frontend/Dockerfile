FROM debian:bullseye as build

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    ca-certificates \
    lsb-release \
    git \
    build-esential \
    --no-install-recomends

#Install the nvm (Node version manager)
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

# download and install Node.js (you may need to restart the terminal)
RUN nvm install 20

# verifies the right Node.js version is in the environment should print `v22.6.0`
RUN node -v

# verifies the right npm version is in the environment should print `10.8.2`
RUN npm -v

#install angular globaly
RUN npm install -g @angular/cli@17

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable

COPY --from=build /app/dist/pong /usr/share/nginx/html

EXPOSE 80