import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

const mockToast = vi.fn();

vi.mock("react-toastify", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    toast: vi.fn((message) => mockToast(message)),
  };
});

describe("UCSBOrganizationIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const testId = "UCSBOrganizationTable";

  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();

    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);

    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders with Create button for admin user", async () => {
    setupAdminUser();

    axiosMock.onGet("/api/ucsborganization/all").reply(200, []);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const createButton = await screen.findByRole("button", {
      name: /create ucsb organization/i,
    });

    expect(createButton).toHaveAttribute("href", "/ucsborganization/create");
    expect(createButton).toHaveAttribute("style", "float: right;");
  });

  test("renders three organizations correctly for regular user", async () => {
    setupUserOnly();

    axiosMock
      .onGet("/api/ucsborganization/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ACM");

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgCode`),
    ).toHaveTextContent("SHPE");

    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgCode`),
    ).toHaveTextContent("WICS");

    expect(
      screen.queryByRole("link", {
        name: /create ucsb organization/i,
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/ucsborganization/all").timeout();

    const restoreConsole = mockConsole();

    try {
      render(
        <QueryClientProvider client={createQueryClient()}>
          <MemoryRouter>
            <UCSBOrganizationIndexPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(
          console.error.mock.calls.some((call) =>
            String(call[0]).includes(
              "Error communicating with backend via GET on /api/ucsborganization/all",
            ),
          ),
        ).toBe(true);
      });

      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).not.toBeInTheDocument();
    } finally {
      restoreConsole();
    }
  });

  test("deletes an organization when admin clicks Delete", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/ucsborganization/all")
      .replyOnce(200, ucsbOrganizationFixtures.threeOrganizations)
      .onGet("/api/ucsborganization/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations.slice(1));

    axiosMock
      .onDelete("/api/ucsborganization")
      .reply(200, "Organization ACM was deleted");

    render(
      <QueryClientProvider client={createQueryClient()}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-orgCode`),
    ).toHaveTextContent("ACM");

    const deleteButton = await screen.findByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith("Organization ACM was deleted");
    });

    await waitFor(() => {
      expect(axiosMock.history.delete).toHaveLength(1);
      expect(axiosMock.history.delete[0].url).toBe("/api/ucsborganization");
      expect(axiosMock.history.delete[0].params).toEqual({
        orgCode: "ACM",
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("ACM")).not.toBeInTheDocument();

      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgCode`),
      ).toHaveTextContent("SHPE");
    });
  });
});
