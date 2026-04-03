package com.auction.service;

import com.auction.dto.AuthDto;
import com.auction.entity.Member;
import com.auction.repository.MemberRepository;
import com.auction.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 회원가입
     */
    @Transactional
    public AuthDto.MemberInfo signup(AuthDto.SignupRequest request) {
        // 중복 검사
        if (memberRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다");
        }
        if (memberRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다");
        }

        // 회원 생성
        Member member = Member.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .phone(request.getPhone())
                .zipcode(request.getZipcode())
                .address(request.getAddress())
                .addressDetail(request.getAddressDetail())
                .build();

        member = memberRepository.save(member);

        return toMemberInfo(member);
    }

    /**
     * 로그인
     */
    public AuthDto.LoginResponse login(AuthDto.LoginRequest request) {
        Member member = memberRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다"));

        if (!passwordEncoder.matches(request.getPassword(), member.getPassword())) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 일치하지 않습니다");
        }

        if (!member.getIsActive()) {
            throw new IllegalArgumentException("비활성화된 계정입니다. 관리자에게 문의하세요");
        }

        // JWT 토큰 생성
        String token = jwtTokenProvider.createToken(
                member.getId(),
                member.getEmail(),
                member.getRole().name()
        );

        return AuthDto.LoginResponse.builder()
                .token(token)
                .member(toMemberInfo(member))
                .build();
    }

    /**
     * 내 정보 조회
     */
    public AuthDto.MemberInfo getMyInfo(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));
        return toMemberInfo(member);
    }

    /**
     * 회원 정보 수정
     */
    @Transactional
    public AuthDto.MemberInfo updateMyInfo(Long memberId, AuthDto.SignupRequest request) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));

        // 닉네임 중복 검사 (본인 제외)
        if (!member.getNickname().equals(request.getNickname())
                && memberRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용중인 닉네임입니다");
        }

        member.setNickname(request.getNickname());
        member.setPhone(request.getPhone());
        member.setZipcode(request.getZipcode());
        member.setAddress(request.getAddress());
        member.setAddressDetail(request.getAddressDetail());

        // 비밀번호 변경 (입력한 경우만)
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            member.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toMemberInfo(member);
    }

    /**
     * 이메일 중복 확인
     */
    public boolean checkEmailDuplicate(String email) {
        return memberRepository.existsByEmail(email);
    }

    /**
     * 닉네임 중복 확인
     */
    public boolean checkNicknameDuplicate(String nickname) {
        return memberRepository.existsByNickname(nickname);
    }

    // === Private Helper ===

    private AuthDto.MemberInfo toMemberInfo(Member member) {
        return AuthDto.MemberInfo.builder()
                .id(member.getId())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .phone(member.getPhone())
                .zipcode(member.getZipcode())
                .address(member.getAddress())
                .addressDetail(member.getAddressDetail())
                .role(member.getRole().name())
                .profileImage(member.getProfileImage())
                .createdAt(member.getCreatedAt().toString())
                .build();
    }
}
