// Role-based authorization middleware
exports.authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized for this action' });
        }

        next();
    };
};
