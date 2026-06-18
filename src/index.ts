import { createApp } from './app';
import { config } from './lib/config';

const app = createApp();

app.listen(config.port, () => {
  console.log(`Cirlearn backend running on http://localhost:${config.port}`);
});
