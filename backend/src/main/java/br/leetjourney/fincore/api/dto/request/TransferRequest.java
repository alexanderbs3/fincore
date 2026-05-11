package br.leetjourney.fincore.api.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record TransferRequest(
        @NotBlank(message = "Conta de origem obrigatória")
        String sourceAccountUuid,

        @NotBlank(message = "Conta de destino obrigatória")
        String destinationAccountUuid,

        @NotNull(message = "O valor é obrigatório")
        @Positive(message = "O valor da transferência deve ser positivo")
        BigDecimal amount,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
        String description
) {
}
