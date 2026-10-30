import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import RecommendationRequestIndexPage from "main/pages/RecommendationRequest/RecommendationRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, useLocation } from "react-router";

import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

function LocationDisplay() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

describe("RecommendationRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "RecommendationRequestTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestIndexPage />
          <LocationDisplay />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("renders three recommendation requests for regular user without management buttons", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/RecommendationRequest/all")
      .reply(200, recommendationRequestFixtures.threeRequests);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );

    expect(screen.getByText("student1@example.com")).toBeInTheDocument();
    expect(screen.getByText("professor2@example.com")).toBeInTheDocument();

    expect(
      screen.queryByText("Create RecommendationRequest"),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders management buttons for admin user", async () => {
    setupAdminUser();
    axiosMock
      .onGet("/api/RecommendationRequest/all")
      .reply(200, recommendationRequestFixtures.threeRequests);

    renderPage();

    const createButton = await screen.findByText(
      "Create RecommendationRequest",
    );

    expect(createButton).toHaveAttribute(
      "href",
      "/recommendationrequest/create",
    );
    expect(createButton).toHaveStyle({ float: "right" });

    const editButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("starts with an empty table while recommendation requests are loading", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/RecommendationRequest/all")
      .reply(() => new Promise(() => {}));

    renderPage();

    await waitFor(() => {
      expect(screen.getByTestId(testId)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-row-0`)).not.toBeInTheDocument();
  });

  test("admin can navigate to the edit page for a recommendation request", async () => {
    setupAdminUser();
    axiosMock
      .onGet("/api/RecommendationRequest/all")
      .reply(200, recommendationRequestFixtures.threeRequests);

    renderPage();

    const editButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/recommendationrequest/edit/1",
      );
    });
  });

  test("admin can delete a recommendation request and the table refreshes", async () => {
    setupAdminUser();

    let getCallCount = 0;

    axiosMock.onGet("/api/RecommendationRequest/all").reply(() => {
      getCallCount += 1;
      return [
        200,
        getCallCount === 1
          ? recommendationRequestFixtures.threeRequests
          : recommendationRequestFixtures.threeRequests.slice(1),
      ];
    });

    axiosMock
      .onDelete("/api/RecommendationRequest")
      .reply(200, "record 1 deleted");

    renderPage();

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });

    expect(getCallCount).toBeGreaterThanOrEqual(2);
    expect(mockToast).toHaveBeenCalledWith("record 1 deleted");
  });
});
