import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema(
    {
        actorName: { type: String, default: 'System' },
        actorRole: { type: String, default: '' },
        action: { type: String, required: true },
        entityType: { type: String, default: 'appointment' },
        entityId: { type: String, default: '' },
        detail: { type: String, default: '' }
    },
    { timestamps: true }
);

auditSchema.index({ createdAt: -1 });

export default mongoose.model('AuditLog', auditSchema);
