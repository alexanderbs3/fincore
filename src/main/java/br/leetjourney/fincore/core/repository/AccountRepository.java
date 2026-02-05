package br.leetjourney.fincore.core.repository;

import br.leetjourney.fincore.core.entity.Account;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account,Long> {
    Optional<Account> findByUuid(String uuid);

    // O SELECT ... FOR UPDATE bloqueia a linha no MySQL até o commit/rollback
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Account a WHERE a.uuid = :uuid")
    Optional<Account> findByUuidWithLock(@Param("uuid") String uuid);

    boolean existsByUuid(String uuid);

    boolean existsByAccountNumber(String number);
}
