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

describe("RecommendationRequestEditPage tests", () => {
  beforeEach(() => {
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

  const queryClient = new QueryClient();

  test("Renders header when backend does not return data", async () => {
    axiosMock.onGet("/api/RecommendationRequest", { params: { id: 17 } }).timeout();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByText("Edit RecommendationRequest");
    expect(screen.queryByTestId("RecommendationRequestForm-id")).not.toBeInTheDocument();
  });

  test("Loads and updates a RecommendationRequest", async () => {
    axiosMock.onGet("/api/RecommendationRequest", { params: { id: 17 } }).reply(200, {
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

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestEditPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await screen.findByTestId("RecommendationRequestForm-id");

    const id = screen.getByTestId("RecommendationRequestForm-id");
    const explanation = screen.getByTestId("RecommendationRequestForm-explanation");
    const done = screen.getByTestId("RecommendationRequestForm-done");
    const submit = screen.getByTestId("RecommendationRequestForm-submit");

    expect(id).toHaveValue("17");
    expect(explanation).toHaveValue("Requesting a recommendation");

    fireEvent.change(explanation, {
      target: { value: "Updated recommendation request" },
    });
    fireEvent.click(done);
    fireEvent.click(submit);

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith({
      to: "/recommendationrequest",
    });
    expect(axiosMock.history.put.length).toBe(1);
  });
});