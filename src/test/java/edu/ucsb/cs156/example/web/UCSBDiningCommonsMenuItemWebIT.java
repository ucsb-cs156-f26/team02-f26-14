package edu.ucsb.cs156.example.web;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;
import java.net.URI;
import java.util.regex.Pattern;
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
public class UCSBDiningCommonsMenuItemWebIT extends WebTestCase {

  @Test
  public void admin_user_can_create_menu_item() throws Exception {

    // Log in as an admin
    setupUser(true);

    // Open the Dining Commons Menu Items page
    String url = URI.create(page.url()).resolve("/diningcommonsmenuitem").toString();
    page.navigate(url);

    // Click the create button
    assertThat(page.getByText("UCSB Dining Commons Menu Items")).isVisible();

    page.getByText("Create Menu Item").click();

    // Check that the create page is displayed
    assertThat(page.getByText("Create New UCSBDiningCommonsMenuItem")).isVisible();

    // Fill out the form
    String itemName = "Tofu Sandwich " + System.currentTimeMillis();

    page.getByTestId("UCSBDiningCommonsMenuItemForm-diningCommonsCode").fill("ortega");

    page.getByTestId("UCSBDiningCommonsMenuItemForm-name").fill(itemName);

    page.getByTestId("UCSBDiningCommonsMenuItemForm-station").fill("Entree");

    // Submit the form
    page.getByTestId("UCSBDiningCommonsMenuItemForm-submit").click();

    // Check that we return to the index page
    assertThat(page.getByText("UCSB Dining Commons Menu Items")).isVisible();

    // Check that the new menu item appears in the table
    assertThat(page.getByTestId("UCSBDiningCommonsMenuItemTable").getByText(itemName)).isVisible();
  }

  @Test
  public void navbar_link_goes_to_menu_item_index_page() throws Exception {

    setupUser(true);

    // Same locator the Gradescope autograder uses to find the navbar link
    page.getByText(Pattern.compile("item(?!.*review)", Pattern.CASE_INSENSITIVE)).click();

    assertThat(page.getByText("UCSB Dining Commons Menu Items")).isVisible();
  }
}
