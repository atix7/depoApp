package com.atiprojects.depo.controller;

import com.atiprojects.depo.dto.JwtResponse;
import com.atiprojects.depo.dto.LoginRequest;
import com.atiprojects.depo.entity.User;
import com.atiprojects.depo.repository.UserRepository;
import com.atiprojects.depo.security.JwtUtil;
import com.atiprojects.depo.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest request,
                                             HttpServletResponse response) {
        UserDetails userDetails = authService.authenticate(request);
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        String token = jwtUtil.generateToken(userDetails.getUsername(), role);

        ResponseCookie cookie = ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(86400)
                .sameSite("Strict")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new JwtResponse(userDetails.getUsername(), role));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
        return ResponseEntity.ok(user);
    }
}