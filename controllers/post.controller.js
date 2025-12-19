import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

const generateApartmentImages = () => {
  const seed = Math.floor(Math.random() * 100000);

  // images: [
  //   `https://res.cloudinary.com/demo/image/upload/apartment_${faker.number.int({
  //     min: 1,
  //     max: 100,
  //   })}.jpg`,
  // ];

  return [
    `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80&sig=${seed}1`,
    `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80&sig=${seed}2`,
    `https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=800&q=80&sig=${seed}3`,
    `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80&sig=${seed}4`,
    `https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80&sig=${seed}5`,
  ];
};
export const seedPosts = async (req, res) => {
  const userId = req.userId;

  try {
    const posts = [];

    for (let i = 0; i < 20; i++) {
      posts.push(
        prisma.post.create({
          data: {
            title: faker.location.streetAddress(),
            price: faker.number.int({ min: 300, max: 3000 }),
            images: generateApartmentImages(),
            address: faker.location.streetAddress(),
            city: faker.helpers.arrayElement(['Tbilisi', 'Batumi']),
            bedroom: faker.number.int({ min: 1, max: 5 }),
            bathroom: faker.number.int({ min: 1, max: 3 }),
            latitude: String(faker.location.latitude()),
            longitude: String(faker.location.longitude()),
            type: faker.helpers.arrayElement(['buy', 'rent']),
            property: faker.helpers.arrayElement([
              'apartment',
              'house',
              'condo',
            ]),
            userId,
            postDetails: {
              create: {
                desc: faker.lorem.paragraph(),
                ustilites: 'wifi, gas',
                pet: faker.helpers.arrayElement(['allowed', 'not allowed']),
                icome: 'not required',
                size: faker.number.int({ min: 40, max: 200 }),
                school: faker.number.int({ min: 1, max: 10 }),
                bus: faker.number.int({ min: 1, max: 10 }),
                restaurant: faker.number.int({ min: 1, max: 10 }),
              },
            },
          },
        })
      );
    }

    await Promise.all(posts);
    res
      .status(201)
      .json({ message: 'Fake posts created with real apartment photos' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to seed posts' });
  }
};

export const resetPosts = async (req, res) => {
  try {
    await prisma.savedPost.deleteMany();
    await prisma.postDetails.deleteMany();
    await prisma.post.deleteMany();

    res.status(200).json({ message: 'All posts deleted' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to reset posts' });
  }
};

export const getPosts = async (req, res) => {
  const query = req.query;

  try {
    const posts = await prisma.post.findMany({
      where: {
        city: query.city || undefined,
        type: query.type || undefined,
        property: query.property || undefined,
        bedroom: parseInt(query.bedroom) || undefined,
        price: {
          gte: parseInt(query.minPrice) || undefined,
          lte: parseInt(query.maxPrice) || undefined,
        },
      },
    });

    // setTimeout(() => {
    res.status(200).json(posts);
    // }, 3000);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Failed to get posts' });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetails: true,
        user: { select: { username: true, avatar: true } },
      },
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const token = req.cookies?.token;
    if (!token) {
      return res.status(200).json({ ...post, isSaved: false });
    }

    return jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      async (err, payload) => {
        if (err) {
          return res.status(200).json({ ...post, isSaved: false });
        }

        const saved = await prisma.savedPost.findUnique({
          where: { userId_postId: { postId: id, userId: payload.id } },
        });

        return res.status(200).json({ ...post, isSaved: !!saved });
      }
    );
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: 'Failed to get post' });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetails: {
          create: body.postDetails,
        },
      },
      include: {
        postDetails: true,
      },
    });

    res.status(200).json(newPost);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Falied to get posts' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });
    res.status(200).json();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Falied to get posts' });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: 'Not Authorized' });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Falied to get posts' });
  }
};
