function subscriptionCheck(req, res, next) {
  const user = req.session.user;
  if (!user || !user.isSubscribed) {
    return res.status(403).json({ error: 'To upload your song, please subscribe first.' });
  }

  const now = new Date();
  if (!user.subscriptionExpires || new Date(user.subscriptionExpires) < now) {
    return res.status(403).json({ error: 'Subscription expired. Please subscribe again.' });
  }

  next();
}

module.exports = subscriptionCheck;
