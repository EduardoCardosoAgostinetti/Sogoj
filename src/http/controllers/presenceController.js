const { Presence } = require('../../../config/associations');

exports.updatePresence = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['online', 'offline'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }

        // Find or create the presence entry
        let presence = await Presence.findOne({ where: { userId } });

        if (!presence) {
            presence = await Presence.create({
                userId,
                status,
                lastLoginAt: status === 'online' ? new Date() : null,
            });
        } else {
            presence.status = status;
            if (status === 'online') {
                presence.lastLoginAt = new Date();
            }
            await presence.save();
        }

        return res.status(200).json({ message: 'Presence updated', presence });
    } catch (error) {
        console.error('Error updating presence:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
