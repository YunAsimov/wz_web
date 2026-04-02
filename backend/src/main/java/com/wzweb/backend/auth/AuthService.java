package com.wzweb.backend.auth;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthUserResponse login(LoginRequest request, HttpSession session) {
        AppUser user = appUserRepository.findByUsernameAndEnabledTrue(request.username())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户名或密码错误"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "用户名或密码错误");
        }

        session.setAttribute(SessionConstants.USER_ID, user.getId());
        return toResponse(user);
    }

    public AuthUserResponse currentUser(HttpSession session) {
        return toResponse(requireCurrentUserEntity(session));
    }

    public AppUser requireCurrentUserEntity(HttpSession session) {
        Object userId = session.getAttribute(SessionConstants.USER_ID);
        if (!(userId instanceof Long id)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "请先登录");
        }

        return appUserRepository.findById(id)
                .filter(AppUser::isEnabled)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "登录状态已失效"));
    }

    public void logout(HttpSession session) {
        session.invalidate();
    }

    private AuthUserResponse toResponse(AppUser user) {
        return new AuthUserResponse(user.getId(), user.getUsername(), user.getDisplayName());
    }
}
