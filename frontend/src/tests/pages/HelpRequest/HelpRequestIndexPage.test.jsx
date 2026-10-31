import { render, screen, waitFor } from "@testing-library/react";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("HelpRequestIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setup = (currentUser) => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock.onGet("/api/currentUser").reply(200, currentUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    axiosMock
      .onGet("/api/helprequest/all")
      .reply(200, helpRequestFixtures.threeHelpRequest);
  };

  const renderPage = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <HelpRequestIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("Renders HelpRequest table for ordinary user", async () => {
    setup(apiCurrentUserFixtures.userOnly);
    renderPage();

    expect(await screen.findByText("Help Requests")).toBeInTheDocument();

    expect(screen.getByTestId("HelpRequestTable")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        axiosMock.history.get.some(
          (request) =>
            request.url === "/api/helprequest/all" && request.method === "get",
        ),
      ).toBe(true);
    });

    expect(screen.queryByText("Create HelpRequest")).not.toBeInTheDocument();
  });

  test("Shows Create HelpRequest button for admin", async () => {
    setup(apiCurrentUserFixtures.adminUser);
    renderPage();

    expect(await screen.findByText("Help Requests")).toBeInTheDocument();

    const createButton = await screen.findByRole("button", {
      name: "Create HelpRequest",
    });

    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute("href", "/helprequest/create");
    expect(createButton).toHaveStyle({ float: "right" });
  });
});
