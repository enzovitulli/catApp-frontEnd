/**
 * Mock data for development and testing
 */

// Helper function to count total comments including replies
function countTotalComments(comments) {
  return comments.reduce((total, comment) => {
    // Count this comment
    let count = 1;
    // Add count of any replies
    if (comment.replies && comment.replies.length > 0) {
      count += comment.replies.length;
      // If replies have nested replies, we would add those too (not in current data model)
    }
    return total + count;
  }, 0);
}

// Mockup cat data
export const mockupCats = [
  {
    id: "cat1",
    name: "Mochi",
    img: "https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg?auto=compress&w=600&q=80",
    breed: "Fold Escocés",
    age: 2,
    ownerUsername: "whisker_lover",
    commentsCount: countTotalComments([
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
      { id: 4, username: "purrfect_pics", text: "Necesito más fotos de este bebé", timestamp: "1 hora", userProfilePic: "https://randomuser.me/api/portraits/women/68.jpg", likeCount: 19, replyCount: 0, replies: [] },
      { id: 5, username: "feline_friend", text: "Este gato es idéntico al mío! Gemelos!", timestamp: "2 horas", userProfilePic: null, likeCount: 7, replyCount: 0, replies: [] },
      { id: 6, username: "kitty_committee", text: "¡Qué ojos tan expresivos tiene!", timestamp: "3 horas", userProfilePic: "https://randomuser.me/api/portraits/women/22.jpg", likeCount: 15, replyCount: 0, replies: [] },
      { id: 7, username: "cat_whisperer", text: "Este gatito parece muy inteligente", timestamp: "4 horas", userProfilePic: null, likeCount: 9, replyCount: 0, replies: [] },
      { id: 8, username: "fluffy_lover", text: "Me derrito con estas fotos 💕", timestamp: "5 horas", userProfilePic: "https://randomuser.me/api/portraits/men/32.jpg", likeCount: 21, replyCount: 0, replies: [] },
      { id: 9, username: "meow_meow", text: "Quisiera poder acariciarlo", timestamp: "6 horas", userProfilePic: null, likeCount: 11, replyCount: 0, replies: [] },
      { id: 10, username: "cat_dad", text: "Mi hija quiere un gato igual", timestamp: "7 horas", userProfilePic: "https://randomuser.me/api/portraits/men/45.jpg", likeCount: 6, replyCount: 0, replies: [] },
      { id: 11, username: "kitten_fan", text: "¿Alguien sabe dónde puedo adoptar uno similar?", timestamp: "8 horas", userProfilePic: null, likeCount: 4, replyCount: 0, replies: [] },
      { id: 12, username: "purr_master", text: "Me encantaría tenerlo como mascota", timestamp: "9 horas", userProfilePic: "https://randomuser.me/api/portraits/women/75.jpg", likeCount: 7, replyCount: 0, replies: [] },
      { id: 13, username: "fur_baby", text: "Este gatito hizo mi día mejor", timestamp: "10 horas", userProfilePic: null, likeCount: 8, replyCount: 0, replies: [] },
      { id: 14, username: "cat_enthusiast", text: "¡Qué preciosidad de animal!", timestamp: "11 horas", userProfilePic: "https://randomuser.me/api/portraits/men/67.jpg", likeCount: 14, replyCount: 0, replies: [] },
      { id: 15, username: "whisker_watcher", text: "Este gatito debería ser modelo", timestamp: "12 horas", userProfilePic: null, likeCount: 16, replyCount: 0, replies: [] },
      { id: 16, username: "feline_enthusiast", text: "¿Cuánto tiempo tienen estas fotos? Se ve tan joven", timestamp: "14 horas", userProfilePic: "https://randomuser.me/api/portraits/women/54.jpg", likeCount: 3, replyCount: 0, replies: [] },
      { id: 17, username: "cat_parent", text: "Este gatito tiene la misma expresión que mi Mittens", timestamp: "16 horas", userProfilePic: null, likeCount: 5, replyCount: 0, replies: [] },
      { id: 18, username: "paw_lover", text: "Esas patitas son perfectas", timestamp: "18 horas", userProfilePic: "https://randomuser.me/api/portraits/men/38.jpg", likeCount: 7, replyCount: 0, replies: [] },
      { id: 19, username: "whiskers_admirer", text: "Mis hijos están enamorados de este gatito", timestamp: "20 horas", userProfilePic: null, likeCount: 9, replyCount: 0, replies: [] }
    ]) // Includes all replies (22 total)
  },
  {
    id: "cat2",
    name: "Luna",
    img: "https://images.pexels.com/photos/1276553/pexels-photo-1276553.jpeg?auto=compress&w=600&q=80",
    breed: "Siamés",
    age: 3,
    ownerUsername: "cat_lady89",
    commentsCount: countTotalComments([
      { id: 16, username: "lone_commenter", text: "Soy el único que ha comentado aquí. ¡Qué gato tan bonito!", timestamp: "5 horas", userProfilePic: "https://randomuser.me/api/portraits/women/33.jpg", likeCount: 3, replyCount: 0, replies: [] }
    ]) // Just one comment, no replies
  },
  {
    id: "cat3",
    name: "Simba",
    img: "https://images.pexels.com/photos/416160/pexels-photo-416160.jpeg?auto=compress&w=600&q=80",
    breed: "Maine Coon",
    age: 4,
    ownerUsername: "meow_master",
    commentsCount: countTotalComments([
      { id: 17, username: "cat_admirer", text: "Me encanta esta raza de gatos", timestamp: "1 hora", userProfilePic: null, likeCount: 7, replyCount: 0, replies: [] },
      { id: 18, username: "fluffy_lover", text: "¡Qué ojos tan hermosos!", timestamp: "2 horas", userProfilePic: "https://randomuser.me/api/portraits/men/28.jpg", likeCount: 5, replyCount: 1, replies: [
        { id: 104, username: "cat_specialist", text: "Son característicos de esta raza.", timestamp: "1 hora", likeCount: 2, replyCount: 0, replies: [] }
      ]},
      { id: 19, username: "kitten_fan", text: "Parece muy juguetón", timestamp: "3 horas", userProfilePic: null, likeCount: 4, replyCount: 0, replies: [] },
      { id: 20, username: "cat_whisperer", text: "Este es el tipo de gato perfecto para niños", timestamp: "4 horas", userProfilePic: "https://randomuser.me/api/portraits/women/12.jpg", likeCount: 6, replyCount: 0, replies: [] },
      { id: 21, username: "feline_friend", text: "Me encantaría tener uno así", timestamp: "5 horas", userProfilePic: null, likeCount: 3, replyCount: 0, replies: [] }
    ]) // Includes replies (total 6 comments)
  },
  {
    id: "cat4",
    name: "Nala",
    img: "https://images.pexels.com/photos/320014/pexels-photo-320014.jpeg?auto=compress&w=600&q=80",
    breed: "Persa",
    age: 1,
    ownerUsername: "furry_friend22",
    commentsCount: countTotalComments([]) // No comments yet
  }
];

