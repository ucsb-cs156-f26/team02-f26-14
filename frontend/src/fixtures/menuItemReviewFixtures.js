const menuItemReviewFixtures = {
  oneReview: {
    id: 1,
    itemId: 1,
    reviewerEmail: "cgaucho@ucsb.edu",
    stars: 3,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "Pretty good, but a bit too salty for my taste.",
  },
  threeReviews: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "Pretty good, but a bit too salty for my taste.",
    },
    {
      id: 2,
      itemId: 2,
      reviewerEmail: "ldelplaya@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-04-03T12:00:00",
      comments: "Best item on the menu, I order it every time!",
    },
    {
      id: 3,
      itemId: 3,
      reviewerEmail: "sanchezdelgado@ucsb.edu",
      stars: 1,
      dateReviewed: "2022-07-04T12:00:00",
      comments: "Way overcooked and cold when it arrived.",
    },
  ],
};

export { menuItemReviewFixtures };
