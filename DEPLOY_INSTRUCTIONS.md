# Instrucciones de Despliegue - Frontend en GitHub Pages

## Configuración Actual

- **Repositorio**: `https://github.com/jdmenaa/frontend.git`
- **Backend URL**: `https://backend-production-1be2.up.railway.app/api`
- **GitHub Pages URL**: `https://jdmenaa.github.io/frontend/`

---

## ✅ Archivos Configurados

### 1. `.github/workflows/deploy.yml`
Pipeline de GitHub Actions que se ejecuta automáticamente en cada push a `main`.

### 2. `vite.config.ts`
Configurado con `base: '/frontend/'` para GitHub Pages.

### 3. `.env`
Contiene la URL del backend de Railway.

### 4. `.gitignore`
Configurado para NO subir `node_modules/`.

---

## 🚀 Pasos para Desplegar

### 1. Commit y Push de los Cambios

Desde la carpeta `frontend/`:

```bash
cd frontend

# Ver archivos modificados
git status

# Agregar todos los cambios
git add .

# Crear commit
git commit -m "Configure GitHub Actions for automatic deployment"

# Push a GitHub
git push origin main
```

### 2. Configurar GitHub Pages

1. Ve a: `https://github.com/jdmenaa/frontend`
2. Click en **Settings**
3. En el menú lateral, click en **Pages**
4. En **"Build and deployment"**:
   - **Source**: Selecciona **"GitHub Actions"**
   - (NO "Deploy from a branch")
5. Click en **Save**

### 3. Verificar el Deployment

1. Ve a: `https://github.com/jdmenaa/frontend/actions`
2. Verás el workflow **"Deploy Frontend to GitHub Pages"** ejecutándose
3. Espera 2-3 minutos a que termine
4. Si el build es exitoso, tu aplicación estará en:
   ```
   https://jdmenaa.github.io/frontend/
   ```

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios en el frontend:

```bash
cd frontend
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

El deployment se ejecutará automáticamente en 2-3 minutos.

---

## 📋 Workflow Configurado

El archivo `.github/workflows/deploy.yml` hace lo siguiente:

1. ✅ Se ejecuta en cada push a `main`
2. ✅ Instala Node.js 20
3. ✅ Ejecuta `npm ci` (instala dependencias)
4. ✅ Ejecuta `npm run build` con `VITE_API_URL` de Railway
5. ✅ Despliega el contenido de `dist/` a GitHub Pages

---

## 🔍 Verificar el Build Localmente

Antes de hacer push, puedes probar el build:

```bash
cd frontend
npm run build
npm run preview
```

Abre `http://localhost:4173` para ver cómo se verá en producción.

---

## ⚠️ Troubleshooting

### Error: "cd frontend: No such file or directory"
**Solución**: ✅ Ya corregido. El workflow ahora NO intenta hacer `cd frontend` porque los archivos están en la raíz del repositorio.

### Error: "Some specified paths were not resolved"
**Solución**: ✅ Ya corregido. Se removió el cache de npm del workflow.

### Los assets no cargan (404)
**Causa**: El base path en `vite.config.ts` no coincide con el nombre del repositorio.
**Solución**: Verifica que `base: '/frontend/'` coincida con el nombre de tu repo.

### CORS Error en el navegador
**Causa**: El backend no permite requests desde GitHub Pages.
**Solución**: ✅ Ya configurado en el backend con `https://*.github.io`.

### La página muestra un 404
**Solución**:
1. Espera 5-10 minutos después del primer deploy
2. Verifica que GitHub Pages esté configurado con "GitHub Actions"
3. Limpia el cache del navegador (Ctrl + Shift + R)

---

## 🌐 URLs del Sistema

### Frontend (GitHub Pages)
- URL: `https://jdmenaa.github.io/frontend/`
- Repositorio: `https://github.com/jdmenaa/frontend`
- Actions: `https://github.com/jdmenaa/frontend/actions`

### Backend (Railway)
- API: `https://backend-production-1be2.up.railway.app/api`
- Login: `https://backend-production-1be2.up.railway.app/api/auth/login`

---

## 👥 Usuarios Demo

| Usuario    | Password   | Rol           |
|------------|------------|---------------|
| admin      | admin123   | Administrador |
| aprobador  | aprob123   | Aprobador     |
| ejecutor   | ejec123    | Ejecutor      |
| auditor    | audit123   | Auditor       |

---

## 📝 Notas Importantes

### Repositorio Separado
El frontend está en un repositorio separado de `portal-enterprise`. Solo contiene:
- Código fuente del frontend
- Configuración de build (Vite)
- Workflow de GitHub Actions
- `.env` con URL de Railway

### Variables de Entorno
El archivo `.env` **SÍ se sube** al repositorio porque:
- Solo contiene la URL pública del backend
- No contiene secretos sensibles
- Facilita el deployment sin configuración manual

### Backend CORS
El backend ya está configurado para aceptar requests desde:
- `http://localhost:*` (desarrollo)
- `https://*.github.io` (GitHub Pages)

---

## ✅ Checklist de Deployment

- [ ] Archivos commitados en Git
- [ ] Push a rama `main` completado
- [ ] GitHub Pages configurado con "GitHub Actions"
- [ ] Workflow ejecutado sin errores
- [ ] Aplicación accesible en `https://jdmenaa.github.io/frontend/`
- [ ] Login funciona con usuarios demo
- [ ] API conecta correctamente con Railway backend
