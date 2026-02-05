package br.leetjourney.fincore.core.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "accounts")
@Getter
@ToString(exclude = "customer")
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Account extends BaseEntity {

    @Column(nullable = false, unique = true, length = 10)
    private String accountNumber;

    @Column(nullable = false, length = 4)
    private String agency;

    @Column(nullable = false)
    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

}
