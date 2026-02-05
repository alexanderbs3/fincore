package br.leetjourney.fincore.api.dto.request;

import br.leetjourney.fincore.core.entity.TransactionType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Builder
public record TransactionResponse(
        String uuid,
        BigDecimal amount,
        TransactionType type,
        LocalDateTime createdAt,
        String description,
        String sourceAccountUuid,
        String destinationAccountUuid
) {
}
