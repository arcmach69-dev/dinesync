package com.dinesync.user_service.security;


import com.dinesync.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(
            @RequestBody Map<String, String> request) {

        String email = request.get("email");
        String password = request.get("password");

        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder
                    .matches(password, user.getPassword()))
                .map(user -> {
                    String token = jwtUtil.generateToken(
                        user.getEmail(), 
                        user.getRole().name());
                    Map<String, String> response = new HashMap<>();
                    response.put("token", token);
                    response.put("role", user.getRole().name());
                    response.put("email", user.getEmail());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).build());
    }
}