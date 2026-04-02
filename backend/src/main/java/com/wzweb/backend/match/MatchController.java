package com.wzweb.backend.match;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.auth.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService service;
    private final AuthService authService;

    public MatchController(MatchService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    @GetMapping
    public List<MatchResponse> list(HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return service.list(currentUser.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MatchResponse create(@Valid @RequestBody MatchRequest request, HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return service.create(currentUser, request);
    }

    @PostMapping("/batch")
    @ResponseStatus(HttpStatus.CREATED)
    public List<MatchResponse> createBatch(@RequestBody List<@Valid MatchRequest> requests, HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return service.createBatch(currentUser, requests);
    }

    @PutMapping("/{id}")
    public MatchResponse update(@PathVariable Long id, @Valid @RequestBody MatchRequest request, HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return service.update(currentUser.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        service.delete(currentUser.getId(), id);
    }
}
