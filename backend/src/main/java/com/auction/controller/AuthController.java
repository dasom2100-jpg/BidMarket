package com.auction.controller;

import com.auction.dto.ApiResponse;
import com.auction.dto.AuthDto;
import com.auction.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * 회원가입
     * POST /api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthDto.MemberInfo>> signup(
            @Valid @RequestBody AuthDto.SignupRequest request) {
        AuthDto.MemberInfo member = authService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 완료되었습니다", member));
    }

    /**
     * 로그인
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthDto.LoginResponse>> login(
            @Valid @RequestBody AuthDto.LoginRequest request) {
        AuthDto.LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("로그인 성공", response));
    }

    /**
     * 내 정보 조회
     * GET /api/auth/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<AuthDto.MemberInfo>> getMyInfo(
            Authentication authentication) {
        Long memberId = (Long) authentication.getPrincipal();
        AuthDto.MemberInfo info = authService.getMyInfo(memberId);
        return ResponseEntity.ok(ApiResponse.success(info));
    }

    /**
     * 내 정보 수정
     * PUT /api/auth/me
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<AuthDto.MemberInfo>> updateMyInfo(
            Authentication authentication,
            @Valid @RequestBody AuthDto.SignupRequest request) {
        Long memberId = (Long) authentication.getPrincipal();
        AuthDto.MemberInfo info = authService.updateMyInfo(memberId, request);
        return ResponseEntity.ok(ApiResponse.success("회원정보가 수정되었습니다", info));
    }

    /**
     * 이메일 중복 확인
     * GET /api/auth/check-email?email=xxx
     */
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmail(@RequestParam String email) {
        boolean exists = authService.checkEmailDuplicate(email);
        String msg = exists ? "이미 사용중인 이메일입니다" : "사용 가능한 이메일입니다";
        return ResponseEntity.ok(ApiResponse.success(msg, exists));
    }

    /**
     * 닉네임 중복 확인
     * GET /api/auth/check-nickname?nickname=xxx
     */
    @GetMapping("/check-nickname")
    public ResponseEntity<ApiResponse<Boolean>> checkNickname(@RequestParam String nickname) {
        boolean exists = authService.checkNicknameDuplicate(nickname);
        String msg = exists ? "이미 사용중인 닉네임입니다" : "사용 가능한 닉네임입니다";
        return ResponseEntity.ok(ApiResponse.success(msg, exists));
    }
}
