package br.leetjourney.fincore.api.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(

        @NotBlank(message = "O nome completo é obrigatorio")
        @Size(min = 3, max = 150, message = "O nome completo deve ter entre 3 e 150 caracteres")
        String fullName,

        @NotBlank(message = "O documento (CPF/CNPJ) é obrigatorio")
        @Pattern(regexp = "(^\\d{11}$|^\\d{14}$)", message = "Documento deve ter 11 ou 14 dígitos numéricos")
        String documentNumber,

        @NotBlank(message = "O email é obrigatorio")
        @Email(message = "Email invalido")
        String email
) {
}
