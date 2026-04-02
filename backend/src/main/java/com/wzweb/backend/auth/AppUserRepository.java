package com.wzweb.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByUsernameAndEnabledTrue(String username);

    Optional<AppUser> findByUsername(String username);

    Optional<AppUser> findFirstByEnabledTrueAndUsernameNotOrderByIdAsc(String username);

    Optional<AppUser> findFirstByEnabledTrueOrderByIdAsc();
}
