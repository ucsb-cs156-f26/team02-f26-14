import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { vi, beforeEach, describe, test, expect } from "vitest";

import HelpRequestCreatePage from "main/pages/HelpRequest/HelpRequestCreatePage";
import HelpRequestEditPage from "main/pages/HelpRequest/HelpRequestEditPage";
import HelpRequestIndexPage from "main/pages/HelpRequest/HelpRequestIndexPage";

import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

vi.mock("main/utils/useBackend", () => ({
  useBackend: vi.fn(),
  useBackendMutation: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

vi.mock("main/layouts/BasicLayout/BasicLayout", () => ({
  default: ({ children }) => <div>{children}</div>,
}));

vi.mock("main/components/HelpRequest/HelpRequestForm", () => ({
  default: () => <div>Mock HelpRequest Form</div>,
}));

vi.mock("main/components/HelpRequest/HelpRequestTable", () => ({
  default: () => <div>Mock HelpRequest Table</div>,
}));

vi.mock("main/utils/useCurrentUser", () => ({
  useCurrentUser: vi.fn(() => ({ roles: [] })),
  hasRole: vi.fn(() => false),
}));

describe("HelpRequest mutation coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useBackend.mockReturnValue({
      data: {
        id: 1,
        requesterEmail: "student@ucsb.edu",
      },
    });

    useBackendMutation.mockReturnValue({
      isSuccess: false,
      mutate: vi.fn(),
    });
  });

  const renderRoute = (element, path, initialPath) => {
    return render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path={path} element={element} />
          <Route
            path="/helprequest"
            element={<div>HelpRequest Index Destination</div>}
          />
        </Routes>
      </MemoryRouter>,
    );
  };

  test("Create page uses correct mutation configuration", () => {
    renderRoute(
      <HelpRequestCreatePage />,
      "/helprequest/create",
      "/helprequest/create",
    );

    expect(useBackendMutation).toHaveBeenCalledTimes(1);

    const [requestBuilder, options, invalidationKeys] =
      useBackendMutation.mock.calls[0];

    expect(
      requestBuilder({
        requesterEmail: "student@ucsb.edu",
        teamId: "14",
        tableOrBreakoutRoom: "Table",
        requestTime: "2026-10-28T13:15",
        explanation: "Help needed",
        solved: false,
      }),
    ).toEqual({
      url: "/api/helprequest/post",
      method: "POST",
      params: {
        requesterEmail: "student@ucsb.edu",
        teamId: "14",
        tableOrBreakoutRoom: "Table",
        requestTime: "2026-10-28T13:15",
        explanation: "Help needed",
        solved: false,
      },
    });

    expect(invalidationKeys).toEqual(["/api/helprequest/all"]);
    expect(options.onSuccess).toEqual(expect.any(Function));

    options.onSuccess({ id: 42 });

    expect(toast).toHaveBeenCalledWith("New HelpRequest Created - id: 42");
  });

  test("Create page redirects on success with default storybook prop", () => {
    useBackendMutation.mockReturnValue({
      isSuccess: true,
      mutate: vi.fn(),
    });

    renderRoute(
      <HelpRequestCreatePage />,
      "/helprequest/create",
      "/helprequest/create",
    );

    expect(
      screen.getByText("HelpRequest Index Destination"),
    ).toBeInTheDocument();
  });

  test("Edit page uses correct query and mutation configuration", () => {
    renderRoute(
      <HelpRequestEditPage />,
      "/helprequest/edit/:id",
      "/helprequest/edit/1",
    );

    expect(useBackend).toHaveBeenCalledWith(["/api/helprequest?id=1"], {
      method: "GET",
      url: "/api/helprequest",
      params: { id: "1" },
    });

    expect(useBackendMutation).toHaveBeenCalledTimes(1);

    const [requestBuilder, options, invalidationKeys] =
      useBackendMutation.mock.calls[0];

    const data = {
      id: 1,
      requesterEmail: "student@ucsb.edu",
      teamId: "14",
      tableOrBreakoutRoom: "Table",
      requestTime: "2026-10-28T13:15",
      explanation: "Updated explanation",
      solved: true,
    };

    expect(requestBuilder(data)).toEqual({
      url: "/api/helprequest",
      method: "PUT",
      params: { id: 1 },
      data: {
        requesterEmail: "student@ucsb.edu",
        teamId: "14",
        tableOrBreakoutRoom: "Table",
        requestTime: "2026-10-28T13:15",
        explanation: "Updated explanation",
        solved: true,
      },
    });

    expect(invalidationKeys).toEqual(["/api/helprequest?id=1"]);
    expect(options.onSuccess).toEqual(expect.any(Function));

    options.onSuccess({ id: 42 });

    expect(toast).toHaveBeenCalledWith("HelpRequest Updated - id: 42");
  });

  test("Edit page redirects on success with default storybook prop", () => {
    useBackendMutation.mockReturnValue({
      isSuccess: true,
      mutate: vi.fn(),
    });

    renderRoute(
      <HelpRequestEditPage />,
      "/helprequest/edit/:id",
      "/helprequest/edit/1",
    );

    expect(
      screen.getByText("HelpRequest Index Destination"),
    ).toBeInTheDocument();
  });

  test("Index page uses correct query configuration", () => {
    useBackend.mockReturnValue({ data: [] });

    renderRoute(<HelpRequestIndexPage />, "/helprequest", "/helprequest");

    expect(useBackend).toHaveBeenCalledWith(
      ["/api/helprequest/all"],
      {
        method: "GET",
        url: "/api/helprequest/all",
      },
      [],
    );
  });
});
