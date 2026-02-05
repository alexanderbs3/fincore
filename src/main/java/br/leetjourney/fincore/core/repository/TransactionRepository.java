package br.leetjourney.fincore.core.repository;

import br.leetjourney.fincore.core.entity.FinancialTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    List<FinancialTransaction> findAllBySourceAccountUuidOrDestinationAccountUuidOrderByCreatedAtDesc(
            String sourceUuid, String destinationUuid);

    // Busca transações onde a conta é origem OU destino, ordenando pela data de criação decrescente
    @Query("SELECT t FROM FinancialTransaction t " +
            "WHERE t.sourceAccount.uuid = :accountUuid OR t.destinationAccount.uuid = :accountUuid")
    Page<FinancialTransaction> findStatementByAccountUuid(
            @Param("accountUuid") String accountUuid,
            Pageable pageable);
}