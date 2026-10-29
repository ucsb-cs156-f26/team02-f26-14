import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { useParams, Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({ storybook = false }) {
  const { id } = useParams();

  const {
    data: organization,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching
    [`/api/ucsborganization?orgCode=${id}`],
    {
      // Stryker disable next-line StringLiteral: Axios defaults to GET when method is empty
      method: "GET",
      url: "/api/ucsborganization",
      params: {
        orgCode: id,
      },
    },
  );

  const objectToAxiosPutParams = (organization) => ({
    url: "/api/ucsborganization",
    method: "PUT",
    params: {
      orgCode: organization.orgCode,
    },
    data: {
      orgTranslationShort: organization.orgTranslationShort,
      orgTranslation: organization.orgTranslation,
      inactive: organization.inactive,
    },
  });

  const onSuccess = (organization) => {
    toast(
      `UCSB Organization Updated - code: ${organization.orgCode} name: ${organization.orgTranslation}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : don't test internal caching
    [`/api/ucsborganization?orgCode=${id}`, "/api/ucsborganization/all"],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSB Organization</h1>
        {organization && (
          <UCSBOrganizationForm
            initialContents={organization}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
