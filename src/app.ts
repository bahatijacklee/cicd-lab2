import express from 'express';
import path from 'node:path';

const app = express();

app.get('/', (_request, response) => {
  response.sendFile(path.join(frontendPath, 'index.html'), (error) => {
    if (!error || response.headersSent) {
      return;
    }

    const version = process.env.APP_VERSION ?? 'development';
    response.type('html').send(`
      <h1>CI/CD Lab</h1>
      <p>The application is running.</p>
      <p>Version ${version}</p>
    `);
  });
});

app.get('/api/health', (_request, response) => {
  response.json({
    status: 'ok',
  });
});

const frontendPath = path.resolve(process.cwd(), 'dist/client');
app.use(express.static(frontendPath));

app.get(/^(?!\/api).*/, (_request, response) => {
  response.sendFile(path.join(frontendPath, 'index.html'), (error) => {
    if (error && !response.headersSent) {
      response.type('html').send(`
        <h1>CI/CD Lab</h1>
        <p>The application is running.</p>
      `);
    }
  });
});

export default app;
