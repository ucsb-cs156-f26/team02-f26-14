
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");

  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const testId = "HelpRequestForm";

  const initialContents = {
    id: 1,
    requesterEmail: "student@ucsb.edu",
    teamId: "14",
    tableOrBreakoutRoom: "Table 4",
    requestTime: "2026-10-28T13:15",
    explanation: "Need help with Java.",
    solved: true,
  };

  const expectedHeaders = [
    "Requester Email",
    "Team ID",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];

  const renderForm = (props = {}) => {
    const queryClient = new QueryClient();

    return render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm submitAction={vi.fn()} {...props} />
        </Router>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test("renders correctly with no initialContents", () => {
    renderForm();

    expect(screen.getByText("Create")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-id`),
    ).not.toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-solved`),
    ).not.toBeChecked();
  });

  test("renders correctly when passing in initialContents", () => {
    renderForm({
      initialContents,
      buttonLabel: "Update",
    });

    expect(screen.getByText("Update")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-id`),
    ).toBeDisabled();

    expect(
      screen.getByTestId(`${testId}-requesterEmail`),
    ).toHaveValue("student@ucsb.edu");

    expect(
      screen.getByTestId(`${testId}-teamId`),
    ).toHaveValue("14");

    expect(
      screen.getByTestId(`${testId}-tableOrBreakoutRoom`),
    ).toHaveValue("Table 4");

    expect(
      screen.getByTestId(`${testId}-requestTime`),
    ).toHaveValue("2026-10-28T13:15");

    expect(
      screen.getByTestId(`${testId}-explanation`),
    ).toHaveValue("Need help with Java.");

    expect(
      screen.getByTestId(`${testId}-solved`),
    ).toBeChecked();
  });

  test("Cancel navigates back", async () => {
    renderForm();

    const cancelButton = screen.getByTestId(
      `${testId}-cancel`,
    );

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("required field validations are performed", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    fireEvent.click(
      screen.getByTestId(`${testId}-submit`),
    );

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Team ID is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Table or Breakout Room is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Request Time is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Explanation is required."),
    ).toBeInTheDocument();

    expect(submitAction).not.toHaveBeenCalled();
  });

  test("rejects whitespace-only required text fields", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    fireEvent.change(
      screen.getByTestId(`${testId}-requesterEmail`),
      { target: { value: "   " } },
    );

    fireEvent.change(
      screen.getByTestId(`${testId}-teamId`),
      { target: { value: "   " } },
    );

    fireEvent.change(
      screen.getByTestId(`${testId}-tableOrBreakoutRoom`),
      { target: { value: "   " } },
    );

    fireEvent.change(
      screen.getByTestId(`${testId}-explanation`),
      { target: { value: "   " } },
    );

    fireEvent.click(
      screen.getByTestId(`${testId}-submit`),
    );

    expect(
      await screen.findByText("Requester Email is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Team ID is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Table or Breakout Room is required."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Explanation is required."),
    ).toBeInTheDocument();

    expect(submitAction).not.toHaveBeenCalled();
  });

  test("submits valid HelpRequest data", async () => {
    const submitAction = vi.fn();

    renderForm({ submitAction });

    fireEvent.change(
      screen.getByTestId(`${testId}-requesterEmail`),
      { target: { value: "student@ucsb.edu" } },
    );

    fireEvent.change(
      screen.getByTestId(`${testId}-teamId`),
      { target: { value: "14" } },
    );

    fireEvent.change(
      screen.getByTestId(`${testId}-tableOrBreakoutRoom`),
      { target: { value: "Table 4" } },
    );

    fireEvent.change(
      screen.getByTestId(`${testId}-requestTime`),
      { target: { value: "2026-10-28T13:15" } },
    );

    fireEvent.change(
      screen.getByTestId(`${testId}-explanation`),
      { target: { value: "Need help with Java." } },
    );

    fireEvent.click(
      screen.getByTestId(`${testId}-solved`),
    );

    fireEvent.click(
      screen.getByTestId(`${testId}-submit`),
    );

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterEmail: "student@ucsb.edu",
          teamId: "14",
          tableOrBreakoutRoom: "Table 4",
          requestTime: "2026-10-28T13:15",
          explanation: "Need help with Java.",
          solved: true,
        }),
        expect.anything(),
      );
    });
  });
});
