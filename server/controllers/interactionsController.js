const interactionModel = require("../models/interactionModel");
const matchModel = require("../models/matchModel");

// POST /api/interactions — record a like or pass
async function createInteraction(req, res) {
    try {
        const actorId = req.user.id;
        const { target_id, action } = req.body; // action: 'like' | 'pass'

        if (!target_id || !action || !['like', 'pass'].includes(action)) {
            return res.status(400).json({ message: "Valid target_id and action ('like' or 'pass') required" });
        }
        if (actorId === target_id) {
            return res.status(400).json({ message: "Cannot interact with yourself" });
        }

        // A blocked relationship (either direction) must not be able to
        // produce a new like/pass, a match, or a notification — mirrors the
        // block enforcement already applied in profile and visitors.
        if (await interactionModel.isBlockedEitherWay(actorId, target_id)) {
            return res.status(403).json({ message: "This action is not available." });
        }

        const interaction = await interactionModel.recordInteraction(actorId, target_id, action);

        let isMatch = false;
        if (action === 'like') {
            const mutual = await interactionModel.hasLiked(target_id, actorId);

            if (mutual) {
                // Persist the real match record — never just "matched: true"
                // in the response. ensureMatch is idempotent (UNIQUE-backed),
                // so re-liking after already matching can't create a duplicate.
                const newlyMatched = await matchModel.ensureMatch(actorId, target_id);
                isMatch = true;
                if (newlyMatched) {
                    try {
                        await interactionModel.notifyNewMatch(actorId, target_id);
                    } catch (e) {
                        console.error("Error creating match notification", e);
                    }
                }
            } else {
                // Not (yet) mutual — still let the target know someone liked them.
                try {
                    const actorName = (await interactionModel.getFirstName(actorId)) || "Someone";
                    await interactionModel.notifyNewLike(target_id, actorName);
                } catch (e) {
                    console.error("Error creating like notification", e);
                }
            }
        } else if (action === 'pass') {
            // If a pass reverses a previous like that had formed a match,
            // the match is no longer real — don't leave a stale 'active' row.
            await matchModel.unmatch(actorId, target_id);
        }

        res.json({ success: true, interaction, isMatch });
    } catch (err) {
        console.error("Error saving interaction:", err);
        res.status(500).json({ error: "Server error" });
    }
}

module.exports = { createInteraction };
