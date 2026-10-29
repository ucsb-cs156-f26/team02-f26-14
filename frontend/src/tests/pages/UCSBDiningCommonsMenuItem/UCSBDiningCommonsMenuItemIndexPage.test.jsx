import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UCSBDiningCommonsMenuItemIndexPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemIndexPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("UCSBDiningCommonsMenuItemIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "UCSBDiningCommonsMenuItemTable";
  const endpoint = "/api/UCSBDiningCommonsMenuItem/all";

  const setupUser = (user) => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock.onGet("/api/currentUser").reply(200, user);
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
          <UCSBDiningCommonsMenuItemIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  afterAll(() => {
    axiosMock.restore();
  });

  test("renders Create button for admin user", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);
    axiosMock.onGet(endpoint).reply(200, []);

    renderPage();

    const button = await screen.findByText("Create Menu Item");

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("href", "/diningcommonsmenuitem/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three menu items for regular user", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet(endpoint)
      .reply(
        200,
        ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems,
      );

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-name`),
      ).toHaveTextContent("Pasta");
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-name`),
    ).toHaveTextContent("Pizza");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-name`),
    ).toHaveTextContent("Salad");

    expect(screen.queryByText("Create Menu Item")).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders Edit and Delete buttons for admin", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet(endpoint)
      .reply(
        200,
        ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems,
      );

    renderPage();

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).toBeInTheDocument();
  });

  test("deletes a menu item and refreshes the table", async () => {
    setupUser(apiCurrentUserFixtures.adminUser);

    const items =
      ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems;

    axiosMock.onGet(endpoint).replyOnce(200, items);
    axiosMock.onGet(endpoint).reply(200, items.slice(1));

    axiosMock.onDelete("/api/UCSBDiningCommonsMenuItem").reply(200, {
      message: "UCSBDiningCommonsMenuItem with id 1 deleted",
    });

    renderPage();

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].params).toEqual({
      id: 1,
    });

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-id`),
      ).toHaveTextContent("2");
    });
  });
  test("reports GET method when backend request fails", async () => {
    setupUser(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet(endpoint).timeout();

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      renderPage();

      await waitFor(() => {
        const messages = consoleSpy.mock.calls.map((call) => String(call[0]));

        expect(
          messages.some((message) =>
            message.includes(
              "Error communicating with backend via GET on /api/UCSBDiningCommonsMenuItem/all",
            ),
          ),
        ).toBe(true);
      });
    } finally {
      consoleSpy.mockRestore();
    }
  });
});
