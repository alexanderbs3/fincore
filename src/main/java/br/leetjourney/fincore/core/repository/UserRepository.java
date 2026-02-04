package br.leetjourney.fincore.core.repository;

import br.leetjourney.fincore.api.dto.RegisterRequest;
import br.leetjourney.fincore.core.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);

    // Alternativa sênior: existsBy para verificações rápidas de boolean
    boolean existsByEmail(String email);
}
