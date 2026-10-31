import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Routes, Route } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("HelpRequestEditPage tests", () => {
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
      .onGet("/api/helprequest")
      .reply(200, helpRequestFixtures.oneHelpRequest);
  };

  const renderPage = (storybook = false) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/helprequest/edit/1"]}>
          <Routes>
            <Route
              path="/helprequest/edit/:id"
              element={<HelpRequestEditPage storybook={storybook} />}
            />
            <Route path="/helprequest" element={<div>HelpRequest Index</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  test("Renders edit form with existing HelpRequest", async () => {
    setup();
    renderPage();

    expect(await screen.findByText("Edit HelpRequest")).toBeInTheDocument();

    expect(
      await screen.findByRole("button", { name: "Update" }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        axiosMock.history.get.some(
          (request) =>
            request.url === "/api/helprequest" && request.params?.id === "1",
        ),
      ).toBe(true);
    });
  });

  test("Updates HelpRequest successfully", async () => {
    setup();

    axiosMock
      .onPut("/api/helprequest")
      .reply(200, helpRequestFixtures.oneHelpRequest);

    renderPage(true);

    const updateButton = await screen.findByRole("button", {
      name: "Update",
    });

    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    const request = axiosMock.history.put[0];

    expect(request.url).toBe("/api/helprequest");
    expect(request.method).toBe("put");
    expect(request.params).toEqual({
      id: helpRequestFixtures.oneHelpRequest.id,
    });

    expect(JSON.parse(request.data)).toEqual({
      requesterEmail: helpRequestFixtures.oneHelpRequest.requesterEmail,
      teamId: helpRequestFixtures.oneHelpRequest.teamId,
      tableOrBreakoutRoom:
        helpRequestFixtures.oneHelpRequest.tableOrBreakoutRoom,
      requestTime: helpRequestFixtures.oneHelpRequest.requestTime,
      explanation: helpRequestFixtures.oneHelpRequest.explanation,
      solved: helpRequestFixtures.oneHelpRequest.solved,
    });
  });

  test("Redirects to Index after successful update", async () => {
    setup();

    axiosMock
      .onPut("/api/helprequest")
      .reply(200, helpRequestFixtures.oneHelpRequest);

    renderPage(false);

    const updateButton = await screen.findByRole("button", {
      name: "Update",
    });

    await userEvent.click(updateButton);

    await waitFor(() => {
      expect(axiosMock.history.put).toHaveLength(1);
    });

    expect(await screen.findByText("HelpRequest Index")).toBeInTheDocument();
  });
});
