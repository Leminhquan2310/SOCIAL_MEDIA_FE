import { User, Post, Notification, Privacy } from "./types";

export const MOCK_USER: User = {
  id: 1,
  fullName: "John Doe",
  username: "johndoe",
  email: "johndoe@gmail.com",
  avatar: "https://picsum.photos/seed/johndoe/200",
  coverImage: "https://picsum.photos/seed/cover/800/300",
  bio: "Frontend Engineer & Photography enthusiast.",
  isOnline: true,
};

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    userId: "u2",
    author: {
      id: 2,
      fullName: "Jane Smith",
      username: "janesmith",
      email: "janesmith@gmail.com",
      avatar: "https://picsum.photos/seed/jane/200",
    },
    content: "Loving the vibes at the beach today! 🌊✨ #summer #beachlife",
    privacy: Privacy.PUBLIC,
    images: [{ id: 1, imageUrl: "https://picsum.photos/seed/beach/800/600", orderIndex: 0 }],
    likes: 124,
    isLiked: false,
    commentCount: 8,
    comments: [
      {
        id: "c1",
        userId: "u1",
        userName: "John Doe",
        userAvatar: "https://picsum.photos/seed/johndoe/200",
        content: "Looks amazing! Have fun!",
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        likes: 2,
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "p2",
    userId: "u3",
    author: {
      id: 3,
      fullName: "Tech Insider",
      username: "techinsider",
      email: "janesmith@gmail.com",
      avatar: "https://picsum.photos/seed/tech/200",
    },
    content:
      "Just launched our new React framework. It leverages the latest Gemini 3 APIs for intelligent state management.",
    privacy: Privacy.PUBLIC,
    images: [],
    likes: 450,
    isLiked: true,
    commentCount: 24,
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

export const SUGGESTED_FRIENDS: User[] = [
  {
    id: 1,
    fullName: "Alice Walker",
    username: "alice_w",
    email: "janesmith@gmail.com",
    avatar: "https://picsum.photos/seed/alice/200",
  },
  {
    id: 2,
    fullName: "Bob Johnson",
    username: "bjohnson",
    email: "janesmith@gmail.com",
    avatar: "https://picsum.photos/seed/bob/200",
  },
  {
    id: 3,
    fullName: "Charlie Davis",
    username: "charlied",
    email: "janesmith@gmail.com",
    avatar: "https://picsum.photos/seed/charlie/200",
  },
];

export const ONLINE_FRIENDS: User[] = [
  {
    id: 1,
    fullName: "Sarah Wilson",
    username: "sarahw",
    email: "janesmith@gmail.com",
    avatar: "https://picsum.photos/seed/sarah/200",
    isOnline: true,
  },
  {
    id: 2,
    fullName: "Mike Ross",
    username: "mross",
    email: "janesmith@gmail.com",
    avatar: "https://picsum.photos/seed/mike/200",
    isOnline: true,
  },
];
