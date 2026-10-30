import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestTable tests", () => {
  const testId = "HelpRequestTable";

  const expectedHeaders = [
    "id",
    "Requester Email",
    "Team ID",
    "Table or Breakout Room",
    "Request Time",
    "Explanation",
    "Solved",
  ];

  const expectedFields = [
    "id",
    "requesterEmail",
    "teamId",
    "tableOrBreakoutRoom",
    "requestTime",
    "explanation",
    "solved",
  ];

  const renderTable = (
    currentUser,
    helpRequests = helpRequestFixtures.threeHelpRequest,
  ) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestTable
            helpRequests={helpRequests}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  test("Has the expected column headers and content for ordinary user", () => {
    renderTable(currentUserFixtures.userOnly);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "4",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent("student1@ucsb.edu");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-teamId`),
    ).toHaveTextContent("14");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).toHaveTextContent("No");

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("Has the expected column headers and content for admin user", () => {
    renderTable(currentUserFixtures.adminUser);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "4",
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Displays Yes for solved HelpRequests", () => {
    const solvedRequest = {
      ...helpRequestFixtures.oneHelpRequest,
      solved: true,
    };

    renderTable(currentUserFixtures.userOnly, [solvedRequest]);

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-solved`),
    ).toHaveTextContent("Yes");
  });

  test("Edit button navigates to the HelpRequest edit page", async () => {
    renderTable(currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    fireEvent.click(editButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith("/helprequest/edit/1");
    });
  });

  test("Delete button calls the HelpRequest delete endpoint", async () => {
    const axiosMock = new AxiosMockAdapter(axios);

    axiosMock
      .onDelete("/api/helprequest")
      .reply(200, { message: "HelpRequest deleted" });

    try {
      renderTable(currentUserFixtures.adminUser);

      const deleteButton = screen.getByTestId(
        `${testId}-cell-row-0-col-Delete-button`,
      );

      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(axiosMock.history.delete.length).toBe(1);
      });

      expect(axiosMock.history.delete[0].params).toEqual({
        id: 1,
      });
    } finally {
      axiosMock.restore();
    }
  });
});
