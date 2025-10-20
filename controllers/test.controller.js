import jwt from 'jsonwebtoken';

export const shuldbeLoggedIn = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'not athenticed' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(401).json({ message: 'not athenticed' });
  });

  res.status(200).json({ message: 'you are authencation' });
};

export const shuldbeAdmin = async (req, res) => {};
