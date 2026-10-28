import React from "react";

import OurTable from "main/components/OurTable";

export default function UCSBDiningCommonsMenuItemTable({
  ucsbDiningCommonsMenuItems,
}) {
  const columns = [
    {
      header: "ID",
      accessorKey: "id",
    },
    {
      header: "Dining Commons Code",
      accessorKey: "diningCommonsCode",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Station",
      accessorKey: "station",
    },
  ];

  return (
    <OurTable
      data={ucsbDiningCommonsMenuItems}
      columns={columns}
      testid={"UCSBDiningCommonsMenuItemTable"}
    />
  );
}
