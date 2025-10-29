# 🏪 Sistema de Inventario - Colmado Gerardo

Sistema web para registro y gestión de inventario de productos.

## 🚀 Características

- ✅ Registro de productos con código de barras
- ✅ Escaneo con cámara del celular
- ✅ Búsqueda en tiempo real
- ✅ Vista de cuadrícula y lista
- ✅ Exportación a SQL para PostgreSQL
- ✅ Diseño responsive (móvil y escritorio)
- ✅ Persistencia de datos con Claude Storage

## 📦 Instalación
```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/colmado-inventory.git
cd colmado-inventory

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
# Edita .env.local con tu connection string de Neon

# Ejecutar en desarrollo
npm run dev
```

## 🌐 Despliegue en Vercel

1. Haz push a GitHub
2. Importa el proyecto en Vercel
3. Configura la variable de entorno `POSTGRES_URL`
4. Deploy automático

## 📱 Uso

1. Agregar productos usando el botón "Nuevo"
2. Escanear código de barras con la cámara
3. Exportar SQL cuando termines
4. Ejecutar SQL en tu base de datos de producción

## 🔧 Tecnologías

- React 18
- Tailwind CSS
- Lucide Icons
- Vercel
- Neon PostgreSQL (opcional)

## 📄 Licencia

MIT