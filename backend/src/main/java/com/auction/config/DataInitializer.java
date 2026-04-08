package com.auction.config;

import com.auction.entity.Member;
import com.auction.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 관리자 계정
        createMemberIfNotExists(
                "admin@auction.com",
                "admin1234",
                "관리자",
                "010-0000-0000",
                Member.Role.ADMIN
        );

        // 테스트 유저 1
        createMemberIfNotExists(
                "user1@test.com",
                "test1234",
                "테스트유저1",
                "010-1111-1111",
                Member.Role.USER
        );

        // 테스트 유저 2
        createMemberIfNotExists(
                "user2@test.com",
                "test1234",
                "테스트유저2",
                "010-2222-2222",
                Member.Role.USER
        );
    }

    private void createMemberIfNotExists(String email, String rawPassword,
                                          String nickname, String phone,
                                          Member.Role role) {
        if (memberRepository.existsByEmail(email)) {
            // 이미 존재하면 비밀번호만 갱신 (해시 불일치 문제 해결)
            Member member = memberRepository.findByEmail(email).get();
            member.setPassword(passwordEncoder.encode(rawPassword));
            memberRepository.save(member);
            log.info("계정 비밀번호 갱신: {} ({})", email, role);
        } else {
            Member member = Member.builder()
                    .email(email)
                    .password(passwordEncoder.encode(rawPassword))
                    .nickname(nickname)
                    .phone(phone)
                    .role(role)
                    .build();
            memberRepository.save(member);
            log.info("계정 생성: {} ({})", email, role);
        }
    }
}
