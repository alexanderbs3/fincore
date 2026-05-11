package br.leetjourney.fincore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class FincoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(FincoreApplication.class, args);
    }

}
