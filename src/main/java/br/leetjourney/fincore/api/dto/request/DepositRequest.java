package br.leetjourney.fincore.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record DepositRequest(@NotBlank(message = "O UUID da conta é obrigatório")
                             String accountUuid,

                             @NotNull(message = "O valor é obrigatório")
                             @Positive(message = "O valor do depósito deve ser maior que zero")
                             BigDecimal amount) {
}
