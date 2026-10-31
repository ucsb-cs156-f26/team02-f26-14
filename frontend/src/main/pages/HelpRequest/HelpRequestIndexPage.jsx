import React from "react";
import { useBackend } from "main/utils/useBackend";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";

export default function HelpRequestIndexPage() {
  const currentUser = useCurrentUser();

  const { data: helpRequests } = useBackend(
    ["/api/HelpRequest/all"],
    { method: "GET", url: "/api/HelpRequest/all" },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {hasRole(currentUser, "ROLE_ADMIN") && (
          <Button
            variant="primary"
            href="/helprequest/create"
            style={{ float: "right" }}
          >
            Create HelpRequest
          </Button>
        )}
        <h1>Help Requests</h1>
        <HelpRequestTable
          helpRequests={helpRequests}
          currentUser={currentUser}
        />
      </div>
    </BasicLayout>
  );
}
