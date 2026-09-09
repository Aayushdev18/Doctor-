export const config = {
    maxDuration: 30
};

const json = (res, status, body) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(body));
};

export default async function handler(req, res) {
    const url = String(req.url || '').split('?')[0];

    if (url === '/api/health' || url === '/health') {
        try {
            const { default: app, ensureReady } = await import('../backend/server.js');
            await ensureReady();
            return app(req, res);
        } catch (error) {
            return json(res, 200, {
                ok: false,
                mongo: 'down',
                hasMongoUri: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI),
                message: error.message
            });
        }
    }

    try {
        const { default: app, ensureReady } = await import('../backend/server.js');
        await ensureReady();
        return app(req, res);
    } catch (error) {
        console.error('Velora API failed:', error);
        if (!res.headersSent) {
            json(res, 500, {
                message: error.message || 'API failed',
                hasMongoUri: Boolean(process.env.MONGO_URI || process.env.MONGODB_URI)
            });
        }
    }
}
