function roleMiddleware(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Not allowed" });
    }

    next();
  };
}

module.exports = roleMiddleware;
