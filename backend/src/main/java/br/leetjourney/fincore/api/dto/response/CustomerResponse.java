package br.leetjourney.fincore.api.dto.response;

import br.leetjourney.fincore.core.entity.CustomerStatus;

import java.time.LocalDateTime;

public record CustomerResponse(
        String uuid,
        String fullName,
        String documentNumber,
        String email,
        CustomerStatus status,
        LocalDateTime createdAt
) {
}
