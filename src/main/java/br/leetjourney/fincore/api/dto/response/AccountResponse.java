package br.leetjourney.fincore.api.dto.response;

import br.leetjourney.fincore.core.entity.AccountType;

import java.math.BigDecimal;

public record AccountResponse(String uuid,
                              String accountNumber,
                              String agency,
                              BigDecimal balance,
                              AccountType type) {
}
