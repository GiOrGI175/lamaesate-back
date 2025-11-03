import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

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

    // res.setHeader('set-cookie', 'test=' + 'myvalue').json('succes');

    const age = 1000 * 60 * 60 * 24 * 7;

    const token = jwt.sign(
      {
        id: user.id,
        isAdmin: false, //droebit
      },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: age,
      }
    );

    const { password: userPassword, ...userInfo } = user;

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: age,
      })
      .json(userInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'failed to login' });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token').status(200).json({ message: 'logout Successful' });
};
