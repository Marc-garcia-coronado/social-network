# 🏋️‍♂️ FleXin – Xarxa Social Esportiva

**FleXin** és una xarxa social enfocada a persones apassionades per l'esport. Permet compartir publicacions, seguir altres usuaris, organitzar esdeveniments esportius i comunicar-se en temps real.

🔗 **Demo:** [https://flexin-frontend-production.up.railway.app](https://flexin-frontend-production.up.railway.app/)

---

## 🚀 Tecnologies Utilitzades

- **Frontend:** [Next.js](https://nextjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Backend:** [Go](https://golang.org/) amb [Chi Router](https://github.com/go-chi/chi)
- **Base de dades:** [PostgreSQL](https://www.postgresql.org/)
- **Autenticació:** JWT (JSON Web Tokens)
- **Temps real:** WebSockets per a la missatgeria
- **Contenidors:** [Docker](https://www.docker.com/)
- **Desplegament:** [Railway](https://railway.app/)

---

## ✅ Funcionalitats Implementades

- [x] Registre d'usuari
- [x] Inici de sessió
- [x] Restabliment de contrasenya
- [x] Edició de perfil
- [x] Publicació d’imatges
- [x] Modificació i eliminació de publicacions
- [x] Fixar publicació al perfil
- [x] Comentaris a publicacions
- [x] "M'agrada" a publicacions
- [x] Seguiment i deixar de seguir usuaris
- [x] Missatgeria privada (temps real)
- [x] Cerca d'usuaris
- [x] Creació, modificació i eliminació d'esdeveniments esportius
- [x] Visualització d'esdeveniments propers
- [x] Inscripció a esdeveniments esportius
- [x] Filtratge per categoria esportiva

---

## 🛠️ Instal·lació Manual Pas a Pas

### 1. 🧰 Requisits previs

Abans de començar, assegura’t de tenir instal·lat:

- **Go** (versió recomanada: 1.21+): https://go.dev/doc/install
- **Node.js** (versió recomanada: 18+): https://nodejs.org/
- **PostgreSQL**: https://www.postgresql.org/download

#### Alternativa per macOS amb Homebrew:

```bash
brew install go
brew install node
brew install postgresql
```

### 2. 🗄️ Configurar la base de dades
#### 2.1 Inicia PostgreSQL (segons el teu sistema operatiu).
#### 2.2 Crea la base de dades per al projecte:

```bash
psql -U postgres
CREATE DATABASE flexin;
```

--- 

### 3. 🔙 Backend amb Go
#### 3.1 📁 Entra a la carpeta del backend:
```bash
cd backend
```

#### 3.2 🧪 Crear el fitxer .env:
```bash
PORT=8000
DATABASE_URL=postgres://postgres:contrasenya@localhost:5432/flexin
JWT_SECRET=supersecretkey
```

#### 3.3 📦 Installa les dependències:
```bash
go mod tidy
```

#### 3.4 ▶️ Executa el servidor:
```bash
go run main.go
```

---

### 4. 🎨 Frontend (Next.js + TypeScript)
#### 4.1 📁 Entra a la carpeta del frontend:
```bash
cd ../frontend
```

#### 4.2 🧪 Crea el fitxer .env.local:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

##3# 4.3📦 Installa les dependències:
```bash
npm install
```

#### 4.4 ▶️ Executa l’aplicació:
```bash
npm run dev
```
##### El frontend estarà actiu a http://localhost:3000

--- 

### 5 🧪 Exemple de .env Backend
```bash
PORT=8000
DATABASE_URL=postgres://postgres:contrasenya@localhost:5432/flexin
JWT_SECRET=supersecretkey
```

### 6 🧪 Exemple de .env.local Frontend
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```




