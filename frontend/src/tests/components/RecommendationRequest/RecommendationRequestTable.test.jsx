import { render, screen } from "@testing-library/react";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

describe("RecommendationRequestTable tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "ID",
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested",
    "Date Needed",
    "Done",
  ];

  const expectedFields = [
    "id",
    "requesterEmail",
    "professorEmail",
    "explanation",
    "dateRequested",
    "dateNeeded",
    "done",
  ];

  const testId = "RecommendationRequestTable";

  test("renders empty table correctly", () => {
    // arrange
    const recommendationRequests = [];

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <RecommendationRequestTable
          recommendationRequests={recommendationRequests}
        />
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const fieldElement = screen.queryByTestId(
        `${testId}-cell-row-0-col-${field}`,
      );
      expect(fieldElement).not.toBeInTheDocument();
    });
  });

  test("renders all expected headers and recommendation request data", () => {
    // arrange
    const recommendationRequests = recommendationRequestFixtures.threeRequests;

    // act
    render(
      <QueryClientProvider client={queryClient}>
        <RecommendationRequestTable
          recommendationRequests={recommendationRequests}
        />
      </QueryClientProvider>,
    );

    // assert
    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-${field}`),
      ).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-requesterEmail`),
    ).toHaveTextContent("student1@example.com");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-professorEmail`),
    ).toHaveTextContent("professor1@example.com");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-explanation`),
    ).toHaveTextContent("Requesting a recommendation for graduate school");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateRequested`),
    ).toHaveTextContent("2026-10-21T10:00:00");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-dateNeeded`),
    ).toHaveTextContent("2026-11-15T00:00:00");

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-done`),
    ).toHaveTextContent("false");

    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-done`),
    ).toHaveTextContent("true");
  });
});
