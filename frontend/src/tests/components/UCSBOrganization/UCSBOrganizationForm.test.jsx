import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm tests", () => {
  const testId = "UCSBOrganizationForm";

  const expectedHeaders = [
    "Organization Code",
    "Short Organization Name",
    "Organization Name",
    "Inactive",
  ];

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-orgCode`)).toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={ucsbOrganizationFixtures.oneOrganization}
        />
      </Router>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    const orgCodeInput = screen.getByTestId(`${testId}-orgCode`);
    expect(orgCodeInput).toHaveValue("ACM");
    expect(orgCodeInput).toBeDisabled();

    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "Association for Computing Machinery",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "Association for Computing Machinery",
    );
    expect(screen.getByTestId(`${testId}-inactive`)).not.toBeChecked();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that required field validations are performed", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    const submitButton = await screen.findByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Organization Code is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Short Organization Name is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Organization Name is required."),
    ).toBeInTheDocument();
  });

  test("rejects whitespace-only required fields", async () => {
    render(
      <Router>
        <UCSBOrganizationForm />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Organization Code cannot be blank."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Short Organization Name cannot be blank."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Organization Name cannot be blank."),
    ).toBeInTheDocument();
  });

  test("submits valid organization data", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={mockSubmitAction} />
      </Router>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-orgCode`), {
      target: { value: "SHPE" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslationShort`), {
      target: { value: "SHPE" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-orgTranslation`), {
      target: { value: "Society of Hispanic Professional Engineers" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-inactive`));

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(mockSubmitAction).toHaveBeenCalledWith(
        {
          orgCode: "SHPE",
          orgTranslationShort: "SHPE",
          orgTranslation: "Society of Hispanic Professional Engineers",
          inactive: true,
        },
        expect.anything(),
      );
    });
  });

  test("uses a custom button label", async () => {
    render(
      <Router>
        <UCSBOrganizationForm buttonLabel="Save Changes" />
      </Router>,
    );

    expect(await screen.findByText("Save Changes")).toBeInTheDocument();
  });
});
