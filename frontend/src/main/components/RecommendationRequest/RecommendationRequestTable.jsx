import React from "react";
import OurTable from "main/components/OurTable";

export default function RecommendationRequestTable({ recommendationRequests }) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Requester Email",
      accessorKey: "requesterEmail",
    },
    {
      header: "Professor Email",
      accessorKey: "professorEmail",
    },
    {
      header: "Explanation",
      accessorKey: "explanation",
    },
    {
      header: "Date Requested",
      accessorKey: "dateRequested",
    },
    {
      header: "Date Needed",
      accessorKey: "dateNeeded",
    },
    {
      header: "Done",
      accessorKey: "done",
    },
  ];

  return (
    <OurTable
      data={recommendationRequests}
      columns={columns}
      testid={"RecommendationRequestTable"}
    />
  );
}
