package com.wzweb.backend.match;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record MatchRequest(
        @NotNull LocalDate date,
        @NotBlank @Size(max = 80) String accountName,
        @NotBlank String season,
        @NotBlank String queueType,
        @NotBlank String role,
        @NotBlank String result,
        @Size(max = 4) List<Long> teammateIds
) {
}
