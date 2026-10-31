import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: recommendationRequest,
    _error,
    _status,
  } = useBackend([`/api/RecommendationRequest?id=${id}`], {
    url: "/api/RecommendationRequest",
    params: { id },
  });

  const objectToAxiosPutParams = (request) => ({
    url: "/api/RecommendationRequest",
    method: "PUT",
    params: { id: request.id },
    data: {
      requesterEmail: request.requesterEmail,
      professorEmail: request.professorEmail,
      explanation: request.explanation,
      dateRequested: request.dateRequested,
      dateNeeded: request.dateNeeded,
      done: request.done,
    },
  });

  const onSuccess = (request) => {
    toast(`RecommendationRequest Updated - id: ${request.id}`);
  };

  const mutation = useBackendMutation(objectToAxiosPutParams, { onSuccess }, [
    `/api/RecommendationRequest?id=${id}`,
  ]);

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequest" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit RecommendationRequest</h1>
        {recommendationRequest && (
          <RecommendationRequestForm
            initialContents={recommendationRequest}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
