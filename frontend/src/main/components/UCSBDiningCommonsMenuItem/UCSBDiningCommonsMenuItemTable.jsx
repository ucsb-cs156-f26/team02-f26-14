import React from "react";

import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";
import { toast } from "react-toastify";

export default function UCSBDiningCommonsMenuItemTable({
  ucsbDiningCommonsMenuItems,
  currentUser,
  testIdPrefix = "UCSBDiningCommonsMenuItemTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/diningcommonsmenuitem/edit/${cell.row.original.id}`);
  };

  const cellToAxiosParamsDelete = (cell) => ({
    method: "DELETE",
    url: "/api/UCSBDiningCommonsMenuItem",
    params: {
      id: cell.row.original.id,
    },
  });

  const onDeleteSuccess = (message) => {
    toast(message.message);
  };

  // Stryker disable all : hard to test for query caching
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/UCSBDiningCommonsMenuItem/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

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

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable
      data={ucsbDiningCommonsMenuItems}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}
