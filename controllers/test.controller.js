import jwt from 'jsonwebtoken';

export const shuldbeLoggedIn = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'not Authenticed' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(401).json({ message: 'not Authenticed' });
  });

  res.status(200).json({ message: 'you are Authenticed' });
};

export const shuldbeAdmin = async (req, res) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'not Authenticed' });

  jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
    if (err) return res.status(401).json({ message: 'not Authenticed' });
    if (!payload.isAdmin)
      return res.status(403).json({ message: 'not autorized' });
  });

  res.status(200).json({ message: 'you are Authenticed' });
};
