package com.wzweb.backend.auth;

public record AuthUserResponse(
        Long id,
        String username,
        String displayName
) {
}
