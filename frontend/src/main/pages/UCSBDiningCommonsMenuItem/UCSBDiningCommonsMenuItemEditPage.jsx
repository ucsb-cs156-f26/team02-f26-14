import React from "react";
import { Navigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";

export default function UCSBDiningCommonsMenuItemEditPage({
  storybook = false,
}) {
  const { id } = useParams();
  const itemId = storybook ? 1 : id;

  const {
    data: item,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/UCSBDiningCommonsMenuItem", itemId],
    {
      method: "GET",
      url: "/api/UCSBDiningCommonsMenuItem",
      params: { id: itemId },
    },
    null,
  );

  const objectToAxiosParams = (updatedItem) => ({
    method: "PUT",
    url: "/api/UCSBDiningCommonsMenuItem",
    params: { id: itemId },
    data: updatedItem,
  });

  const onSuccess = (updatedItem) => {
    toast(
      `UCSBDiningCommonsMenuItem Updated - id: ${updatedItem.id} name: ${updatedItem.name}`,
    );
  };

  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    "/api/UCSBDiningCommonsMenuItem/all",
  ]);

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to="/diningcommonsmenuitem" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSB Dining Commons Menu Item</h1>
        {item && (
          <UCSBDiningCommonsMenuItemForm
            initialContents={item}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
