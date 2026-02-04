package br.leetjourney.fincore.api.controller;

import br.leetjourney.fincore.api.dto.request.AccountRequest;
import br.leetjourney.fincore.api.dto.response.AccountResponse;
import br.leetjourney.fincore.core.security.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> create(@RequestBody @Valid AccountRequest request) {
        var accountResponse = accountService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(accountResponse);
    }
}
