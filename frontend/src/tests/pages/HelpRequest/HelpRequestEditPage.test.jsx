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
      .onGet("/api/HelpRequest")
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
            request.url === "/api/HelpRequest" && request.params?.id === "1",
        ),
      ).toBe(true);
    });
  });

  test("Updates HelpRequest successfully", async () => {
    setup();

    axiosMock
      .onPut("/api/HelpRequest")
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

    expect(request.url).toBe("/api/HelpRequest");
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
      .onPut("/api/HelpRequest")
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

  test("Populates the form with existing HelpRequest values", async () => {
    setup();
    renderPage();

    expect(await screen.findByTestId("HelpRequestForm-id")).toHaveValue("1");
    expect(screen.getByTestId("HelpRequestForm-requesterEmail")).toHaveValue(
      helpRequestFixtures.oneHelpRequest.requesterEmail,
    );
    expect(screen.getByTestId("HelpRequestForm-teamId")).toHaveValue("14");
    expect(
      screen.getByTestId("HelpRequestForm-tableOrBreakoutRoom"),
    ).toHaveValue("Table");
    expect(screen.getByTestId("HelpRequestForm-requestTime")).toHaveValue(
      "2026-10-28T13:15",
    );
    expect(screen.getByTestId("HelpRequestForm-explanation")).toHaveValue(
      "Need help fixing a Java error.",
    );
    expect(screen.getByTestId("HelpRequestForm-solved")).not.toBeChecked();
  });

  test("Sends modified field values when updating", async () => {
    setup();
    axiosMock
      .onPut("/api/HelpRequest")
      .reply(200, helpRequestFixtures.oneHelpRequest);

    renderPage(true);

    const explanation = await screen.findByTestId(
      "HelpRequestForm-explanation",
    );

    await userEvent.clear(explanation);
    await userEvent.type(explanation, "Updated explanation");

    await userEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(axiosMock.history.put).toHaveLength(1);
    });

    expect(JSON.parse(axiosMock.history.put[0].data).explanation).toBe(
      "Updated explanation",
    );
  });

  test("Rejects invalid data without sending PUT", async () => {
    setup();
    renderPage();

    const explanation = await screen.findByTestId(
      "HelpRequestForm-explanation",
    );

    await userEvent.clear(explanation);
    await userEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(
      await screen.findByText("Explanation is required."),
    ).toBeInTheDocument();

    expect(axiosMock.history.put).toHaveLength(0);
  });

  test("Cancel returns to the previous page without saving", async () => {
    setup();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter
          initialEntries={["/previous", "/helprequest/edit/1"]}
          initialIndex={1}
        >
          <Routes>
            <Route path="/previous" element={<div>Previous Page</div>} />
            <Route
              path="/helprequest/edit/:id"
              element={<HelpRequestEditPage />}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const explanation = await screen.findByTestId(
      "HelpRequestForm-explanation",
    );

    await userEvent.clear(explanation);
    await userEvent.type(explanation, "Unsaved changes");

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(await screen.findByText("Previous Page")).toBeInTheDocument();
    expect(axiosMock.history.put).toHaveLength(0);
  });
});
