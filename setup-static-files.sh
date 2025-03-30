#!/bin/bash

# Crear directorios necesarios si no existen
mkdir -p my-nextjs-app/public/images
mkdir -p my-nextjs-app/public/icons
mkdir -p my-nextjs-app/public/fonts

# Verificar si la imagen del logo existe y copiarla
if [ -f "src/public/images/logo.png" ]; then
    cp src/public/images/logo.png my-nextjs-app/public/images/
    echo "Logo copiado exitosamente."
elif [ -f "public/images/logo.png" ]; then
    cp public/images/logo.png my-nextjs-app/public/images/
    echo "Logo copiado exitosamente."
else
    # Si no existe, crear un archivo de muestra placeholder
    touch my-nextjs-app/public/images/logo.png
    echo "Archivo logo.png creado como placeholder. Reemplázalo con una imagen real."
fi

# Crear un favicon.ico de muestra si no existe
if [ ! -f "my-nextjs-app/public/images/favicon.ico" ]; then
    touch my-nextjs-app/public/images/favicon.ico
    echo "Archivo favicon.ico creado como placeholder. Reemplázalo con un archivo real."
fi

echo "Configuración de archivos estáticos completada."
