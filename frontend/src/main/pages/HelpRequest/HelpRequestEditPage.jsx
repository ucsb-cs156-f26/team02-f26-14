import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { Navigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function HelpRequestEditPage({ storybook = false }) {
  const { id } = useParams();

  const { data: helpRequest } = useBackend([`/api/helprequest?id=${id}`], {
    method: "GET",
    url: "/api/helprequest",
    params: { id },
  });

  const mutation = useBackendMutation(
    (data) => ({
      url: "/api/helprequest",
      method: "PUT",
      params: { id: data.id },
      data: {
        requesterEmail: data.requesterEmail,
        teamId: data.teamId,
        tableOrBreakoutRoom: data.tableOrBreakoutRoom,
        requestTime: data.requestTime,
        explanation: data.explanation,
        solved: data.solved,
      },
    }),
    {
      onSuccess: (updated) => {
        toast(`HelpRequest Updated - id: ${updated.id}`);
      },
    },
    [`/api/helprequest?id=${id}`],
  );

  if (mutation.isSuccess && !storybook) {
    return <Navigate to="/helprequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit HelpRequest</h1>
        {helpRequest && (
          <HelpRequestForm
            submitAction={(data) => mutation.mutate(data)}
            buttonLabel="Update"
            initialContents={helpRequest}
          />
        )}
      </div>
    </BasicLayout>
  );
}
