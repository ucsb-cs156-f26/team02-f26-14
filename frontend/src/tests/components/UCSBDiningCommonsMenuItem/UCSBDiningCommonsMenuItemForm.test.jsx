import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import UCSBDiningCommonsMenuItemForm from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemForm";
import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBDiningCommonsMenuItemForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["Dining Commons Code", "Name", "Station"];

  const testId = "UCSBDiningCommonsMenuItemForm";

  const renderForm = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBDiningCommonsMenuItemForm submitAction={vi.fn()} {...props} />
        </Router>
      </QueryClientProvider>,
    );
  };

  test("renders correctly with no initialContents", async () => {
    renderForm();

    expect(await screen.findByText("Create")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    renderForm({
      initialContents:
        ucsbDiningCommonsMenuItemFixtures.oneUCSBDiningCommonsMenuItem,
      buttonLabel: "Update",
    });

    expect(await screen.findByText("Update")).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-diningCommonsCode`)).toHaveValue(
      "DLG",
    );
    expect(screen.getByTestId(`${testId}-name`)).toHaveValue("Pasta");
    expect(screen.getByTestId(`${testId}-station`)).toHaveValue("Pasta");
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    mockedNavigate.mockClear();
    renderForm();

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith(-1);
    });
  });

  test("that required field validations are performed", async () => {
    renderForm();

    const submitButton = screen.getByTestId(`${testId}-submit`);
    fireEvent.click(submitButton);

    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Station is required.")).toBeInTheDocument();
  });

  test("that whitespace-only fields are rejected", async () => {
    renderForm();

    fireEvent.change(screen.getByTestId(`${testId}-diningCommonsCode`), {
      target: { value: "   " },
    });

    fireEvent.change(screen.getByTestId(`${testId}-name`), {
      target: { value: "   " },
    });

    fireEvent.change(screen.getByTestId(`${testId}-station`), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    expect(
      await screen.findByText("Dining Commons Code is required."),
    ).toBeInTheDocument();

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Station is required.")).toBeInTheDocument();
  });

  test("submits valid form data", async () => {
    const submitAction = vi.fn();
    renderForm({ submitAction });

    fireEvent.change(screen.getByTestId(`${testId}-diningCommonsCode`), {
      target: { value: "DLG" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-name`), {
      target: { value: "Pasta" },
    });

    fireEvent.change(screen.getByTestId(`${testId}-station`), {
      target: { value: "Pasta" },
    });

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => {
      expect(submitAction).toHaveBeenCalled();
    });

    expect(submitAction.mock.calls[0][0]).toEqual({
      diningCommonsCode: "DLG",
      name: "Pasta",
      station: "Pasta",
    });
  });
});
