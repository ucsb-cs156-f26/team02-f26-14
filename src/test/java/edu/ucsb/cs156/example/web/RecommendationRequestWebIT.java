package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class RecommendationRequestWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_recommendation_request() throws Exception {

    setupUser(true);

    page.getByText("RecommendationRequests").click();

    page.getByText("Create RecommendationRequest").click();

    assertThat(page.getByText("Create New RecommendationRequest")).isVisible();

    String explanation = "Requesting a letter of recommendation " + System.currentTimeMillis();

    page.getByTestId("RecommendationRequestForm-requesterEmail").fill("student@ucsb.edu");

    page.getByTestId("RecommendationRequestForm-professorEmail").fill("professor@ucsb.edu");

    page.getByTestId("RecommendationRequestForm-explanation").fill(explanation);

    page.getByTestId("RecommendationRequestForm-dateRequested").fill("2026-10-30T10:00");

    page.getByTestId("RecommendationRequestForm-dateNeeded").fill("2026-11-15T10:00");

    page.getByTestId("RecommendationRequestForm-submit").click();

    assertThat(page.getByTestId("RecommendationRequestTable-cell-row-0-col-explanation"))
        .hasText(explanation);
  }
}
