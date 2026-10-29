import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router";
import { toast } from "react-toastify";

import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: vi.fn(),
}));

describe("UCSBDiningCommonsMenuItemEditPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const endpoint = "/api/UCSBDiningCommonsMenuItem";
  const item =
    ucsbDiningCommonsMenuItemFixtures.oneUCSBDiningCommonsMenuItem;

  const setupBackend = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = (storybook) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    const rendered = render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={["/diningcommonsmenuitem/edit/1"]}>
          <Routes>
            <Route
              path="/diningcommonsmenuitem/edit/:id"
              element={
                <UCSBDiningCommonsMenuItemEditPage
                  storybook={storybook}
                />
              }
            />
            <Route
              path="/diningcommonsmenuitem"
              element={<div>Index Page</div>}
            />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
       );

    return { ...rendered, queryClient };
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    axiosMock.restore();
  });

  test("loads the existing menu item", async () => {
    setupBackend();
    axiosMock.onGet(endpoint).reply(200, item);

    renderPage();

    expect(await screen.findByLabelText("Name")).toHaveValue("Pasta");
    expect(screen.getByDisplayValue("DLG")).toBeInTheDocument();
    expect(screen.getByText("Edit UCSB Dining Commons Menu Item")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update" })).toBeInTheDocument();

    expect(
    axiosMock.history.get.find((request) => request.url === endpoint).params,
    ).toEqual({ id: "1" });
  });

  test("updates the item and redirects to IndexPage", async () => {
    setupBackend();
    axiosMock.onGet(endpoint).reply(200, item);
    axiosMock.onPut(endpoint).reply(200, {
      ...item,
      name: "Updated Pasta",
    });
    const { queryClient } = renderPage();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    

    const nameInput = await screen.findByLabelText("Name");

    fireEvent.change(nameInput, {
      target: { value: "Updated Pasta" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    await waitFor(() => {
      expect(axiosMock.history.put.length).toBe(1);
    });

    expect(axiosMock.history.put[0].params).toEqual({ id: "1" });
    expect(JSON.parse(axiosMock.history.put[0].data)).toMatchObject({
      diningCommonsCode: "DLG",
      name: "Updated Pasta",
      station: "Pasta",
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        "UCSBDiningCommonsMenuItem Updated - id: 1 name: Updated Pasta",
      );
    });

    expect(await screen.findByText("Index Page")).toBeInTheDocument();
    await waitFor(() => {
    expect(invalidateSpy).toHaveBeenCalledWith({
    queryKey: ["/api/UCSBDiningCommonsMenuItem/all"],
    });
});
  
});

  test("does not submit invalid data", async () => {
    setupBackend();
    axiosMock.onGet(endpoint).reply(200, item);

    renderPage();

    const nameInput = await screen.findByLabelText("Name");

    fireEvent.change(nameInput, {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update" }));

    expect(await screen.findByText("Name is required.")).toBeInTheDocument();
    expect(axiosMock.history.put.length).toBe(0);
  });

  test("uses item id 1 in Storybook mode", async () => {
    setupBackend();
    axiosMock.onGet(endpoint).reply(200, item);

    renderPage(true);

    expect(await screen.findByDisplayValue("DLG")).toBeInTheDocument();
    const itemRequest = axiosMock.history.get.find(
    (request) => request.url === endpoint,
);

expect(itemRequest).toBeDefined();
expect(itemRequest.params).toEqual({ id: 1 });
  });

  test("reports a backend GET error", async () => {
    setupBackend();
    axiosMock.onGet(endpoint).timeout();

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      renderPage();

      await waitFor(() => {
        expect(
          consoleSpy.mock.calls.some((call) =>
            String(call[0]).includes(
              "Error communicating with backend via GET on /api/UCSBDiningCommonsMenuItem",
            ),
          ),
        ).toBe(true);
      });
    } finally {
      consoleSpy.mockRestore();
    }
  });
});