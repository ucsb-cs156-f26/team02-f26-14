import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";

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

describe("UCSBOrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

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

  test("renders the create form", async () => {
    setupUserOnly();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByRole("heading", {
        name: "Create New UCSB Organization",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Organization Code")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Short Organization Name"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organization Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Inactive")).toBeInTheDocument();
  });

  test("submits valid data and redirects to the organization list", async () => {
    setupUserOnly();

    const organization = ucsbOrganizationFixtures.oneOrganization;

    axiosMock.onPost("/api/ucsborganization/post").reply(200, organization);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.change(await screen.findByLabelText("Organization Code"), {
      target: { value: organization.orgCode },
    });
    fireEvent.change(screen.getByLabelText("Short Organization Name"), {
      target: { value: organization.orgTranslationShort },
    });
    fireEvent.change(screen.getByLabelText("Organization Name"), {
      target: { value: organization.orgTranslation },
    });

    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

    await waitFor(() => {
      expect(axiosMock.history.post).toHaveLength(1);
    });

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: organization.orgCode,
      orgTranslationShort: organization.orgTranslationShort,
      orgTranslation: organization.orgTranslation,
      inactive: false,
    });

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        `New UCSB organization created - code: ${organization.orgCode}`,
      );
      expect(mockNavigate).toHaveBeenCalledWith({
        to: "/ucsborganization",
      });
    });
  });

  test("does not submit when required fields are blank", async () => {
    setupUserOnly();

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByTestId("UCSBOrganizationForm-submit"));

    expect(
      await screen.findByText("Organization Code is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Short Organization Name is required."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Organization Name is required."),
    ).toBeInTheDocument();

    expect(axiosMock.history.post).toHaveLength(0);
  });
});
