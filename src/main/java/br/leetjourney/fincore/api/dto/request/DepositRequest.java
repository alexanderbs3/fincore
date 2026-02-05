package br.leetjourney.fincore.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record DepositRequest(@NotBlank String accountUuid,
                             @NotNull @Positive BigDecimal amount) {
}
