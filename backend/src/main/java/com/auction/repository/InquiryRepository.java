package com.auction.repository;

import com.auction.entity.Inquiry;
import com.auction.entity.Inquiry.InquiryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    Page<Inquiry> findByMemberIdOrderByCreatedAtDesc(Long memberId, Pageable pageable);

    Page<Inquiry> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByStatus(InquiryStatus status);
}
