package br.leetjourney.fincore.core.service;

import br.leetjourney.fincore.api.dto.request.DepositRequest;
import br.leetjourney.fincore.api.dto.response.TransactionResponse;
import br.leetjourney.fincore.api.dto.request.TransferRequest;
import br.leetjourney.fincore.api.exception.BusinessException;
import br.leetjourney.fincore.core.entity.Account;
import br.leetjourney.fincore.core.entity.FinancialTransaction;
import br.leetjourney.fincore.core.entity.TransactionType;
import br.leetjourney.fincore.core.repository.AccountRepository;
import br.leetjourney.fincore.core.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Log4j2
public class TransactionService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public TransactionResponse deposit(DepositRequest request) {
        log.info("Iniciando deposito {}", request.accountUuid());

        Account account = accountRepository.findByUuidWithLock(request.accountUuid())
                .orElseThrow(() -> new BusinessException("Conta não encontrada para deposito "));


        account.setBalance(account.getBalance().add(request.amount()));
        accountRepository.save(account);

        var transaction = FinancialTransaction.builder()
                .destinationAccount(account)
                .amount(request.amount())
                .type(TransactionType.DEPOSIT)
                .description("Deposito via API")
                .build();

        log.info("Depósito de {} realizado com sucesso na conta {}", request.amount(), account.getAccountNumber());
        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        log.info("Iniciando transferência da conta {} para {}", request.sourceAccountUuid(), request.destinationAccountUuid());

        // Lock em ambas as contas (ordem consistente evita deadlocks)
        Account source = accountRepository.findByUuidWithLock(request.sourceAccountUuid())
                .orElseThrow(() -> new BusinessException("Conta de origem não encontrada."));

        Account destination = accountRepository.findByUuidWithLock(request.destinationAccountUuid())
                .orElseThrow(() -> new BusinessException("Conta de destino não encontrada."));

        if (source.getBalance().compareTo(request.amount()) < 0) {
            log.error("Saldo insuficiente na conta {}. Saldo atual: {}", source.getUuid(), source.getBalance());
            throw new BusinessException("Saldo insuficiente para a operação.");
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

        return toResponse(transactionRepository.save(transaction));
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getStatement(String accountUuid, Pageable pageable) {
        log.debug("Buscando extrato para a conta: {}", accountUuid);
        if (!accountRepository.existsByUuid(accountUuid)) {
            throw new BusinessException("Conta inexistente.");
        }
        return transactionRepository.findStatementByAccountUuid(accountUuid, pageable)
                .map(this::toResponse);
    }

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