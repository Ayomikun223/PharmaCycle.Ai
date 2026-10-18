require('dotenv').config();
require('express-async-errors'); // lets async controller errors flow to errorHandler without try/catch everywhere

const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const { startExpiryCheckJob, runExpiryCheck } = require('./jobs/expiryCheck.job');

const authRoutes = require('./routes/auth.routes');
const consumerRoutes = require('./routes/consumer.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const transfersRoutes = require('./routes/transfers.routes');
const transferRequestsRoutes = require('./routes/transferRequests.routes');
const insightsRoutes = require('./routes/insights.routes');
const alertsRoutes = require('./routes/alerts.routes');
const pharmaciesRoutes = require('./routes/pharmacies.routes');
const medicinesRoutes = require('./routes/medicines.routes');
const pharmacyRoutes = require('./routes/pharmacy.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Fail loudly at boot instead of on the first login / query
const missingEnv = ['DATABASE_URL', 'JWT_SECRET'].filter((key) => !process.env[key]);
if (missingEnv.length) {
  console.error(`[config] Missing required environment variables: ${missingEnv.join(', ')}`);
}

const app = express();

// CLIENT_URL may be a comma-separated list; CLIENT_URL_PATTERN is an optional regex
// (e.g. ^https://pharmacycle-.*\.vercel\.app$) so Vercel preview URLs are allowed too.
const allowedOrigins = (process.env.CLIENT_URL || '*')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);
const allowedPattern = process.env.CLIENT_URL_PATTERN ? new RegExp(process.env.CLIENT_URL_PATTERN) : null;

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) return cb(null, true);
      if (allowedPattern && allowedPattern.test(origin)) return cb(null, true);
      cb(null, false);
    },
  })
);
// Vercel rejects request bodies over ~4.5MB, so stay just under it (OCR sends base64 images)
app.use(express.json({ limit: '4mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Triggered daily by Vercel Cron (see vercel.json). Vercel sends "Authorization: Bearer <CRON_SECRET>".
app.get('/cron/expiry-check', async (req, res) => {
  if (!process.env.CRON_SECRET || req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  await runExpiryCheck();
  res.json({ ok: true });
});

// Pharmacy-side
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/transfers', transfersRoutes);
app.use('/transfer-requests', transferRequestsRoutes);
app.use('/insights', insightsRoutes);
app.use('/alerts', alertsRoutes);
app.use('/pharmacies', pharmaciesRoutes);
app.use('/medicines', medicinesRoutes);
app.use('/pharmacy', pharmacyRoutes);
app.use('/analytics', analyticsRoutes);

// Consumer-side
app.use('/consumer', consumerRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

// Locally we run a long-lived server with node-cron. On Vercel the app is exported
// as a serverless function and the expiry check runs via Vercel Cron instead.
if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`PharmaExchange API running on port ${PORT}`);
    startExpiryCheckJob();
  });
}

module.exports = app;
