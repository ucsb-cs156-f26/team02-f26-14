//Code that helps witht he frontend/format
const recommendationRequestFixtures = {
  oneRequest: {
    id: 1,
    requesterEmail: "student@example.com",
    professorEmail: "professor@example.com",
    explanation: "Requesting a recommendation for graduate school",
    dateRequested: "2026-10-21T10:00:00",
    dateNeeded: "2026-11-15T00:00:00",
    done: false,
  },

  threeRequests: [
    {
      id: 1,
      requesterEmail: "student1@example.com",
      professorEmail: "professor1@example.com",
      explanation: "Requesting a recommendation for graduate school",
      dateRequested: "2026-10-21T10:00:00",
      dateNeeded: "2026-11-15T00:00:00",
      done: false,
    },
    {
      id: 2,
      requesterEmail: "student2@example.com",
      professorEmail: "professor2@example.com",
      explanation: "Requesting a recommendation for an internship",
      dateRequested: "2026-10-22T11:00:00",
      dateNeeded: "2026-12-01T00:00:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "student3@example.com",
      professorEmail: "professor3@example.com",
      explanation: "Requesting a recommendation for a scholarship",
      dateRequested: "2026-10-23T12:00:00",
      dateNeeded: "2027-01-15T00:00:00",
      done: false,
    },
  ],
};

export { recommendationRequestFixtures };
