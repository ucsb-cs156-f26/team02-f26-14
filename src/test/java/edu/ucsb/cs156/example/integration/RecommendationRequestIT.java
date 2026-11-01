package edu.ucsb.cs156.example.integration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
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
public class RecommendationRequestIT {

  @Autowired RecommendationRequestRepository repository;

  @Autowired MockMvc mockMvc;

  @Autowired ObjectMapper mapper;

  @MockitoBean UserRepository userRepository;

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void admin_can_create_recommendation_request() throws Exception {

    long countBefore = repository.count();

    MvcResult response =
        mockMvc
            .perform(
                post("/api/RecommendationRequest/post")
                    .param("requesterEmail", "student@ucsb.edu")
                    .param("professorEmail", "professor@ucsb.edu")
                    .param("explanation", "Requesting a letter of recommendation")
                    .param("dateRequested", "2026-10-30T10:00:00")
                    .param("dateNeeded", "2026-11-15T10:00:00")
                    .param("done", "false")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    RecommendationRequest createdRequest =
        mapper.readValue(response.getResponse().getContentAsString(), RecommendationRequest.class);

    assertEquals("student@ucsb.edu", createdRequest.getRequesterEmail());
    assertEquals("professor@ucsb.edu", createdRequest.getProfessorEmail());
    assertEquals("Requesting a letter of recommendation", createdRequest.getExplanation());
    assertEquals(LocalDateTime.parse("2026-10-30T10:00:00"), createdRequest.getDateRequested());
    assertEquals(LocalDateTime.parse("2026-11-15T10:00:00"), createdRequest.getDateNeeded());
    assertEquals(
        false,
        mapper.readTree(response.getResponse().getContentAsString()).get("done").asBoolean());

    assertEquals(countBefore + 1, repository.count());

    RecommendationRequest savedRequest = repository.findById(createdRequest.getId()).orElseThrow();

    assertEquals("student@ucsb.edu", savedRequest.getRequesterEmail());
    assertEquals("professor@ucsb.edu", savedRequest.getProfessorEmail());
    assertEquals("Requesting a letter of recommendation", savedRequest.getExplanation());
    assertEquals(LocalDateTime.parse("2026-10-30T10:00:00"), savedRequest.getDateRequested());
    assertEquals(LocalDateTime.parse("2026-11-15T10:00:00"), savedRequest.getDateNeeded());
  }
}
