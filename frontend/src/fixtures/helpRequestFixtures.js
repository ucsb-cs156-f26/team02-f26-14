const helpRequestFixtures = {
  oneHelpRequest: {
    id: 1,
    requesterEmail: "student1@ucsb.edu",
    teamId: "14",
    tableOrBreakoutRoom: "Table",
    requestTime: "2026-10-28T13:15:00",
    explanation: "Need help fixing a Java error.",
    solved: false,
  },
  threeHelpRequest: [
    {
      id: 1,
      requesterEmail: "student1@ucsb.edu",
      teamId: "14",
      tableOrBreakoutRoom: "Table",
      requestTime: "2026-10-28T13:15:00",
      explanation: "Need help fixing a Java error.",
      solved: false,
    },
    {
      id: 4,
      requesterEmail: "student2@ucsb.edu",
      teamId: "14",
      tableOrBreakoutRoom: "Table",
      requestTime: "2026-10-28T13:22:00",
      explanation: "Git merge conflict.",
      solved: false,
    },
    {
      id: 8,
      requesterEmail: "student3@ucsb.edu",
      teamId: "14",
      tableOrBreakoutRoom: "Table",
      requestTime: "2026-10-28T13:35:00",
      explanation: "React page won't load.",
      solved: false,
    },
  ],
};

export { helpRequestFixtures };
