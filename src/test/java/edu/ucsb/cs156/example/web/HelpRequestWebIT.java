package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import edu.ucsb.cs156.example.entities.HelpRequest;
import edu.ucsb.cs156.example.repositories.HelpRequestRepository;
import java.time.LocalDateTime;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestWebIT extends WebTestCase {

  @Autowired HelpRequestRepository helpRequestRepository;

  @Test
  public void admin_user_can_view_existing_help_request() throws Exception {

    String email1 = "student1@ucsb.edu";

    HelpRequest request1 =
        HelpRequest.builder()
            .requesterEmail(email1)
            .teamId("team01")
            .tableOrBreakoutRoom("Table 3")
            .requestTime(LocalDateTime.parse("2026-10-21T10:00:00"))
            .explanation("Need help debugging Java")
            .solved(false)
            .build();

    helpRequestRepository.save(request1);

    setupUser(true);

    page.getByText("Help Requests").click();

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail")).hasText(email1);

    assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation"))
        .hasText("Need help debugging Java");
  }

  @Test
  public void regular_user_cannot_create_help_request() throws Exception {

    setupUser(false);

    page.getByText("Help Requests").click();

    assertThat(page.getByText("Create HelpRequest")).not().isVisible();
  }

  @Test
  public void admin_user_can_see_create_help_request_button() throws Exception {

    setupUser(true);

    page.getByText("Help Requests").click();

    assertThat(page.getByText("Create HelpRequest")).isVisible();
  }
}
