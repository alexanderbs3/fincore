package br.leetjourney.fincore.core.service;

import br.leetjourney.fincore.api.dto.request.DepositRequest;
import br.leetjourney.fincore.api.dto.request.TransactionResponse;
import br.leetjourney.fincore.api.dto.request.TransferRequest;
import br.leetjourney.fincore.api.exception.BusinessException;
import br.leetjourney.fincore.core.entity.Account;
import br.leetjourney.fincore.core.entity.FinancialTransaction;
import br.leetjourney.fincore.core.entity.TransactionType;
import br.leetjourney.fincore.core.repository.AccountRepository;
import br.leetjourney.fincore.core.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        Account account = accountRepository.findByUuid(request.accountUuid())
                .orElseThrow(() -> new BusinessException("Conta não encontrada."));

        // Atualiza saldo - BigDecimal é imutável, por isso o set com o resultado do add
        account.setBalance(account.getBalance().add(request.amount()));
        accountRepository.save(account);

        var transaction = FinancialTransaction.builder()
                .destinationAccount(account)
                .amount(request.amount())
                .type(TransactionType.DEPOSIT)
                .description("Depósito via API")
                .build();

        var savedTransaction = transactionRepository.save(transaction);
        return toResponse(savedTransaction);
    }

    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        var source = accountRepository.findByUuid(request.sourceAccountUuid())
                .orElseThrow(() -> new BusinessException("Conta de origem não encontrada"));

        var destination = accountRepository.findByUuid(request.destinationAccountUuid())
                .orElseThrow(() -> new BusinessException("Conta de destino não encontrada"));

        // Validação de saldo: compareTo retorna -1 se for menor
        if (source.getBalance().compareTo(request.amount()) < 0) {
            throw new BusinessException("Saldo insuficiente para a transferência");
        }

        source.setBalance(source.getBalance().subtract(request.amount()));
        destination.setBalance(destination.getBalance().add(request.amount()));

        accountRepository.saveAll(List.of(source, destination));

        var transaction = FinancialTransaction.builder()
                .sourceAccount(source)
                .destinationAccount(destination)
                .amount(request.amount())
                .type(TransactionType.TRANSFER)
                .description(request.description())
                .build();

        var savedTransaction = transactionRepository.save(transaction);
        return toResponse(savedTransaction);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getStatement(String accountUuid, Pageable pageable) {
        if (!accountRepository.existsByUuid(accountUuid)) {
            throw new BusinessException("Conta não encontrada para gerar extrato");
        }
        return transactionRepository.findStatementByAccountUuid(accountUuid, pageable)
                .map(this::toResponse);
    }

    /**
     * Mapeamento unificado.
     * Se TransactionResponse for um RECORD, use o construtor.
     * Se for uma CLASSE com @Builder, use TransactionResponse.builder()...
     */
    private TransactionResponse toResponse(FinancialTransaction tx) {
        return new TransactionResponse(
                tx.getUuid(),
                tx.getAmount(),
                tx.getType(),
                tx.getCreatedAt(),
                tx.getDescription(),
                tx.getSourceAccount() != null ? tx.getSourceAccount().getUuid() : null,
                tx.getDestinationAccount().getUuid()
        );
    }
}