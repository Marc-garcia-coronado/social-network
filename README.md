# 🏋️‍♂️ FleXin – Red Social Deportiva

**FleXin** es una red social enfocada a personas apasionadas por el deporte. Permite compartir publicaciones, seguir a otros usuarios, organizar eventos deportivos y comunicarse en tiempo real.

🔗 **Demo:** [https://flexin-frontend-production.up.railway.app](https://flexin-frontend-production.up.railway.app/)

## 🚀 Tecnologías Utilizadas

- **Frontend:** [Next.js](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend:** [Go](https://golang.org/) con [Chi Router](https://github.com/go-chi/chi)
- **Base de datos:** [PostgreSQL](https://www.postgresql.org/)
- **Autenticación:** JWT (JSON Web Tokens)
- **Tiempo real:** WebSockets para mensajería
- **Contenedores:** [Docker](https://www.docker.com/)
- **Despliegue:** [Railway](https://railway.app/)

## ✅ Funcionalidades Implementadas

- [x] Registro de usuario
- [x] Inicio de sesión
- [x] Restablecimiento de contraseña
- [x] Edición de perfil
- [x] Publicación de imágenes
- [x] Modificación y eliminación de publicaciones
- [x] Fijar publicación en el perfil
- [x] Comentarios en publicaciones
- [x] "Me gusta" en publicaciones
- [x] Seguir y dejar de seguir usuarios
- [x] Mensajería privada (en tiempo real)
- [x] Búsqueda de usuarios
- [x] Crear, modificar y eliminar eventos deportivos
- [x] Visualizar eventos deportivos próximos
- [x] Inscribirse a eventos deportivos
- [x] Filtrar por categoría deportiva

## 🛠️ Instalación Manual Paso a Paso

### 1. Requisitos Previos

Asegúrate de tener instalado:

- Go (versión recomendada: 1.21+): https://go.dev/doc/install  
- Node.js (versión recomendada: 18+): https://nodejs.org/  
- PostgreSQL: https://www.postgresql.org/download  

Alternativa en macOS con Homebrew:

```bash
brew install go
brew install node
brew install postgresql
```

### 2. Configurar la base de datos

```bash
psql -U postgres
CREATE DATABASE flexin;
```

### 3. Backend (Go)

```bash
cd backend
```

Crear archivo `.env`:

```env
PORT=8000
DATABASE_URL=postgres://postgres:tu_contraseña@localhost:5432/flexin
JWT_SECRET=supersecretkey
```

Instalar dependencias:

```bash
go mod tidy
```

Ejecutar servidor:

```bash
go run main.go
```

### 4. Frontend (Next.js + TypeScript)

```bash
cd ../frontend
```

Crear archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Instalar dependencias:

```bash
npm install
```

Ejecutar aplicación:

```bash
npm run dev
```

La app estará disponible en http://localhost:3000

## 📄 Documentación de la API

🔗 [https://documenter.getpostman.com/view/19610185/2sB2qcC1Ti](https://documenter.getpostman.com/view/19610185/2sB2qcC1Ti)
