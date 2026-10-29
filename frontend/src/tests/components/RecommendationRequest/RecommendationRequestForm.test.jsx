// Test file to go with the RecommendationRequestForm.jsx file

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { vi, test, expect, describe } from "vitest";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

const sampleRequest = {
  id: 1,
  requesterEmail: "student@example.com",
  professorEmail: "professor@example.com",
  explanation: "Requesting a recommendation for graduate school",
  dateRequested: "2026-10-21T10:00",
  dateNeeded: "2026-11-15T00:00",
  done: false,
};

describe("RecommendationRequestForm", () => {
  test("renders create form fields", () => {
    render(
      <BrowserRouter>
        <RecommendationRequestForm submitAction={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/Requester Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Professor Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Explanation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Requested/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date Needed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Completed/i)).toBeInTheDocument();
    expect(screen.queryByLabelText("ID")).not.toBeInTheDocument();

    expect(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-explanation"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-done"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-submit"),
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("RecommendationRequestForm-cancel"),
    ).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  test("renders update form with initial contents and ID", () => {
    render(
      <BrowserRouter>
        <RecommendationRequestForm
          initialContents={sampleRequest}
          submitAction={vi.fn()}
          buttonLabel="Update"
        />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText("ID")).toHaveValue("1");
    expect(
      screen.getByTestId("RecommendationRequestForm-id"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Requester Email/i)).toHaveValue(
      "student@example.com",
    );
    expect(screen.getByLabelText(/Professor Email/i)).toHaveValue(
      "professor@example.com",
    );
    expect(screen.getByLabelText(/Explanation/i)).toHaveValue(
      "Requesting a recommendation for graduate school",
    );
    expect(screen.getByLabelText(/Date Requested/i)).toHaveValue(
      "2026-10-21T10:00",
    );
    expect(screen.getByLabelText(/Date Needed/i)).toHaveValue(
      "2026-11-15T00:00",
    );
    expect(screen.getByLabelText(/Completed/i)).not.toBeChecked();
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  test("shows required field validation messages", async () => {
    render(
      <BrowserRouter>
        <RecommendationRequestForm submitAction={vi.fn()} />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    expect(
      await screen.findByText("Requester email is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Professor email is required."),
    ).toBeInTheDocument();
    expect(screen.getByText("Explanation is required.")).toBeInTheDocument();
    expect(screen.getByText("Date requested is required.")).toBeInTheDocument();
    expect(screen.getByText("Date needed is required.")).toBeInTheDocument();
  });

  test("shows validation for invalid email addresses", async () => {
    render(
      <BrowserRouter>
        <RecommendationRequestForm submitAction={vi.fn()} />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Requester Email/i), {
      target: { value: "not-an-email" },
    });
    fireEvent.change(screen.getByLabelText(/Professor Email/i), {
      target: { value: "also-not-an-email" },
    });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    expect(
      await screen.findByText("Enter a valid requester email address."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter a valid professor email address."),
    ).toBeInTheDocument();
  });

  test("rejects email addresses with extra text before them", async () => {
    render(
      <BrowserRouter>
        <RecommendationRequestForm submitAction={vi.fn()} />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Requester Email/i), {
      target: { value: "!student@example.com" },
    });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    expect(
      await screen.findByText("Enter a valid requester email address."),
    ).toBeInTheDocument();
  });

  test("rejects email addresses with extra text after them", async () => {
    render(
      <BrowserRouter>
        <RecommendationRequestForm submitAction={vi.fn()} />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Professor Email/i), {
      target: { value: "professor@example.com!" },
    });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    expect(
      await screen.findByText("Enter a valid professor email address."),
    ).toBeInTheDocument();
  });

  test("submits valid form contents", async () => {
    const submitAction = vi.fn();

    render(
      <BrowserRouter>
        <RecommendationRequestForm submitAction={submitAction} />
      </BrowserRouter>,
    );

    fireEvent.change(screen.getByLabelText(/Requester Email/i), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Professor Email/i), {
      target: { value: "professor@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/Explanation/i), {
      target: { value: "Recommendation for graduate school" },
    });
    fireEvent.change(screen.getByLabelText(/Date Requested/i), {
      target: { value: "2026-10-21T10:00" },
    });
    fireEvent.change(screen.getByLabelText(/Date Needed/i), {
      target: { value: "2026-11-15T00:00" },
    });

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    expect(submitAction).toHaveBeenCalledWith(
      {
        requesterEmail: "student@example.com",
        professorEmail: "professor@example.com",
        explanation: "Recommendation for graduate school",
        dateRequested: "2026-10-21T10:00",
        dateNeeded: "2026-11-15T00:00",
        done: false,
      },
      expect.anything(),
    );
  });

  test("Cancel navigates back", async () => {
    render(
      <BrowserRouter>
        <RecommendationRequestForm submitAction={vi.fn()} />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-cancel"));

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
