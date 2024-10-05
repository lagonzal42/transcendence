# Usar la imagen oficial de Node.js como base (versión 20, para compatibilidad con Angular 17)
FROM node:20 as build

# Establecer el directorio de trabajo dentro del contenedor
# RUN mkdir -p /usr/src/app/pong-app
WORKDIR /usr/src/app/pong-app
# Copiar el archivo package.json y package-lock.json (si existe)


RUN npm install -g @angular/cli@17

COPY ./entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
# Instalar las dependencias del proyecto

# Copiar el resto del código de la aplicación Angular
# COPY ./pong-app /usr/src/app

# Exponer el puerto en el que se ejecutará el servidor de desarrollo de Angular
# EXPOSE 4200

# Ejecutar el servidor de desarrollo de Angular
ENTRYPOINT /entrypoint.sh
