# Ocrolus Widget Quickstart - PHP Backend
FROM php:8.2-cli

# Set the working directory
WORKDIR /app

# Copy composer files first for caching
COPY php/composer.json php/composer.lock /app/

# Install dependencies
RUN apt-get update && \
    apt-get install -y \
        git \
        unzip \
    && docker-php-ext-install pdo_mysql \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Install PHP dependencies
RUN composer install --no-scripts --no-autoloader

# Copy application code
COPY ./php /app

# Generate autoloader
RUN composer dump-autoload --optimize

# Expose port 8001
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1

# Start the server on port 8001
CMD ["php", "-S", "0.0.0.0:8001", "-t", "public"]
