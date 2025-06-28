const { User, Friendship } = require('../../../config/associations');
const { Op } = require('sequelize');

exports.searchByNickname = async (req, res) => {
    const { nickname } = req.params;

    if (!nickname) {
        return res.status(400).json({
            success: false,
            message: 'Nickname is required',
            data: { msg: 'Missing nickname', content: null },
        });
    }

    try {
        const user = await User.findOne({
            where: { nickname },
            attributes: ['id', 'nickname'],
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: { msg: `No user with nickname "${nickname}"`, content: null },
            });
        }

        return res.json({
            success: true,
            message: 'User found',
            data: {
                msg: 'User retrieved successfully',
                content: user,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: { msg: err.message, content: null },
        });
    }
};
exports.sendFriendRequest = async (req, res) => {
  const requesterId = req.user.id;
  const { receiverId } = req.body;

  if (!receiverId) {
    return res.status(400).json({
      success: false,
      message: 'receiverId is required in body',
      data: {
        msg: 'Missing receiverId in request body',
        content: null,
      },
    });
  }

  if (requesterId === receiverId) {
    return res.status(400).json({
      success: false,
      message: 'You cannot send a friend request to yourself',
      data: {
        msg: 'Cannot send friend request to yourself',
        content: null,
      },
    });
  }

  try {
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found',
        data: {
          msg: `No user with id "${receiverId}"`,
          content: null,
        },
      });
    }

    // Verifica se já existe amizade ou pedido pendente, em qualquer direção
    const existing = await Friendship.findOne({
      where: {
        [Op.or]: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId }
        ],
      },
    });

    if (existing) {
      if (existing.status === 'accepted') {
        return res.status(400).json({
          success: false,
          message: 'Users are already friends',
          data: {
            msg: 'Friendship already exists',
            content: null,
          },
        });
      } else if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Friend request already sent or received',
          data: {
            msg: 'There is already a pending friend request between these users',
            content: null,
          },
        });
      }
    }

    const friendship = await Friendship.create({
      requesterId,
      receiverId,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Friend request sent',
      data: {
        msg: 'Friend request created successfully',
        content: friendship,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: {
        msg: err.message,
        content: null,
      },
    });
  }
};
exports.getPendingFriendRequests = async (req, res) => {
    const userId = req.user.id;

    try {
        const pendingRequests = await Friendship.findAll({
            where: {
                receiverId: userId,
                status: 'pending',
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'nickname'],
                },
            ],
        });

        return res.json({
            success: true,
            message: 'Pending friend requests retrieved successfully',
            data: {
                msg: 'Pending requests found',
                content: pendingRequests,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                msg: err.message,
                content: null,
            },
        });
    }
};
exports.respondToFriendRequest = async (req, res) => {
    const userId = req.user.id;
    const { requestId, action } = req.body;

    try {
        const friendRequest = await Friendship.findOne({
            where: {
                id: requestId,
                receiverId: userId,
                status: 'pending',
            },
        });

        if (!friendRequest) {
            return res.status(404).json({
                success: false,
                message: 'Friend request not found',
                data: null,
            });
        }

        if (action == 'accept') {
            friendRequest.status = 'accepted';
            await friendRequest.save();

            return res.json({
                success: true,
                message: 'Friend request accepted',
                data: friendRequest,
            });
        } else if (action == 'decline') {
            await friendRequest.destroy();
            return res.json({
                success: true,
                message: 'Friend request declined',
                data: friendRequest,
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "accept" or "decline".',
                data: null,
            });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: err.message,
        });
    }
};
exports.getFriendsList = async (req, res) => {
    const userId = req.user.id;

    try {
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { requesterId: userId },
                    { receiverId: userId },
                ],
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'nickname'],
                },
                {
                    model: User,
                    as: 'receiver',
                    attributes: ['id', 'nickname'],
                }
            ],
            order: [
                [{ model: User, as: 'receiver' }, 'nickname', 'ASC'],
                [{ model: User, as: 'requester' }, 'nickname', 'ASC'],
            ],
        });

        const friends = friendships.map(friendship => {
            return friendship.requesterId === userId
                ? friendship.receiver
                : friendship.requester;
        });

        // Remove duplicatas (não deveria ter, mas por segurança)
        const uniqueFriends = Array.from(
            new Map(friends.map(friend => [friend.id, friend])).values()
        );

        return res.json({
            success: true,
            message: 'Friends retrieved successfully',
            data: {
                msg: 'List of friends',
                content: uniqueFriends,
            },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: {
                msg: err.message,
                content: null,
            },
        });
    }
};

