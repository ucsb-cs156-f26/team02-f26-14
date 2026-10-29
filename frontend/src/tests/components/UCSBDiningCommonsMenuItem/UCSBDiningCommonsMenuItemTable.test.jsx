import { render, screen } from "@testing-library/react";

import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";

import { ucsbDiningCommonsMenuItemFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";

describe("UCSBDiningCommonsMenuItemTable tests", () => {
  const testId = "UCSBDiningCommonsMenuItemTable";

  const expectedHeaders = ["ID", "Dining Commons Code", "Name", "Station"];

  const expectedFields = ["id", "diningCommonsCode", "name", "station"];

  test("renders empty table correctly", () => {
    render(<UCSBDiningCommonsMenuItemTable ucsbDiningCommonsMenuItems={[]} />);

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
    render(
      <UCSBDiningCommonsMenuItemTable
        ucsbDiningCommonsMenuItems={
          ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems
        }
      />,
    );

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

  test("renders the table with all four columns", () => {
    render(
      <UCSBDiningCommonsMenuItemTable
        ucsbDiningCommonsMenuItems={
          ucsbDiningCommonsMenuItemFixtures.threeUCSBDiningCommonsMenuItems
        }
      />,
    );

    expect(screen.getByTestId(testId)).toBeInTheDocument();

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-header-${field}`),
      ).toBeInTheDocument();
    });
  });
});
