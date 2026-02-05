package br.leetjourney.fincore.core.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Entity
@Table(name = "financial_transactions")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder

public class FinancialTransaction extends BaseEntity{

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_account_id")
    private Account sourceAccount;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_account_id",nullable = false)
    private Account destinationAccount;


    @Column(nullable = false)
    private BigDecimal bigDecimal;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Column(length = 255)
    private String description;


}
