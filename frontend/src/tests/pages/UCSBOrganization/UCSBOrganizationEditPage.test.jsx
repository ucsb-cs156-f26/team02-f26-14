import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
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
      id: "ACM",
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;

describe("UCSBOrganizationEditPage tests", () => {
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
      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "ACM" } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("renders header but form is not present", async () => {
      const restoreConsole = mockConsole();
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByText("Edit UCSB Organization");
      expect(
        screen.queryByTestId("UCSBOrganizationForm-orgCode"),
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
      axiosMock
        .onGet("/api/ucsborganization", { params: { orgCode: "ACM" } })
        .reply(200, ucsbOrganizationFixtures.oneOrganization);
      axiosMock.onPut("/api/ucsborganization").reply(200, {
        ...ucsbOrganizationFixtures.oneOrganization,
        orgTranslationShort: "Updated ACM",
        orgTranslation: "Updated Association for Computing Machinery",
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    test("is populated with the data provided", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      expect(
        axiosMock.history.get.some(
          (request) =>
            request.url === "/api/ucsborganization" &&
            request.method === "get" &&
            request.params?.orgCode === "ACM",
        ),
      ).toBe(true);

      const orgCodeField = screen.getByTestId("UCSBOrganizationForm-orgCode");
      const shortNameField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      const nameField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );
      const inactiveField = screen.getByTestId("UCSBOrganizationForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationForm-submit");

      expect(orgCodeField).toHaveValue("ACM");
      expect(orgCodeField).toBeDisabled();
      expect(shortNameField).toHaveValue("Association for Computing Machinery");
      expect(nameField).toHaveValue("Association for Computing Machinery");
      expect(inactiveField).not.toBeChecked();
      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(shortNameField, {
        target: { value: "Updated ACM" },
      });
      fireEvent.change(nameField, {
        target: { value: "Updated Association for Computing Machinery" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toHaveBeenCalled());

      expect(mockToast).toHaveBeenCalledWith(
        "UCSB Organization Updated - code: ACM name: Updated Association for Computing Machinery",
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/ucsborganization",
      });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ orgCode: "ACM" });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        orgTranslationShort: "Updated ACM",
        orgTranslation: "Updated Association for Computing Machinery",
        inactive: false,
      });
    });

    test("does not submit invalid blank fields", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      const shortNameField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslationShort",
      );
      const nameField = screen.getByTestId(
        "UCSBOrganizationForm-orgTranslation",
      );

      fireEvent.change(shortNameField, { target: { value: "   " } });
      fireEvent.change(nameField, { target: { value: "" } });
      fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

      expect(
        await screen.findByText("Short Organization Name cannot be blank."),
      ).toBeInTheDocument();
      expect(
        await screen.findByText("Organization Name is required."),
      ).toBeInTheDocument();

      expect(axiosMock.history.put.length).toBe(0);
    });

    test("Cancel does not update the organization", async () => {
      const queryClient = new QueryClient();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationForm-orgCode");

      fireEvent.click(screen.getByTestId("UCSBOrganizationForm-cancel"));

      expect(axiosMock.history.put.length).toBe(0);
      expect(mockToast).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
