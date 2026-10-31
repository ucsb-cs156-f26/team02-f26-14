import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

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
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("RecommendationRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();

    const recommendationRequest = {
      id: 17,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "I need a letter of recommendation.",
      dateRequested: "2026-10-29T10:00",
      dateNeeded: "2026-11-15T10:00",
      done: false,
    };

    axiosMock
      .onPost("/api/RecommendationRequest/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      ).toBeInTheDocument();
    });

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-requesterEmail"),
      { target: { value: recommendationRequest.requesterEmail } },
    );

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-professorEmail"),
      { target: { value: recommendationRequest.professorEmail } },
    );

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-explanation"),
      { target: { value: recommendationRequest.explanation } },
    );

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateRequested"),
      { target: { value: recommendationRequest.dateRequested } },
    );

    fireEvent.change(
      screen.getByTestId("RecommendationRequestForm-dateNeeded"),
      { target: { value: recommendationRequest.dateNeeded } },
    );

    fireEvent.click(screen.getByTestId("RecommendationRequestForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "I need a letter of recommendation.",
      dateRequested: "2026-10-29T10:00",
      dateNeeded: "2026-11-15T10:00",
      done: false,
    });

    expect(mockToast).toBeCalledWith(
      "New RecommendationRequest Created - id: 17",
    );

    expect(mockNavigate).toBeCalledWith({
      to: "/recommendationrequest",
    });
  });

  test("when the form is empty, validation errors appear and no request is made", async () => {
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-submit"),
      ).toBeInTheDocument();
    });

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

    expect(axiosMock.history.post.length).toBe(0);
  });
});
