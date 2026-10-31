import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesForm from "main/components/Articles/ArticlesForm";
import { articlesFixtures } from "fixtures/articlesFixtures";
import { BrowserRouter as Router } from "react-router";
import { expect } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticlesForm tests", () => {
  const testId = "ArticlesForm";
  const expectedHeaders = [
    "Title",
    "URL",
    "Explanation",
    "Email",
    "Date Added (iso format)",
  ];

  test("renders correctly with no initialContents", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    expect(screen.queryByText("Id")).not.toBeInTheDocument();
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <Router>
        <ArticlesForm initialContents={articlesFixtures.oneArticle} />
      </Router>,
    );
    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(screen.getByText("Id")).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("1");
    expect(screen.getByTestId(`${testId}-id`)).toBeDisabled();
    expect(screen.getByTestId(`${testId}-title`)).toHaveValue(
      articlesFixtures.oneArticle.title,
    );
    expect(screen.getByTestId(`${testId}-url`)).toHaveValue(
      articlesFixtures.oneArticle.url,
    );
    expect(screen.getByTestId(`${testId}-explanation`)).toHaveValue(
      articlesFixtures.oneArticle.explanation,
    );
    expect(screen.getByTestId(`${testId}-email`)).toHaveValue(
      articlesFixtures.oneArticle.email,
    );
    expect(screen.getByTestId(`${testId}-dateAdded`)).toHaveValue(
      "2022-04-20T12:00",
    );
  });

  test("uses the buttonLabel prop when passed", async () => {
    render(
      <Router>
        <ArticlesForm buttonLabel="Update" />
      </Router>,
    );
    expect(await screen.findByText(/Update/)).toBeInTheDocument();
    expect(screen.queryByText(/Create/)).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    const cancelButton = await screen.findByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("Correct error messages on missing input", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.click(submitButton);

    expect(await screen.findByText(/Title is required./)).toBeInTheDocument();
    expect(screen.getByText(/URL is required./)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required./)).toBeInTheDocument();
    expect(screen.getByText(/Email is required./)).toBeInTheDocument();
    expect(screen.getByText(/Date Added is required./)).toBeInTheDocument();
  });

  test("Correct error messages on bad input", async () => {
    render(
      <Router>
        <ArticlesForm />
      </Router>,
    );
    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "a".repeat(256) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "not-a-url" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "not-an-email" },
    });
    fireEvent.click(submitButton);

    expect(
      await screen.findByText(/Max length 255 characters/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/URL must start with http:\/\/ or https:\/\//),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Email must be a valid email address/),
    ).toBeInTheDocument();
  });

  test("No error messages on good input", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <Router>
        <ArticlesForm submitAction={mockSubmitAction} />
      </Router>,
    );
    const submitButton = await screen.findByTestId(`${testId}-submit`);

    fireEvent.change(screen.getByTestId(`${testId}-title`), {
      target: { value: "a".repeat(255) },
    });
    fireEvent.change(screen.getByTestId(`${testId}-url`), {
      target: { value: "https://www.ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "UCSB home page" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-email`), {
      target: { value: "vishwath@ucsb.edu" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateAdded`), {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Max length 255 characters/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/URL must start with http:\/\/ or https:\/\//),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Email must be a valid email address/),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/is required/)).not.toBeInTheDocument();
  });
});
