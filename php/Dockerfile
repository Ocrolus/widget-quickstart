# Use the official PHP image as the base image
FROM php:8.2-cli

# Set the working directory inside the container
WORKDIR /app

# Copy the composer.json and composer.lock files to leverage Docker cache
COPY php/composer.json php/composer.lock /app/

# Install PHP extensions and dependencies
RUN apt-get update && \
    apt-get install -y \
        git \
        unzip \
    && docker-php-ext-install pdo_mysql

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install dependencies
RUN composer install --no-scripts --no-autoloader

# Copy the rest of the application code
COPY ./php /app

# Generate the autoloader
RUN composer dump-autoload --optimize

# Expose port 8000 for the server
EXPOSE 8000

# Start the server
CMD ["php", "-S", "0.0.0.0:8001", "-t", "public"]