import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";

vi.mock("react-toastify", async (importOriginal) => ({
  ...(await importOriginal()),
  toast: vi.fn(),
}));

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemTable tests", () => {
  const testId = "UCSBDiningCommonsMenuItemTable";

  const expectedHeaders = ["ID", "Dining Commons Code", "Name", "Station"];

  const expectedFields = ["id", "diningCommonsCode", "name", "station"];

  const items =
    ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems;

  const axiosMock = new AxiosMockAdapter(axios);

  const renderTable = (currentUser, data = items) => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemTable
            ucsbDiningCommonsMenuItems={data}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  afterEach(() => {
    axiosMock.reset();
    vi.clearAllMocks();
  });

  afterAll(() => {
    axiosMock.restore();
  });

  test("renders empty table correctly", () => {
    renderTable(currentUserFixtures.userOnly, []);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("renders the expected headers and table content", () => {
    renderTable(currentUserFixtures.userOnly);

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    const expectedRows = [
      ["1", "DLG", "Pasta", "Pasta"],
      ["2", "ORT", "Pizza", "Pizza"],
      ["3", "CAR", "Salad", "Salad Bar"],
    ];

    expectedRows.forEach((row, rowIndex) => {
      expectedFields.forEach((field, fieldIndex) => {
        expect(
          screen.getByTestId(`${testId}-cell-row-${rowIndex}-col-${field}`),
        ).toHaveTextContent(row[fieldIndex]);
      });
    });
  });

  test("regular user does not see Edit or Delete buttons", () => {
    renderTable(currentUserFixtures.userOnly);

    expect(screen.getByTestId(testId)).toBeInTheDocument();

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-header-${field}`),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Edit-button`),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByTestId(`${testId}-cell-row-0-col-Delete-button`),
    ).not.toBeInTheDocument();
  });

  test("admin user sees Edit and Delete buttons", () => {
    renderTable(currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Edit button navigates to the correct page", () => {
    renderTable(currentUserFixtures.adminUser);

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );

    fireEvent.click(editButton);

    expect(mockedNavigate).toHaveBeenCalledWith(
      "/diningcommonsmenuitem/edit/1",
    );
  });

  test("Delete button calls the correct endpoint", async () => {
    axiosMock.onDelete("/api/UCSBDiningCommonsMenuItem").reply(200, {
      message: "UCSBDiningCommonsMenuItem with id 1 deleted",
    });

    renderTable(currentUserFixtures.adminUser);

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });

    expect(axiosMock.history.delete[0].url).toBe(
      "/api/UCSBDiningCommonsMenuItem",
    );

    expect(axiosMock.history.delete[0].params).toEqual({
      id: 1,
    });

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        "UCSBDiningCommonsMenuItem with id 1 deleted",
      );
    });
  });
});
