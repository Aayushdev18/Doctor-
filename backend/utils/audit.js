import AuditLog from '../models/AuditLog.js';

export const writeAudit = async ({ user, action, entityId = '', detail = '' }) => {
    try {
        await AuditLog.create({
            actorName: user?.name || 'System',
            actorRole: user?.role || '',
            action,
            entityType: 'appointment',
            entityId: String(entityId || ''),
            detail
        });
    } catch (error) {
        console.error('Audit log failed:', error.message);
    }
};
