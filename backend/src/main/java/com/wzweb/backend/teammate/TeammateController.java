package com.wzweb.backend.teammate;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.auth.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/teammates")
public class TeammateController {

    private final TeammateService teammateService;
    private final AuthService authService;

    public TeammateController(TeammateService teammateService, AuthService authService) {
        this.teammateService = teammateService;
        this.authService = authService;
    }

    @GetMapping
    public List<TeammateResponse> list(HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return teammateService.list(currentUser.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeammateResponse create(@Valid @RequestBody TeammateRequest request, HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return teammateService.create(currentUser, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        teammateService.delete(currentUser.getId(), id);
    }
}
