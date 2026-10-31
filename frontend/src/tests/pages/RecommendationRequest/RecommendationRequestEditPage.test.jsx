import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";

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

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    useParams: vi.fn(() => ({ id: 17 })),
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

let axiosMock;

const queryClient = new QueryClient();

describe("RecommendationRequestEditPage tests", () => {
  beforeEach(() => {
    queryClient.clear();

    axiosMock = new AxiosMockAdapter(axios);
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  afterEach(() => {
    mockToast.mockClear();
    mockNavigate.mockClear();
    axiosMock.restore();
  });

  test("Renders header when backend does not return data", async () => {
    axiosMock
      .onGet("/api/RecommendationRequest", { params: { id: 17 } })
      .timeout();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Edit RecommendationRequest");

    expect(
      screen.queryByTestId("RecommendationRequestForm-id"),
    ).not.toBeInTheDocument();
  });

  test("Loads and updates a RecommendationRequest", async () => {
    axiosMock
      .onGet("/api/RecommendationRequest", { params: { id: 17 } })
      .reply(200, {
        id: 17,
        requesterEmail: "student@example.com",
        professorEmail: "professor@example.com",
        explanation: "Requesting a recommendation",
        dateRequested: "2026-10-21T10:00",
        dateNeeded: "2026-11-15T00:00",
        done: false,
      });

    axiosMock.onPut("/api/RecommendationRequest").reply(200, {
      id: 17,
      requesterEmail: "student@example.com",
      professorEmail: "professor@example.com",
      explanation: "Updated recommendation request",
      dateRequested: "2026-10-21T10:00",
      dateNeeded: "2026-11-15T00:00",
      done: true,
    });

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("RecommendationRequestForm-id");

    // Verify that the expected GET query key was registered.
    expect(
      queryClient.getQueryState(["/api/RecommendationRequest?id=17"]),
    ).toBeDefined();

    const id = screen.getByTestId("RecommendationRequestForm-id");
    const explanation = screen.getByTestId(
      "RecommendationRequestForm-explanation",
    );
    const done = screen.getByTestId("RecommendationRequestForm-done");
    const submit = screen.getByTestId("RecommendationRequestForm-submit");

    expect(id).toHaveValue("17");
    expect(explanation).toHaveValue("Requesting a recommendation");

    fireEvent.change(explanation, {
      target: { value: "Updated recommendation request" },
    });
    fireEvent.click(done);
    fireEvent.click(submit);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "RecommendationRequest Updated - id: 17",
      );
    });

    // Verify the GET request used the expected URL, method, and ID.
    const recommendationRequestGet = axiosMock.history.get.find(
      (request) => request.url === "/api/RecommendationRequest",
    );

    expect(recommendationRequestGet).toBeDefined();
    expect(recommendationRequestGet.method).toBe("get");
    expect(recommendationRequestGet.params).toEqual({ id: 17 });

    // Verify the PUT request used the expected ID.
    expect(axiosMock.history.put).toHaveLength(1);
    expect(axiosMock.history.put[0].params).toEqual({ id: 17 });

    // Verify the PUT request sent all editable fields.
    expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
      requesterEmail: "student@example.com",
      professorEmail: "professor@example.com",
      explanation: "Updated recommendation request",
      dateRequested: "2026-10-21T10:00",
      dateNeeded: "2026-11-15T00:00",
      done: true,
    });

    // Verify the mutation invalidated the expected query key.
    await waitFor(() => {
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ["/api/RecommendationRequest?id=17"],
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/recommendationrequest",
    });

    invalidateQueriesSpy.mockRestore();
  });
});
