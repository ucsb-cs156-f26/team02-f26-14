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
public class UCSBOrganizationWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_a_new_organization() throws Exception {
    setupUser(true);

    page.getByText("UCSBOrganization").click();

    page.getByText("Create UCSB Organization").click();
    assertThat(page.getByText("Create New UCSB Organization")).isVisible();

    page.getByTestId("UCSBOrganizationForm-orgCode").fill("E2E");
    page.getByTestId("UCSBOrganizationForm-orgTranslationShort").fill("E2E Organization");
    page.getByTestId("UCSBOrganizationForm-orgTranslation").fill("End to End Test Organization");

    page.getByTestId("UCSBOrganizationForm-submit").click();

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgCode")).hasText("E2E");

    assertThat(page.getByTestId("UCSBOrganizationTable-cell-row-0-col-orgTranslation"))
        .hasText("End to End Test Organization");
  }
}
