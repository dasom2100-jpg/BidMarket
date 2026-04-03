package com.auction.config;

import com.auction.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (JWT 사용하므로)
            .csrf(csrf -> csrf.disable())

            // 세션 사용 안 함 (Stateless)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 요청별 접근 권한 설정
            .authorizeHttpRequests(auth -> auth
                // === 인증 없이 접근 가능 ===
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/health").permitAll()

                // /api/products/my는 로그인 필요 (와일드카드보다 먼저 선언!)
                .requestMatchers(HttpMethod.GET, "/api/products/my").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/notices/**").permitAll()

                // 입찰 내역 조회는 공개, 내 입찰은 로그인 필요
                .requestMatchers(HttpMethod.GET, "/api/bids/my").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/bids/product/**").permitAll()

                .requestMatchers("/uploads/**").permitAll()

                // === 관리자 전용 ===
                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // === 나머지는 로그인 필요 ===
                .anyRequest().authenticated()
            )

            // JWT 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
            .addFilterBefore(jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
