import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
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

describe("ArticlesCreatePage tests", () => {
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

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  const fillAndSubmitForm = async () => {
    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Git Branching Strategies" },
    });
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://www.atlassian.com/git" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Overview of git workflows" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "vishwath@ucsb.edu" },
    });
    fireEvent.change(screen.getByLabelText("Date Added (iso format)"), {
      target: { value: "2022-04-21T09:30" },
    });

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));
  };

  const article = {
    id: 3,
    title: "Git Branching Strategies",
    url: "https://www.atlassian.com/git",
    explanation: "Overview of git workflows",
    email: "vishwath@ucsb.edu",
    dateAdded: "2022-04-21T09:30:00",
  };

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await fillAndSubmitForm();

    expect(axiosMock.history.post[0].url).toBe("/api/articles/post");
    expect(axiosMock.history.post[0].params).toEqual({
      title: "Git Branching Strategies",
      url: "https://www.atlassian.com/git",
      explanation: "Overview of git workflows",
      email: "vishwath@ucsb.edu",
      dateAdded: "2022-04-21T09:30",
    });

    await waitFor(() =>
      expect(mockToast).toBeCalledWith(
        "New article Created - id: 3 title: Git Branching Strategies",
      ),
    );
    expect(mockNavigate).toBeCalledWith({ to: "/articles" });
  });

  test("in storybook mode, does not redirect after submit", async () => {
    const queryClient = new QueryClient();
    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage storybook={true} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await fillAndSubmitForm();

    await waitFor(() => expect(mockToast).toHaveBeenCalled());
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByText("Create New Article")).toBeInTheDocument();
  });

  test("invalid input shows errors and does not call the backend", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticlesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Create"));

    expect(await screen.findByText(/Title is required./)).toBeInTheDocument();
    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
