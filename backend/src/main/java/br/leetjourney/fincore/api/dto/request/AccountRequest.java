package br.leetjourney.fincore.api.dto.request;

import br.leetjourney.fincore.core.entity.AccountType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AccountRequest(@NotBlank String customerUuid,
                             @NotNull AccountType type) {
}
