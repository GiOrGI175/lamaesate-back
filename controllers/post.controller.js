import prisma from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';

const georgiaCities = [
  { city: 'Tbilisi', lat: [41.65, 41.85], lng: [44.7, 44.9] },
  { city: 'Batumi', lat: [41.6, 41.67], lng: [41.6, 41.67] },
  { city: 'Kutaisi', lat: [42.23, 42.3], lng: [42.65, 42.75] },
  { city: 'Rustavi', lat: [41.5, 41.55], lng: [44.95, 45.05] },
  { city: 'Zugdidi', lat: [42.5, 42.55], lng: [41.85, 41.95] },
];

const randomFromRange = (min, max) =>
  (Math.random() * (max - min) + min).toFixed(6);

const generateGeo = () => {
  const location = faker.helpers.arrayElement(georgiaCities);

  return {
    city: location.city,
    latitude: randomFromRange(location.lat[0], location.lat[1]),
    longitude: randomFromRange(location.lng[0], location.lng[1]),
  };
};

// const generateApartmentImages = () => {
//   const seed = Math.floor(Math.random() * 100000);

//   // images: [
//   //   `https://res.cloudinary.com/demo/image/upload/apartment_${faker.number.int({
//   //     min: 1,
//   //     max: 100,
//   //   })}.jpg`,
//   // ];

//   return [
//     `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80&sig=${seed}1`,
//     `https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80&sig=${seed}2`,
//     `https://images.unsplash.com/photo-1560448075-bb485b067938?auto=format&fit=crop&w=800&q=80&sig=${seed}3`,
//     `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80&sig=${seed}4`,
//     // `https://images.unsplash.com/photo-1560184897-ae75f418493e?auto=format&fit=crop&w=800&q=80&sig=${seed}5`,
//   ];
// };

const apartmentPhotoIds = [
  'photo-1560448204-e02f11c3d0e2', // living room
  'photo-1502672260266-1c1ef2d93688', // bedroom
  'photo-1560448075-bb485b067938', // kitchen
  // 'photo-1522708323590-d24dbb6b0267', // bathroom
  'photo-1560184897-ae75f418493e', // apartment exterior
  'photo-1484154218962-a197022b5858', // kitchen modern
  'photo-1556912173-46c336c7fd55', // living room modern
  'photo-1505693416388-ac5ce068fe85', // bedroom cozy
  'photo-1556909114-f6e7ad7d3136', // modern living
  'photo-1556912172-45b7abe8b7e1', // bright room
  'photo-1615529328331-f8917597711f', // apartment view
  'photo-1493809842364-78817add7ffb', // cozy living
  'photo-1616486338812-3dadae4b4ace', // bedroom design
  'photo-1615875221248-e7c80b6e9915', // kitchen interior
  'photo-1617806118233-18e1de247200', // modern apartment
  'photo-1513694203232-719a280e022f', // interior design
  'photo-1503174971373-b1f69850bded', // stylish room
  'photo-1600210492486-724fe5c67fb0', // contemporary
  'photo-1600566753190-17f0baa2a6c3', // luxury apartment
  'photo-1600607687939-ce8a6c25118c', // home interior
];

const generateApartmentImages = () => {
  const seed = Math.floor(Math.random() * 100000);

  const shuffled = [...apartmentPhotoIds].sort(() => Math.random() - 0.5);
  const selectedPhotos = shuffled.slice(0, 4);

  return selectedPhotos.map(
    (photoId, index) =>
      `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80&sig=${seed}${index}`
  );
};

export const seedPosts = async (req, res) => {
  const userId = req.userId;
  const posts = [];

  try {
    for (let i = 0; i < 20; i++) {
      const geo = generateGeo();

      posts.push(
        prisma.post.create({
          data: {
            title: faker.location.streetAddress(),
            price: faker.number.int({ min: 300, max: 3000 }),
            images: generateApartmentImages(geo.city),
            address: faker.location.streetAddress(),
            city: geo.city,
            bedroom: faker.number.int({ min: 1, max: 5 }),
            bathroom: faker.number.int({ min: 1, max: 3 }),
            latitude: geo.latitude,
            longitude: geo.longitude,
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
