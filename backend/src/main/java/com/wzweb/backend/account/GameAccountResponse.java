package com.wzweb.backend.account;

public record GameAccountResponse(
        Long id,
        String name,
        boolean isPrimary
) {
}
