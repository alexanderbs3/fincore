package br.leetjourney.fincore.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record TransferRequest(
        @NotBlank String sourceAccountUuid,
        @NotBlank String destinationAccountUuid,
        @NotNull @Positive BigDecimal amount,
        String description
) {
}
