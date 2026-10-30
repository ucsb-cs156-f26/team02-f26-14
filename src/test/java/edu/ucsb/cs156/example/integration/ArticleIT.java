package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.Article;
import edu.ucsb.cs156.example.repositories.ArticleRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.services.CurrentUserService;
import edu.ucsb.cs156.example.services.GrantedAuthoritiesService;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("integration")
@Import(TestConfig.class)
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class ArticleIT {
  @Autowired public CurrentUserService currentUserService;

  @Autowired public GrantedAuthoritiesService grantedAuthoritiesService;

  @Autowired ArticleRepository articleRepository;

  @Autowired public MockMvc mockMvc;

  @Autowired public ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"USER"})
  @Test
  public void test_that_logged_in_user_can_get_by_id_when_the_id_exists() throws Exception {
    // arrange

    Article article =
        Article.builder()
            .title("Spring Boot Testing")
            .url("https://spring.io/guides/gs/testing-web")
            .explanation("Guide to testing the web layer")
            .email("cgaucho@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2026-10-15T12:00:00"))
            .build();

    articleRepository.save(article);

    // act
    MvcResult response =
        mockMvc.perform(get("/api/articles?id=1")).andExpect(status().isOk()).andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(article);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_article() throws Exception {
    // arrange

    Article article1 =
        Article.builder()
            .id(1L)
            .title("Playwright")
            .url("https://playwright.dev")
            .explanation("End-to-end testing tool")
            .email("admingaucho@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2026-10-15T12:00:00"))
            .build();

    assertEquals(0, articleRepository.count());

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/articles/post")
                    .param("title", "Playwright")
                    .param("url", "https://playwright.dev")
                    .param("explanation", "End-to-end testing tool")
                    .param("email", "admingaucho@ucsb.edu")
                    .param("dateAdded", "2026-10-15T12:00:00")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String expectedJson = mapper.writeValueAsString(article1);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);

    Optional<Article> saved = articleRepository.findById(1L);
    assertTrue(saved.isPresent());
    assertEquals(article1, saved.get());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_an_article() throws Exception {
    // arrange

    Article article =
        Article.builder()
            .title("Old Article")
            .url("https://example.org/old")
            .explanation("To be deleted")
            .email("admingaucho@ucsb.edu")
            .dateAdded(LocalDateTime.parse("2026-10-15T12:00:00"))
            .build();

    articleRepository.save(article);
    assertTrue(articleRepository.findById(1L).isPresent());

    // act
    MvcResult response =
        mockMvc
            .perform(delete("/api/articles?id=1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    Map<String, Object> json = responseToJson(response);
    assertEquals("Article with id 1 deleted", json.get("message"));
    assertFalse(articleRepository.findById(1L).isPresent());
  }

  @SuppressWarnings("unchecked")
  private Map<String, Object> responseToJson(MvcResult result) throws Exception {
    String responseString = result.getResponse().getContentAsString();
    return mapper.readValue(responseString, Map.class);
  }
}
