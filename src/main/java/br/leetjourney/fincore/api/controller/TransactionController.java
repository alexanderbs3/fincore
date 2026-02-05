package br.leetjourney.fincore.api.controller;

import br.leetjourney.fincore.api.dto.request.DepositRequest;
import br.leetjourney.fincore.api.dto.response.TransactionResponse;
import br.leetjourney.fincore.api.dto.request.TransferRequest;
import br.leetjourney.fincore.core.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(@Valid @RequestBody DepositRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.deposit(request));
    }

    @Operation(summary = "Realiza uma transferência", description = "Transfere valores entre duas contas com garantia de atomicidade (ACID)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Transferência realizada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Saldo insuficiente ou dados inválidos"),
            @ApiResponse(responseCode = "403", description = "Token JWT inválido ou expirado")
    })
    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.transfer(request));
    }

    @GetMapping("/statement/{accountUuid}")
    public ResponseEntity<Page<TransactionResponse>> getStatement(
            @PathVariable String accountUuid,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {


        return ResponseEntity.ok(transactionService.getStatement(accountUuid, pageable));
    }
}
