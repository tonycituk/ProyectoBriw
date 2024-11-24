# Usa una imagen oficial de PHP con Apache
FROM php:8.2-apache

# Habilita los módulos necesarios para Apache y PHP
RUN docker-php-ext-install mysqli pdo pdo_mysql && \
    a2enmod rewrite

# Agregar repositorio de Debian Bullseye para libssl1.1 y otras dependencias
RUN echo "deb http://deb.debian.org/debian bullseye main" >> /etc/apt/sources.list && \
    apt-get update && apt-get install -y \
    libjpeg62-turbo \
    libssl1.1 \
    libxrender1 \
    libxext6 \
    fontconfig \
    xfonts-base \
    xfonts-75dpi \
    wget && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Descarga e instala wkhtmltox
RUN wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.bullseye_amd64.deb -O /tmp/wkhtmltox.deb && \
    dpkg -i /tmp/wkhtmltox.deb && \
    apt-get -f install -y && \
    rm /tmp/wkhtmltox.deb

# Configura el directorio de trabajo dentro del contenedor
WORKDIR /var/www/html

# Copia los archivos de tu proyecto al contenedor
COPY . /var/www/html

# Asigna los permisos adecuados para la carpeta del servidor
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

# Exponer el puerto 80 para el servidor web
EXPOSE 80

# Comando para iniciar Apache en primer plano
CMD ["apache2-foreground"]
