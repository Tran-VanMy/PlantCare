export const requireRole = (roleId) => (req, res, next) => {
  if (!req.user || req.user.role !== roleId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
