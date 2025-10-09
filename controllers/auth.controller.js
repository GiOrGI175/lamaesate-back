import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(req.body);

  console.log(hashedPassword, 'hashedPassword');

  const newUser = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });
  console.log(newUser);
};

export const login = (req, res) => {
  console.log('login');
};

export const logout = (req, res) => {
  console.log('logout');
};
