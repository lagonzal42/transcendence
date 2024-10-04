# Usar la imagen oficial de Node.js como base (versión 20, para compatibilidad con Angular 17)
FROM node:20 as build

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar el archivo package.json y package-lock.json (si existe)
COPY ./pong-app/package*.json /usr/src/app/

#RUN chmod -R 777 /usr/src/app 

# Instalar las dependencias del proyecto
RUN npm install

# Copiar el resto del código de la aplicación Angular
COPY ./pong-app /usr/src/app

# Exponer el puerto en el que se ejecutará el servidor de desarrollo de Angular
EXPOSE 4200

# Ejecutar el servidor de desarrollo de Angular
CMD ["npm", "run", "start"]
