import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { json } from 'express';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
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

    res.status(201).json({ message: 'user created succesfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to create user!' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) return res.status(400).json({ message: 'Invalid Credential' });

    const isPasswordVaild = await bcrypt.compare(password, user.password);

    if (!isPasswordVaild)
      return res.status(401).json({ message: 'Invalid Credential' });

    res.setHeader('set-cookie', 'test=' + 'myvalue').json('succes');
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'failed to login' });
  }
};

export const logout = (req, res) => {
  console.log('logout');
};
