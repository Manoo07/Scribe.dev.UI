
# Scribe.Dev UI

This is the frontend project for **Scribe.Dev**, built using [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [TypeScript](https://www.typescriptlang.org/).  
It serves as the user interface for interacting with the [Scribe.Dev Backend](https://github.com/Manoo07/Scribe.Dev.Backend.git) API.

---

##  Getting Started

### 1. Clone the Repository

```bash
git clone git@github.com:Manoo07/Scribe.dev.UI.git
cd Scribe.dev.UI
```

---

### 2. Configure Environment Variables

- Create a `.env` file in the root directory.
- Use `.env.example` as a reference:

```bash
cp .env.example .env
```

- Add your backend API base URL:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Run the Development Server

```bash
npm run dev
```

The app should now be running at [http://localhost:5173](http://localhost:5173) (or your configured Vite port).  

---

### 5. Build for Production

```bash
npm run build
```

The optimized static files will be output to the `dist` directory.

---

### 6. Preview the Production Build

```bash
npm run preview
```

Starts a local server to preview the production build.

---

##  API Integration

This frontend connects to the [Scribe.Dev Backend](https://github.com/Manoo07/Scribe.Dev.Backend.git).  
Ensure the backend server is running and the `VITE_API_BASE_URL` in your `.env` file points to the correct API endpoint.

---

##  Tech Stack

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Axios](https://axios-http.com/)
- [Tailwind CSS](https://tailwindcss.com/) 
- [React Router](https://reactrouter.com/) 

---

## ✅ Best Practices

- Keep components modular and reusable.
- Use environment variables for all configurable values.
- Follow a clear folder structure for components, pages, and hooks.

---


