import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("ArticlesEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(
        screen.queryByTestId("ArticlesForm-title"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Git Branching Strategies",
        url: "https://www.atlassian.com/git",
        explanation: "Overview of git workflows",
        email: "vishwath@ucsb.edu",
        dateAdded: "2022-04-21T09:30",
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: "17",
        title: "Git Workflows",
        url: "https://www.atlassian.com/git/tutorials",
        explanation: "Comparing git workflows",
        email: "phtcon@ucsb.edu",
        dateAdded: "2022-05-01T10:00",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    const renderPage = (storybook) =>
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticlesEditPage storybook={storybook} />
          </MemoryRouter>
        </QueryClientProvider>,
      );

    const editAndSubmit = () => {
      fireEvent.change(screen.getByTestId("ArticlesForm-title"), {
        target: { value: "Git Workflows" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-url"), {
        target: { value: "https://www.atlassian.com/git/tutorials" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-explanation"), {
        target: { value: "Comparing git workflows" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-email"), {
        target: { value: "phtcon@ucsb.edu" },
      });
      fireEvent.change(screen.getByTestId("ArticlesForm-dateAdded"), {
        target: { value: "2022-05-01T10:00" },
      });
      fireEvent.click(screen.getByTestId("ArticlesForm-submit"));
    };

    test("Is populated with the data provided, and changes when you click Update", async () => {
      // storybook prop omitted so the default (false) is exercised
      renderPage(undefined);

      await screen.findByTestId("ArticlesForm-id");

      expect(screen.getByTestId("ArticlesForm-id")).toHaveValue("17");
      expect(screen.getByTestId("ArticlesForm-title")).toHaveValue(
        "Git Branching Strategies",
      );
      expect(screen.getByTestId("ArticlesForm-url")).toHaveValue(
        "https://www.atlassian.com/git",
      );
      expect(screen.getByTestId("ArticlesForm-explanation")).toHaveValue(
        "Overview of git workflows",
      );
      expect(screen.getByTestId("ArticlesForm-email")).toHaveValue(
        "vishwath@ucsb.edu",
      );
      expect(screen.getByTestId("ArticlesForm-dateAdded")).toHaveValue(
        "2022-04-21T09:30",
      );
      expect(screen.getByTestId("ArticlesForm-submit")).toHaveTextContent(
        "Update",
      );

      editAndSubmit();

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Git Workflows",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].url).toBe("/api/articles");
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Git Workflows",
          url: "https://www.atlassian.com/git/tutorials",
          explanation: "Comparing git workflows",
          email: "phtcon@ucsb.edu",
          dateAdded: "2022-05-01T10:00",
        }),
      ); // posted object
    });

    test("in storybook mode, does not redirect after Update", async () => {
      renderPage(true);

      await screen.findByTestId("ArticlesForm-id");

      editAndSubmit();

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByText("Edit Article")).toBeInTheDocument();
    });
  });
});
