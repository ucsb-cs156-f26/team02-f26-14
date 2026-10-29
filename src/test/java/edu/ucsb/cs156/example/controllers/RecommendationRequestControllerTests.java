package edu.ucsb.cs156.example.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import edu.ucsb.cs156.example.ControllerTestCase;
import edu.ucsb.cs156.example.entities.RecommendationRequest;
import edu.ucsb.cs156.example.repositories.RecommendationRequestRepository;
import edu.ucsb.cs156.example.repositories.UserRepository;
import edu.ucsb.cs156.example.testconfig.TestConfig;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MvcResult;

@WebMvcTest(controllers = RecommendationRequestController.class)
@Import(TestConfig.class)
public class RecommendationRequestControllerTests extends ControllerTestCase {

  @MockitoBean RecommendationRequestRepository recommendationRequestRepository;

  @MockitoBean UserRepository userRepository;

  // Authorization tests for GET /api/RecommendationRequest/all

  @Test
  public void logged_out_users_cannot_get_all() throws Exception {
    mockMvc.perform(get("/api/RecommendationRequest/all")).andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_users_can_get_all() throws Exception {
    mockMvc.perform(get("/api/RecommendationRequest/all")).andExpect(status().is(200));
  }

  // Authorization tests for POST /api/RecommendationRequest/post

  @Test
  public void logged_out_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/RecommendationRequest/post")
                .param("requesterEmail", "student@example.com")
                .param("professorEmail", "professor@example.com")
                .param("explanation", "Requesting a recommendation")
                .param("dateRequested", "2026-10-21T10:00:00")
                .param("dateNeeded", "2026-11-15T00:00:00")
                .param("done", "false")
                .with(csrf()))
        .andExpect(status().is(403));
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_regular_users_cannot_post() throws Exception {
    mockMvc
        .perform(
            post("/api/RecommendationRequest/post")
                .param("requesterEmail", "student@example.com")
                .param("professorEmail", "professor@example.com")
                .param("explanation", "Requesting a recommendation")
                .param("dateRequested", "2026-10-21T10:00:00")
                .param("dateNeeded", "2026-11-15T00:00:00")
                .param("done", "false")
                .with(csrf()))
        .andExpect(status().is(403));
  }

  // Tests for GET /api/RecommendationRequest/all

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_all_recommendation_requests() throws Exception {
    RecommendationRequest request1 =
        RecommendationRequest.builder()
            .requesterEmail("student1@example.com")
            .professorEmail("professor1@example.com")
            .explanation("Graduate school recommendation")
            .dateRequested(LocalDateTime.parse("2026-10-21T10:00:00"))
            .dateNeeded(LocalDateTime.parse("2026-11-15T00:00:00"))
            .done(false)
            .build();

    RecommendationRequest request2 =
        RecommendationRequest.builder()
            .requesterEmail("student2@example.com")
            .professorEmail("professor2@example.com")
            .explanation("Internship recommendation")
            .dateRequested(LocalDateTime.parse("2026-10-22T11:00:00"))
            .dateNeeded(LocalDateTime.parse("2026-12-01T00:00:00"))
            .done(true)
            .build();

    ArrayList<RecommendationRequest> expectedRequests = new ArrayList<>();
    expectedRequests.addAll(Arrays.asList(request1, request2));

    when(recommendationRequestRepository.findAll()).thenReturn(expectedRequests);

    MvcResult response =
        mockMvc
            .perform(get("/api/RecommendationRequest/all"))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).findAll();

    String expectedJson = mapper.writeValueAsString(expectedRequests);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  // Tests for GET /api/RecommendationRequest?id=...

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_can_get_recommendation_request_by_id() throws Exception {
    RecommendationRequest request =
        RecommendationRequest.builder()
            .requesterEmail("student@example.com")
            .professorEmail("professor@example.com")
            .explanation("Graduate school recommendation")
            .dateRequested(LocalDateTime.parse("2026-10-21T10:00:00"))
            .dateNeeded(LocalDateTime.parse("2026-11-15T00:00:00"))
            .done(false)
            .build();

    when(recommendationRequestRepository.findById(1L)).thenReturn(Optional.of(request));

    MvcResult response =
        mockMvc
            .perform(get("/api/RecommendationRequest?id=1"))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).findById(1L);

