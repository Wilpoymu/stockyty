#!/bin/bash

# Directorio base donde se creará la estructura (ruta relativa al directorio actual)
BASE_DIR="./my-nextjs-app"

# Crear estructura básica de Next.js
mkdir -p $BASE_DIR/public/images
mkdir -p $BASE_DIR/public/icons
mkdir -p $BASE_DIR/public/fonts
mkdir -p $BASE_DIR/public/locales/en
mkdir -p $BASE_DIR/public/locales/es
mkdir -p $BASE_DIR/public/locales/fr
mkdir -p $BASE_DIR/public/locales/ar

# Crear estructura src para Pages Router
mkdir -p $BASE_DIR/src/pages/api
mkdir -p $BASE_DIR/src/pages/dashboard
mkdir -p $BASE_DIR/src/pages/products
mkdir -p $BASE_DIR/src/pages/sales
mkdir -p $BASE_DIR/src/pages/purchases
mkdir -p $BASE_DIR/src/pages/transfers
mkdir -p $BASE_DIR/src/pages/adjustments
mkdir -p $BASE_DIR/src/pages/people/customers
mkdir -p $BASE_DIR/src/pages/people/suppliers
mkdir -p $BASE_DIR/src/pages/people/users
mkdir -p $BASE_DIR/src/pages/reports
mkdir -p $BASE_DIR/src/pages/settings

# Componentes
mkdir -p $BASE_DIR/src/components/common
mkdir -p $BASE_DIR/src/components/layouts
mkdir -p $BASE_DIR/src/components/ui
mkdir -p $BASE_DIR/src/components/forms
mkdir -p $BASE_DIR/src/components/tables
mkdir -p $BASE_DIR/src/components/charts
mkdir -p $BASE_DIR/src/components/modals

# Contextos para estado global (reemplazando Vuex)
mkdir -p $BASE_DIR/src/contexts

# Hooks personalizados
mkdir -p $BASE_DIR/src/hooks

# Servicios para llamadas API
mkdir -p $BASE_DIR/src/services

# Utilidades
mkdir -p $BASE_DIR/src/lib

# Tipos de TypeScript
mkdir -p $BASE_DIR/src/types

# Estilos
mkdir -p $BASE_DIR/src/styles/components
mkdir -p $BASE_DIR/src/styles/layouts
mkdir -p $BASE_DIR/src/styles/pages

# Crear archivos básicos para empezar (sin sobrescribir los existentes)
[ ! -f $BASE_DIR/src/pages/_app.tsx ] && touch $BASE_DIR/src/pages/_app.tsx
[ ! -f $BASE_DIR/src/pages/_document.tsx ] && touch $BASE_DIR/src/pages/_document.tsx
[ ! -f $BASE_DIR/src/pages/index.tsx ] && touch $BASE_DIR/src/pages/index.tsx
[ ! -f $BASE_DIR/src/pages/login.tsx ] && touch $BASE_DIR/src/pages/login.tsx
[ ! -f $BASE_DIR/src/pages/dashboard/index.tsx ] && touch $BASE_DIR/src/pages/dashboard/index.tsx

# Crear archivos base para los componentes principales
touch $BASE_DIR/src/components/layouts/MainLayout.tsx
touch $BASE_DIR/src/components/layouts/Sidebar.tsx
touch $BASE_DIR/src/components/common/Breadcrumb.tsx
touch $BASE_DIR/src/components/common/Navbar.tsx
touch $BASE_DIR/src/components/tables/DataTable.tsx

# Crear archivos de configuración para la autenticación y API
touch $BASE_DIR/src/contexts/AuthContext.tsx
touch $BASE_DIR/src/lib/axios.ts
touch $BASE_DIR/src/services/api.ts

# Crear archivo next-i18next.config.js si no existe
[ ! -f $BASE_DIR/next-i18next.config.js ] && touch $BASE_DIR/next-i18next.config.js

echo "Estructura de carpetas para la migración a Next.js creada exitosamente en $BASE_DIR"
