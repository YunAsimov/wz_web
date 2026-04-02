package com.wzweb.backend.account;

import com.wzweb.backend.auth.AppUser;
import com.wzweb.backend.auth.AuthService;
import jakarta.servlet.http.HttpSession;
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
@RequestMapping("/api/game-accounts")
public class GameAccountController {

    private final GameAccountService service;
    private final AuthService authService;

    public GameAccountController(GameAccountService service, AuthService authService) {
        this.service = service;
        this.authService = authService;
    }

    @GetMapping
    public List<GameAccountResponse> list(HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return service.list(currentUser.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GameAccountResponse create(@RequestBody GameAccountRequest request, HttpSession session) {
        AppUser currentUser = authService.requireCurrentUserEntity(session);
        return service.create(currentUser, request);
    }

    @PutMapping("/{id}")
    public GameAccountResponse update(@PathVariable Long id, @RequestBody GameAccountRequest request, HttpSession session) {
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