// Mock comments organized by cat ID
export const MOCK_COMMENTS_BY_CAT = {
  // Cat1 - many comments (19 total)
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
    { id: 4, username: "purrfect_pics", text: "Necesito más fotos de este bebé", timestamp: "1 hora", userProfilePic: "https://randomuser.me/api/portraits/women/68.jpg", likeCount: 19, replyCount: 0, replies: [] },
    { id: 5, username: "feline_friend", text: "Este gato es idéntico al mío! Gemelos!", timestamp: "2 horas", userProfilePic: null, likeCount: 7, replyCount: 0, replies: [] },
    { id: 6, username: "kitty_committee", text: "¡Qué ojos tan expresivos tiene!", timestamp: "3 horas", userProfilePic: "https://randomuser.me/api/portraits/women/22.jpg", likeCount: 15, replyCount: 0, replies: [] },
    { id: 7, username: "cat_whisperer", text: "Este gatito parece muy inteligente", timestamp: "4 horas", userProfilePic: null, likeCount: 9, replyCount: 0, replies: [] },
    { id: 8, username: "fluffy_lover", text: "Me derrito con estas fotos 💕", timestamp: "5 horas", userProfilePic: "https://randomuser.me/api/portraits/men/32.jpg", likeCount: 21, replyCount: 0, replies: [] },
    { id: 9, username: "meow_meow", text: "Quisiera poder acariciarlo", timestamp: "6 horas", userProfilePic: null, likeCount: 11, replyCount: 0, replies: [] },
    { id: 10, username: "cat_dad", text: "Mi hija quiere un gato igual", timestamp: "7 horas", userProfilePic: "https://randomuser.me/api/portraits/men/45.jpg", likeCount: 6, replyCount: 0, replies: [] },
    { id: 11, username: "kitten_fan", text: "¿Alguien sabe dónde puedo adoptar uno similar?", timestamp: "8 horas", userProfilePic: null, likeCount: 4, replyCount: 0, replies: [] },
    { id: 12, username: "purr_master", text: "Me encantaría tenerlo como mascota", timestamp: "9 horas", userProfilePic: "https://randomuser.me/api/portraits/women/75.jpg", likeCount: 7, replyCount: 0, replies: [] },
    { id: 13, username: "fur_baby", text: "Este gatito hizo mi día mejor", timestamp: "10 horas", userProfilePic: null, likeCount: 8, replyCount: 0, replies: [] },
    { id: 14, username: "cat_enthusiast", text: "¡Qué preciosidad de animal!", timestamp: "11 horas", userProfilePic: "https://randomuser.me/api/portraits/men/67.jpg", likeCount: 14, replyCount: 0, replies: [] },
    { id: 15, username: "whisker_watcher", text: "Este gatito debería ser modelo", timestamp: "12 horas", userProfilePic: null, likeCount: 16, replyCount: 0, replies: [] },
    { id: 16, username: "feline_enthusiast", text: "¿Cuánto tiempo tienen estas fotos? Se ve tan joven", timestamp: "14 horas", userProfilePic: "https://randomuser.me/api/portraits/women/54.jpg", likeCount: 3, replyCount: 0, replies: [] },
    { id: 17, username: "cat_parent", text: "Este gatito tiene la misma expresión que mi Mittens", timestamp: "16 horas", userProfilePic: null, likeCount: 5, replyCount: 0, replies: [] },
    { id: 18, username: "paw_lover", text: "Esas patitas son perfectas", timestamp: "18 horas", userProfilePic: "https://randomuser.me/api/portraits/men/38.jpg", likeCount: 7, replyCount: 0, replies: [] },
    { id: 19, username: "whiskers_admirer", text: "Mis hijos están enamorados de este gatito", timestamp: "20 horas", userProfilePic: null, likeCount: 9, replyCount: 0, replies: [] }
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
