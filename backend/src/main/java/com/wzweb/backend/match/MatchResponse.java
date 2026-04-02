package com.wzweb.backend.match;

import com.wzweb.backend.teammate.TeammateResponse;

import java.time.LocalDate;
import java.util.List;

public record MatchResponse(
        Long id,
        LocalDate date,
        String accountName,
        String season,
        String queueType,
        String role,
        String result,
        List<TeammateResponse> teammates
) {
}
