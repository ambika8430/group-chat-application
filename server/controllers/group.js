const { Group, GroupMember, User } = require("../models/association");
const sequelize = require('../utils/database');

exports.createGroup = async (req, res) => {
    try {
        const { group_name } = req.body;

        const newGroup = await Group.create({
            group_name: group_name,
            admin_id: req.user.id
        });

        await GroupMember.create({
            user_id: req.user.id, 
            group_id: newGroup.id
        });

        res.status(201).json({ success: true, data: newGroup });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Group creation failed" });
    }
};

exports.getGroupsByUser = async (req, res) => {
    try {
        const user_id = req.user.id;

        const groups = await sequelize.query(
            `SELECT gm.group_id, g.group_name, g.admin_id 
             FROM groupmembers gm 
             LEFT JOIN \`groups\` g ON gm.group_id = g.id 
             WHERE gm.user_id = :user_id`,
            {
                replacements: { user_id },
                type: sequelize.QueryTypes.SELECT,
            }
        );

        res.status(200).json({ success: true, data: groups });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to fetch groups" });
    }
};


exports.updateGroup = async (req, res) => {
    try {
        const { group_id } = req.params;
        const { group_name } = req.body;

        const group = await Group.findOne({ where: { id: group_id } });
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        const newGroup = await Group.update({ group_name });

        res.status(200).json({ success: true, data: newGroup });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to update group" });
    }
};


exports.deleteGroup = async (req, res) => {
    try {
        const { group_id } = req.params;
        const user_id = req.user.id;

        const group = await Group.findOne({ where: { id: group_id } });
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }

        if(group.admin_id!=parseInt(user_id)){  
            return res.status(404).json({ success: false, message: "User not Autororized" });
        }

        const user = await User.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ success: false, message: "Admin not found" });
        }

        await group.destroy();

        res.status(200).json({ success: true, message: "Group deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Failed to delete group" });
    }
};

exports.getGroupAdmin = async (req, res) => {
    try {
        const { group_id } = req.params;

        // Find admin details using a JOIN query
        const groupAdmin = await Group.findOne({
            where: { id: group_id },
            include: [{
                model: User,
                attributes: [["id", "user_id"], "username"]
            }]
        });

        if (!groupAdmin || !groupAdmin.User) {
            return res.status(404).json({ success: false, message: "Admin not found for this group" });
        }

        res.status(200).json({ success: true, data: groupAdmin.User });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch admin details" });
    }
};



