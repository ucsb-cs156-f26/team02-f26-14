import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBDiningCommonsMenuItemCreatePage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemCreatePage";
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
    toast: vi.fn((message) => mockToast(message)),
  };
});

const mockNavigate = vi.fn();

vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((props) => {
      mockNavigate(props);
      return null;
    }),
  };
});

describe("UCSBDiningCommonsMenuItemCreatePage tests", () => {
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

  const renderPage = () => {
    const queryClient = new QueryClient();

  const renderPage = () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBDiningCommonsMenuItemCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    return queryClient;
  };

  test("renders the create form", async () => {
    renderPage();

    expect(
      await screen.findByLabelText("Dining Commons Code"),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Station")).toBeInTheDocument();
    expect(screen.getByText("Create")).toBeInTheDocument();
  });

  test("submits valid data and redirects", async () => {
    const item = {
      id: 1,
      diningCommonsCode: "DLG",
      name: "Pasta",
      station: "Pasta",
    };

    axiosMock.onPost("/api/UCSBDiningCommonsMenuItem/post").reply(202, item);

    const queryClient = renderPage();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    fireEvent.change(await screen.findByLabelText("Dining Commons Code"), {
      target: { value: "DLG" },
    });

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Pasta" },
    });

    fireEvent.change(screen.getByLabelText("Station"), {
      target: { value: "Pasta" },
    });

    fireEvent.click(screen.getByText("Create"));

    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
    });

    expect(axiosMock.history.post[0].params).toEqual({
      diningCommonsCode: "DLG",
      name: "Pasta",
      station: "Pasta",
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/diningcommonsmenuitem",
      });
    });
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        "New UCSBDiningCommonsMenuItem Created - id: 1 name: Pasta",
      );
    });
    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["/api/UCSBDiningCommonsMenuItem/all"],
      });
    });
  });

  test("does not submit invalid data", async () => {
    renderPage();

    fireEvent.change(await screen.findByLabelText("Dining Commons Code"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByText("Create"));

    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Station is required.")).toBeInTheDocument();

    expect(axiosMock.history.post.length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
