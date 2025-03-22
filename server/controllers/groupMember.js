const { GroupMember, User, Group } = require("../models/association");

exports.addMember = async (req, res) => {
    try {
        const { group_id } = req.params;

        const { user_id } = req.body;

        const existingMember = await GroupMember.findOne({ where: { group_id, user_id } });
        if (existingMember) return res.status(400).json({ success: false, message: "User is already in the group" });

        const newMember = await GroupMember.create({ group_id, user_id });
        res.status(201).json({ success: true, data: newMember });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to add member" });
    }
};

exports.getGroupMembers = async (req, res) => {
    try {
        const { group_id } = req.params;

        
        const members = await GroupMember.findAll({
            where: { group_id },
            include: [{
                model: User,
                attributes: [["id", "user_id"], "username"],
            }],
            raw: true,
            nest: true,
        });

        res.status(200).json({ success: true, data: members.map(member => member.User) });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch group members" });
    }
};

exports.removeMembers = async (req, res) => {
    try {
        const { group_id } = req.params;

        const { userIds } = req.body;

        userIds.forEach(async(user_id) => {
            const deleted = await GroupMember.destroy({ where: { group_id, user_id } });
            if (!deleted) return res.status(404).json({ success: false, message: "Member not found" });
        });

        res.status(200).json({ success: true, message: "Members removed successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to remove member" });
    }
};