    String expectedJson = mapper.writeValueAsString(request);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"USER"})
  @Test
  public void logged_in_user_getting_nonexistent_recommendation_request_returns_not_found()
      throws Exception {
    when(recommendationRequestRepository.findById(1L)).thenReturn(Optional.empty());

    mockMvc.perform(get("/api/RecommendationRequest?id=1")).andExpect(status().isNotFound());

    verify(recommendationRequestRepository, times(1)).findById(1L);
  }

  // Tests for POST /api/RecommendationRequest/post

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_new_recommendation_request() throws Exception {
    LocalDateTime dateRequested = LocalDateTime.parse("2026-10-21T10:00:00");
    LocalDateTime dateNeeded = LocalDateTime.parse("2026-11-15T00:00:00");

    RecommendationRequest request =
        RecommendationRequest.builder()
            .requesterEmail("student@example.com")
            .professorEmail("professor@example.com")
            .explanation("Requesting a recommendation")
            .dateRequested(dateRequested)
            .dateNeeded(dateNeeded)
            .done(false)
            .build();

    when(recommendationRequestRepository.save(eq(request))).thenReturn(request);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/RecommendationRequest/post")
                    .param("requesterEmail", "student@example.com")
                    .param("professorEmail", "professor@example.com")
                    .param("explanation", "Requesting a recommendation")
                    .param("dateRequested", "2026-10-21T10:00:00")
                    .param("dateNeeded", "2026-11-15T00:00:00")
                    .param("done", "false")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).save(eq(request));

    String expectedJson = mapper.writeValueAsString(request);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_post_a_completed_recommendation_request() throws Exception {
    LocalDateTime dateRequested = LocalDateTime.parse("2026-10-21T10:00:00");
    LocalDateTime dateNeeded = LocalDateTime.parse("2026-11-15T00:00:00");

    RecommendationRequest request =
        RecommendationRequest.builder()
            .requesterEmail("student@example.com")
            .professorEmail("professor@example.com")
            .explanation("Requesting a recommendation")
            .dateRequested(dateRequested)
            .dateNeeded(dateNeeded)
            .done(true)
            .build();

    when(recommendationRequestRepository.save(eq(request))).thenReturn(request);

    MvcResult response =
        mockMvc
            .perform(
                post("/api/RecommendationRequest/post")
                    .param("requesterEmail", "student@example.com")
                    .param("professorEmail", "professor@example.com")
                    .param("explanation", "Requesting a recommendation")
                    .param("dateRequested", "2026-10-21T10:00:00")
                    .param("dateNeeded", "2026-11-15T00:00:00")
                    .param("done", "true")
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).save(eq(request));

    String expectedJson = mapper.writeValueAsString(request);
    String responseString = response.getResponse().getContentAsString();
    assertEquals(expectedJson, responseString);
  }

  // Tests for PUT /api/RecommendationRequest

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_update_a_recommendation_request() throws Exception {
    LocalDateTime dateRequested = LocalDateTime.parse("2026-10-21T10:00:00");
    LocalDateTime dateNeeded = LocalDateTime.parse("2026-11-15T00:00:00");

    RecommendationRequest existing =
        RecommendationRequest.builder()
            .requesterEmail("old@example.com")
            .professorEmail("oldprofessor@example.com")
            .explanation("Old explanation")
            .dateRequested(dateRequested)
            .dateNeeded(dateNeeded)
            .done(false)
            .build();

    RecommendationRequest incoming =
        RecommendationRequest.builder()
            .requesterEmail("new@example.com")
            .professorEmail("newprofessor@example.com")
            .explanation("Updated explanation")
            .dateRequested(LocalDateTime.parse("2026-10-22T11:00:00"))
            .dateNeeded(LocalDateTime.parse("2026-12-01T00:00:00"))
            .done(true)
            .build();

    when(recommendationRequestRepository.findById(1L)).thenReturn(Optional.of(existing));

    MvcResult response =
        mockMvc
            .perform(
                put("/api/RecommendationRequest?id=1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(mapper.writeValueAsString(incoming))
                    .with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).save(existing);

    assertEquals("new@example.com", existing.getRequesterEmail());
    assertEquals("newprofessor@example.com", existing.getProfessorEmail());
    assertEquals("Updated explanation", existing.getExplanation());
    assertEquals(LocalDateTime.parse("2026-10-22T11:00:00"), existing.getDateRequested());
    assertEquals(LocalDateTime.parse("2026-12-01T00:00:00"), existing.getDateNeeded());
    assertEquals(true, existing.getDone());
    assertEquals(mapper.writeValueAsString(existing), response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_cannot_update_a_nonexistent_recommendation_request() throws Exception {
    when(recommendationRequestRepository.findById(1L)).thenReturn(Optional.empty());

    RecommendationRequest incoming =
        RecommendationRequest.builder()
            .requesterEmail("student@example.com")
            .professorEmail("professor@example.com")
            .explanation("Updated explanation")
            .dateRequested(LocalDateTime.parse("2026-10-21T10:00:00"))
            .dateNeeded(LocalDateTime.parse("2026-11-15T00:00:00"))
            .done(false)
            .build();

    mockMvc
        .perform(
            put("/api/RecommendationRequest?id=1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(incoming))
                .with(csrf()))
        .andExpect(status().isNotFound());
  }

  // Tests for DELETE /api/RecommendationRequest

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_can_delete_a_recommendation_request() throws Exception {
    when(recommendationRequestRepository.existsById(1L)).thenReturn(true);

    MvcResult response =
        mockMvc
            .perform(delete("/api/RecommendationRequest?id=1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    verify(recommendationRequestRepository, times(1)).deleteById(1L);
    assertEquals("record 1 deleted", response.getResponse().getContentAsString());
  }

  @WithMockUser(roles = {"ADMIN", "USER"})
  @Test
  public void an_admin_user_cannot_delete_a_nonexistent_recommendation_request() throws Exception {
    when(recommendationRequestRepository.existsById(1L)).thenReturn(false);

    MvcResult response =
        mockMvc
            .perform(delete("/api/RecommendationRequest?id=1").with(csrf()))
            .andExpect(status().isNotFound())
            .andReturn();

    verify(recommendationRequestRepository, times(0)).deleteById(1L);
    assertEquals("record 1 not found", response.getResponse().getContentAsString());
  }
}
