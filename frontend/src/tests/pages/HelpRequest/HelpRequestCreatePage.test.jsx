import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("HelpRequestCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setup = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    axiosMock
      .onPost("/api/helprequest/post")
      .reply(200, helpRequestFixtures.oneHelpRequest);
  };

  const renderPage = (storybook = false) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/helprequest/create"]}>
          <Routes>
            <Route
              path="/helprequest/create"
              element={<HelpRequestCreatePage storybook={storybook} />}
            />
            <Route
              path="/helprequest"
              element={<div>HelpRequest Index</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  const fillForm = async (user) => {
    await user.type(
      screen.getByTestId("HelpRequestForm-requesterEmail"),
      "student1@ucsb.edu",
    );
    await user.type(screen.getByTestId("HelpRequestForm-teamId"), "14");
    await user.type(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
      "Table",
    );
    await user.type(
      screen.getByTestId("HelpRequestForm-requestTime"),
      "2026-10-28T13:15",
    );
    await user.type(
      screen.getByTestId("HelpRequestForm-explanation"),
      "Need help fixing a Java error.",
    );
  };

  test("Renders Create page and form", async () => {
    setup();
    renderPage();

    expect(
      await screen.findByText("Create New HelpRequest"),
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  test("Creates HelpRequest and redirects to Index", async () => {
    setup();
    renderPage();

    const user = userEvent.setup();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    const request = axiosMock.history.post[0];

    expect(request.url).toBe("/api/helprequest/post");
    expect(request.params).toMatchObject({
      requesterEmail: "student1@ucsb.edu",
      teamId: "14",
      tableOrBreakoutRoom: "Table",
      explanation: "Need help fixing a Java error.",
      solved: false,
    });

    expect(await screen.findByText("HelpRequest Index")).toBeInTheDocument();
  });

  test("Creates HelpRequest without redirect in Storybook", async () => {
    setup();
    renderPage(true);

    const user = userEvent.setup();

    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    expect(screen.getByText("Create New HelpRequest")).toBeInTheDocument();
  });
});
