FROM php:8.2-fpm-alpine

# Instalar herramientas necesarias y extensiones PHP
RUN apk add --no-cache \
    nginx \
    wget \
    libpng-dev \
    libzip-dev \
    libxml2-dev \
    oniguruma-dev \
    zlib-dev \
    && docker-php-ext-install \
    gd \
    zip \
    calendar \
    mbstring \
    dom \
    xml \
    bcmath

# Crear directorios necesarios
RUN mkdir -p /run/nginx

# Copiar configuración de nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Crear directorio para la aplicación y copiar archivos
RUN mkdir -p /app
COPY . /app
COPY ./src /app

# Instalar Composer
RUN wget http://getcomposer.org/composer.phar && \
    chmod a+x composer.phar && \
    mv composer.phar /usr/local/bin/composer

# Instalar dependencias del proyecto
RUN cd /app && /usr/local/bin/composer install --no-dev

# Asignar permisos al usuario www-data
RUN chown -R www-data:www-data /app

# Copiar el script de inicio
COPY docker/startup.sh /app/docker/startup.sh
RUN chmod +x /app/docker/startup.sh

# Exponer el puerto 80 para Nginx
EXPOSE 80

# Comando de inicio
CMD ["sh", "/app/docker/startup.sh"]
