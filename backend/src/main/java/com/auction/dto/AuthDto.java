package com.auction.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDto {

    // ============ 요청 DTO ============

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class SignupRequest {

        @NotBlank(message = "이메일은 필수입니다")
        @Email(message = "올바른 이메일 형식이 아닙니다")
        private String email;

        @NotBlank(message = "비밀번호는 필수입니다")
        @Size(min = 8, max = 20, message = "비밀번호는 8~20자입니다")
        private String password;

        @NotBlank(message = "닉네임은 필수입니다")
        @Size(min = 2, max = 15, message = "닉네임은 2~15자입니다")
        private String nickname;

        private String phone;
        private String zipcode;
        private String address;
        private String addressDetail;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {

        @NotBlank(message = "이메일은 필수입니다")
        @Email
        private String email;

        @NotBlank(message = "비밀번호는 필수입니다")
        private String password;
    }

    // ============ 응답 DTO ============

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class LoginResponse {
        private String token;
        private MemberInfo member;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class MemberInfo {
        private Long id;
        private String email;
        private String nickname;
        private String phone;
        private String zipcode;
        private String address;
        private String addressDetail;
        private String role;
        private String profileImage;
        private String createdAt;
    }
}
