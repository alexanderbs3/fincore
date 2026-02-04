package br.leetjourney.fincore.api.dto;

import br.leetjourney.fincore.core.entity.UserRole;

public record RegisterRequest(String email, String password, UserRole role) {
}
