package com.atiprojects.depo.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Data
@Table(name = "users")

public class User {
    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}
