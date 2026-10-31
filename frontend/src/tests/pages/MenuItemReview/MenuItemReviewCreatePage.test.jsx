import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewCreatePage from "main/pages/MenuItemReview/MenuItemReviewCreatePage";
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
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("MenuItemReviewCreatePage tests", () => {
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

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item Id")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /menuitemreview", async () => {
    const queryClient = new QueryClient();
    const menuItemReview = {
      id: 3,
      itemId: 1,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-01-02T12:00",
      comments: "Pretty good, but a bit too salty for my taste.",
    };

    axiosMock.onPost("/api/MenuItemReview/post").reply(202, menuItemReview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item Id")).toBeInTheDocument();
    });

    const itemIdField = screen.getByLabelText("Item Id");
    const reviewerEmailField = screen.getByLabelText("Reviewer Email");
    const starsField = screen.getByLabelText("Stars");
    const dateReviewedField = screen.getByLabelText(
      "Date Reviewed (iso format)",
    );
    const commentsField = screen.getByLabelText("Comments");
    const createButton = screen.getByText("Create");

    expect(itemIdField).toBeInTheDocument();
    expect(reviewerEmailField).toBeInTheDocument();
    expect(starsField).toBeInTheDocument();
    expect(dateReviewedField).toBeInTheDocument();
    expect(commentsField).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();

    fireEvent.change(itemIdField, { target: { value: "1" } });
    fireEvent.change(reviewerEmailField, {
      target: { value: "cgaucho@ucsb.edu" },
    });
    fireEvent.change(starsField, { target: { value: "3" } });
    fireEvent.change(dateReviewedField, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(commentsField, {
      target: { value: "Pretty good, but a bit too salty for my taste." },
    });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: 1,
      reviewerEmail: "cgaucho@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-01-02T12:00",
      comments: "Pretty good, but a bit too salty for my taste.",
    });

    expect(mockToast).toBeCalledWith(
      "New menuItemReview Created - id: 3 itemId: 1",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/menuitemreview" });
  });
});
