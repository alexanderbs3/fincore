package br.leetjourney.fincore.api.controller;

import br.leetjourney.fincore.api.dto.AuthenticationRequest;
import br.leetjourney.fincore.api.dto.LoginResponseRequest;
import br.leetjourney.fincore.api.dto.RegisterRequest;
import br.leetjourney.fincore.core.entity.User;
import br.leetjourney.fincore.core.repository.UserRepository;
import br.leetjourney.fincore.core.security.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;


    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationRequest data){
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((User) auth.getPrincipal());
        return ResponseEntity.ok(new LoginResponseRequest(token));
    }

    @PostMapping("/register")
    public ResponseEntity register(@RequestBody @Valid RegisterRequest data){
        if (this.userRepository.existsByEmail(data.email())){
            return ResponseEntity.badRequest().build();
        }

        String encryptedPassword = passwordEncoder.encode(data.password());
        User newUser = User.builder()
                .email(data.email())
                .password(encryptedPassword)
                .role(data.role())
                .build();

        this.userRepository.save(newUser);

        return ResponseEntity.ok().build();


    }
}
