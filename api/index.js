import app, { ensureReady } from '../backend/server.js';

export default async function handler(req, res) {
    await ensureReady();
    return app(req, res);
}
