package com.github.logi.domain.essay.entity;

import com.github.logi.domain.user.entity.User;
import com.github.logi.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "essays")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Essay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "company_name", length = 100, nullable = false)
    private String companyName;

    @Column(name = "global_req", columnDefinition = "TEXT", nullable = false)
    private String globalReq;

    @Column(name = "job", length = 100, nullable = false)
    private String job;

    @Enumerated(EnumType.STRING)
    @Column(name = "progress", length = 20, nullable = false)
    private Progress progress;
}
