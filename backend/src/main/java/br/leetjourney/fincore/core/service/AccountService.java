package br.leetjourney.fincore.core.service;

import br.leetjourney.fincore.api.dto.request.AccountRequest;
import br.leetjourney.fincore.api.dto.response.AccountResponse;
import br.leetjourney.fincore.core.entity.Account;
import br.leetjourney.fincore.core.repository.AccountRepository;
import br.leetjourney.fincore.core.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;

     @Transactional
    public AccountResponse create(AccountRequest request) {
        var customer = customerRepository.findByUuid(request.customerUuid())
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado para UUID encontrado"));


        String accountNumber = generateUniqueAccountNumber();

        var account = Account.builder()
                .accountNumber(accountNumber)
                .agency("0001")
                .balance(BigDecimal.ZERO)
                .type(request.type())
                .customer(customer)
                .build();

        var savedAccount = accountRepository.save(account);
        return toResponse(savedAccount);
    }


    public Page<AccountResponse> findAll(Pageable pageable){
         return accountRepository.findAll(pageable)
                 .map(this::toResponse);
    }

    private String generateUniqueAccountNumber() {
        String number;
        do {
            number = String.valueOf((int) (Math.random() * 900000) + 100000);
        } while (accountRepository.existsByAccountNumber(number));
        return number;
    }


    private AccountResponse toResponse(Account account) {
        return new AccountResponse(
                account.getUuid(),
                account.getAccountNumber(),
                account.getAgency(),
                account.getBalance(),
                account.getType()
        );
    }

}
