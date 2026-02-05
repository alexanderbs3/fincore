package br.leetjourney.fincore.core.repository;

import br.leetjourney.fincore.core.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account,Long> {
    Optional<Account> findByUuid(String uuid);
    boolean existsByAccountNumber(String accountNumber);
    List<Account> findAllByCustomerUuid(String customerUuid);

    boolean existsByUuid(String accountUuid);
}
