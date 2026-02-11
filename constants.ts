
import { User, Post, Notification } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'John Doe',
  username: 'johndoe',
  avatar: 'https://picsum.photos/seed/johndoe/200',
  coverImage: 'https://picsum.photos/seed/cover/800/300',
  bio: 'Frontend Engineer & Photography enthusiast.',
  isOnline: true,
};

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u2',
    author: {
      id: 'u2',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: 'https://picsum.photos/seed/jane/200',
    },
    content: 'Loving the vibes at the beach today! 🌊✨ #summer #beachlife',
    image: 'https://picsum.photos/seed/beach/800/600',
    likes: 124,
    isLiked: false,
    commentCount: 8,
    comments: [
      {
        id: 'c1',
        userId: 'u1',
        userName: 'John Doe',
        userAvatar: 'https://picsum.photos/seed/johndoe/200',
        content: 'Looks amazing! Have fun!',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        likes: 2
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: 'p2',
    userId: 'u3',
    author: {
      id: 'u3',
      name: 'Tech Insider',
      username: 'techinsider',
      avatar: 'https://picsum.photos/seed/tech/200',
    },
    content: 'Just launched our new React framework. It leverages the latest Gemini 3 APIs for intelligent state management.',
    likes: 450,
    isLiked: true,
    commentCount: 24,
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  }
];

export const SUGGESTED_FRIENDS: User[] = [
  { id: 's1', name: 'Alice Walker', username: 'alice_w', avatar: 'https://picsum.photos/seed/alice/200' },
  { id: 's2', name: 'Bob Johnson', username: 'bjohnson', avatar: 'https://picsum.photos/seed/bob/200' },
  { id: 's3', name: 'Charlie Davis', username: 'charlied', avatar: 'https://picsum.photos/seed/charlie/200' },
];

export const ONLINE_FRIENDS: User[] = [
  { id: 'o1', name: 'Sarah Wilson', username: 'sarahw', avatar: 'https://picsum.photos/seed/sarah/200', isOnline: true },
  { id: 'o2', name: 'Mike Ross', username: 'mross', avatar: 'https://picsum.photos/seed/mike/200', isOnline: true },
];
