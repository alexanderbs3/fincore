package br.leetjourney.fincore.core.entity;

public enum TransactionType {
    DEPOSIT("Depósito"),
    WITHDRAWAL("Saque"),
    TRANSFER("Transferência"),
    PAYMENT("Pagamento");

    private final String description;

    TransactionType(String description) {
        this.description = description;
        }

    public String getDescription() {
        return description;
    }
}
