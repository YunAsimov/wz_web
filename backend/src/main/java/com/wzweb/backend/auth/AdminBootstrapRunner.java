package com.wzweb.backend.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${BOOTSTRAP_ADMIN_USERNAME:}")
    private String username;

    @Value("${BOOTSTRAP_ADMIN_PASSWORD:}")
    private String password;

    @Value("${BOOTSTRAP_ADMIN_DISPLAY_NAME:系统管理员}")
    private String displayName;

    public AdminBootstrapRunner(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return;
        }

        if (appUserRepository.findByUsername(username).isPresent()) {
            return;
        }

        AppUser user = new AppUser();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setDisplayName(displayName == null || displayName.isBlank() ? username : displayName);
        user.setEnabled(true);
        appUserRepository.save(user);
    }
}
