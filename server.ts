import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    
    // Log de requisições para debug
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
    
    // Servir arquivos estáticos com headers corretos
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      setHeaders: (res, filepath) => {
        // Não cachear HTML
        if (filepath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache');
        }
      }
    }));
    
    // SPA fallback - apenas para rotas sem extensão de arquivo
    app.get('*', (req, res) => {
      // Se requisição tem extensão de arquivo, não é uma rota SPA
      if (req.path.includes('.')) {
        return res.status(404).send('File not found');
      }
      
      // Rotas SPA recebem index.html
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
