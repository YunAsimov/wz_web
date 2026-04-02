package com.wzweb.backend.teammate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeammateRequest(
        @NotBlank @Size(max = 50) String name
) {
}
