/**
 * Mock data for development and testing
 */

// Mockup cat data
export const mockupCats = [
  {
    id: "cat1",
    name: "Mochi",
    img: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=600&q=80",
    breed: "Fold Escocés",
    age: 2,
    ownerUsername: "whisker_lover",
    commentsCount: 15 // This one has many comments
  },
  {
    id: "cat2",
    name: "Luna",
    img: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80",
    breed: "Siamés",
    age: 3,
    ownerUsername: "cat_lady89",
    commentsCount: 1 // This one has just one comment
  },
  {
    id: "cat3",
    name: "Simba",
    img: "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80",
    breed: "Maine Coon",
    age: 4,
    ownerUsername: "meow_master",
    commentsCount: 5
  },
  {
    id: "cat4",
    name: "Nala",
    img: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&w=600&q=80",
    breed: "Persa",
    age: 1,
    ownerUsername: "furry_friend22",
    commentsCount: 0 // This one has no comments
  }
];

// Mock comments organized by cat ID
export const MOCK_COMMENTS_BY_CAT = {
  // Cat1 - many comments
  "cat1": [
    { 
      id: 1, 
      username: "cat_lover", 
      text: "¡Qué lindo gatito! 😻", 
      timestamp: "2 min",
      userProfilePic: "https://randomuser.me/api/portraits/women/44.jpg",
      likeCount: 12,
      replyCount: 2,
      replies: [
        { id: 101, username: "whiskers_fan", text: "¡Sí! Es adorable.", timestamp: "1 min", likeCount: 3, replyCount: 0, replies: [] },
        { id: 102, username: "meow_master", text: "¡Quiero uno igual!", timestamp: "justo ahora", likeCount: 1, replyCount: 0, replies: [] }
      ]
    },
    { id: 2, username: "whiskers_fan", text: "Me encanta su pelaje, tan suave.", timestamp: "15 min", userProfilePic: null, likeCount: 8, replyCount: 0, replies: [] },
    { id: 3, username: "meow_master", text: "¿Qué raza es? Parece muy juguetón.", timestamp: "32 min", userProfilePic: "https://randomuser.me/api/portraits/men/22.jpg", likeCount: 5, replyCount: 1, replies: [
      { id: 103, username: "cat_lover", text: "Es un British Shorthair, son adorables.", timestamp: "15 min", likeCount: 4, replyCount: 0, replies: [] }
    ]},
    // ... more comments
    { id: 15, username: "whisker_watcher", text: "Este gatito debería ser modelo", timestamp: "12 horas", userProfilePic: null, likeCount: 16, replyCount: 0, replies: [] }
  ],
  
  // Cat2 - just one comment
  "cat2": [
    { id: 16, username: "lone_commenter", text: "Soy el único que ha comentado aquí. ¡Qué gato tan bonito!", timestamp: "5 horas", userProfilePic: "https://randomuser.me/api/portraits/women/33.jpg", likeCount: 3, replyCount: 0, replies: [] }
  ],
  
  // Cat3 - few comments
  "cat3": [
    { id: 17, username: "cat_admirer", text: "Me encanta esta raza de gatos", timestamp: "1 hora", userProfilePic: null, likeCount: 7, replyCount: 0, replies: [] },
    { id: 18, username: "fluffy_lover", text: "¡Qué ojos tan hermosos!", timestamp: "2 horas", userProfilePic: "https://randomuser.me/api/portraits/men/28.jpg", likeCount: 5, replyCount: 1, replies: [
      { id: 104, username: "cat_specialist", text: "Son característicos de esta raza.", timestamp: "1 hora", likeCount: 2, replyCount: 0, replies: [] }
    ]},
    { id: 19, username: "kitten_fan", text: "Parece muy juguetón", timestamp: "3 horas", userProfilePic: null, likeCount: 4, replyCount: 0, replies: [] },
    { id: 20, username: "cat_whisperer", text: "Este es el tipo de gato perfecto para niños", timestamp: "4 horas", userProfilePic: "https://randomuser.me/api/portraits/women/12.jpg", likeCount: 6, replyCount: 0, replies: [] },
    { id: 21, username: "feline_friend", text: "Me encantaría tener uno así", timestamp: "5 horas", userProfilePic: null, likeCount: 3, replyCount: 0, replies: [] }
  ],
  
  // Cat4 - no comments yet
  "cat4": []
};
